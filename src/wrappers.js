import { initRenderer } from "./renderer.js";

export function initPainterOnly(params) {
  const { styleLayer, spriteObject, canvasSize = 512 } = params;

  const painter = initRenderer(styleLayer, spriteObject, canvasSize);

  return function(context, zoom, data, boundingBoxes) {
    if (!data) return false;
    if (styleLayer.layout.visibility() === "none") return false;

    // Save the initial context state, and restore it after rendering
    context.save();
    painter(context, zoom, data, boundingBoxes);
    context.restore();

    return true; // return value indicates whether canvas has changed
  };
}

export function initPainter(params) {
  const getData = makeDataGetter(params.styleLayer);
  const paint = initPainterOnly(params);

  // Compose data getter and painter into one function
  return function(context, zoom, sources, boundingBoxes) {
    let data = getData(sources, zoom);
    return paint(context, zoom, data, boundingBoxes);
  }
}

export function addPainters(styleDoc, canvasSize = 512) {
  // Add a painter function to every layer in the style document
  styleDoc.layers.forEach(layer => {
    layer.painter = initPainter({
      canvasSize: canvasSize,
      styleLayer: layer,
      spriteObject: styleDoc.spriteData,
    });
  });

  return styleDoc; // NOTE: Modified in place!
}

function makeDataGetter(style) {
  const { id, type, source, minzoom = 0, maxzoom = 99 } = style;

  // Background layers don't need data
  if (type === "background") return () => true;

  // Raster layers don't need any data processing
  if (type === "raster") return function(sources, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    return sources[source];
  }

  // Vector layers: need to select the data layer
  return function(sources, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    let layers = sources[source];
    if (layers) return layers[id];
  };
}
