import { getPainter } from "./renderer.js";
import { initSourceFilter } from "./sources/source-filter.js";
import { makeDataGetter } from "./data.js";
import { initSourceCompressor } from "./data.js";
import { initPreRenderer } from "./prerender.js";

export function initPainter(params) {
  const style = params.styleLayer;
  const sprite = params.spriteObject;
  const canvasSize = params.canvasSize || 512;

  // Define data prep and rendering functions
  const sourceName = style["source"];
  const getData = makeDataGetter(style);
  const painter = getPainter(style, sprite, canvasSize);

  // Compose into one function
  return function(context, zoom, sources, boundingBoxes) {
    let t0 = performance.now();
    let data = getData(sources[sourceName], zoom);
    let t1 = performance.now();

    painter(context, zoom, data, boundingBoxes);

    return t1 - t0; // getData time
  }
}

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

export function initVectorProcessor(layers, verbose) {
  var t0, t1, timeString;

  const filter = initSourceFilter(layers);
  const compress = initSourceCompressor(layers);
  const prerender = initPreRenderer(layers);

  return function(tile, zoom) {
    if (verbose) t0 = performance.now();

    const dataLayers = filter(tile, zoom);
    if (verbose) reportTime("filter");

    const compressed = compress(dataLayers, zoom);
    if (verbose) reportTime("compress");

    const prerendered = prerender(compressed, zoom);
    if (verbose) reportTime("prerender");

    return prerendered;
  };

  function reportTime(process) {
    t1 = performance.now();
    timeString = (t1 - t0).toFixed(3) + "ms";
    console.log("vectorProcessor: " + timeString + " " + process + "ing");
    t0 = t1;
  }
}
