import { getPainter } from "./renderer.js";
import { makeDataGetter } from "./data.js";
export { initSourceProcessor } from "./data.js";

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
