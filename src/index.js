import { getPainter } from "./renderer.js";

export function initPainterOnly(params) {
  const canvasSize = params.canvasSize || 512;
  return getPainter(params.styleLayer, params.spriteObject, canvasSize);
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

export function initPainter(params) {
  const style = params.styleLayer;
  const canvasSize = params.canvasSize || 512;
  const paint = getPainter(style, params.spriteObject, canvasSize);

  // Define data getter
  const sourceName = style["source"];
  const getData = makeDataGetter(style);

  // Compose data getter and painter into one function
  return function(context, zoom, sources, boundingBoxes) {
    let data = getData(sources[sourceName], zoom);
    return paint(context, zoom, data, boundingBoxes);
  }
}

export function makeDataGetter(style) {
  // Background layers don't need data
  if (style.type === "background") return () => true;

  const minzoom = style.minzoom || 0;
  const maxzoom = style.maxzoom || 99; // NOTE: doesn't allow maxzoom = 0

  // Raster layers don't need any data processing
  if (style.type === "raster") return function(source, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    return source;
  }

  return function(source, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    if (source) return source[style.id];
  };
}
