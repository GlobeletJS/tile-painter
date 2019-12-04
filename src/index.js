import { initRenderer } from "./renderer.js";

export function initPainter(params) {
  const style = params.styleLayer;
  const sprite = params.spriteObject;
  const canvasSize = params.canvasSize || 512;

  // Define data prep and rendering functions
  const getData = makeDataGetter(style);
  const render = initRenderer(style, sprite, canvasSize);

  // Compose into one function
  return function(context, zoom, sources, boundingBoxes) {
    // Quick exits if this layer is not meant to be displayed
    if (style.layout && style.layout["visibility"] === "none") return false;
    if (style.minzoom !== undefined && zoom < style.minzoom) return false;
    if (style.maxzoom !== undefined && zoom > style.maxzoom) return false;

    // Get the data for the layer
    const data = getData(sources);
    if (!data) return false;

    // Save the initial context state, and restore it after rendering
    context.save();
    render(context, zoom, data, boundingBoxes);
    context.restore();

    return true; // true to indicate canvas has changed
  }
}

function makeDataGetter(style) {
  // Background layers don't need data
  if (style.type === "background") return () => true;

  // Store the source name, so we don't re-access the style object every time
  const sourceName = style["source"];
  // Raster layers don't specify a source-layer
  if (style.type === "raster") return (sources) => sources[sourceName];

  const layerName = style["source-layer"];
  const filter = style.filter;

  return function(sources) {
    let source = sources[sourceName];
    if (!source) return false;

    let layer = source[layerName];
    if (!layer) return false;

    let features = layer.features.filter(filter);
    if (features.length < 1) return false;

    return { type: "FeatureCollection", features: features };
  };
}
