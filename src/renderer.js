import { initBackgroundFill, initRasterFill } from "./roller.js";
import { initCircle, initLine, initFill } from "./brush-setup.js";
import { initLabeler } from "./labeler.js";

export function makePaintFunction(style, sprite, canvasSize) {
  switch (style.type) {
    case "background":
      return initBackgroundFill(style.layout, style.paint, canvasSize);
    case "raster":
      return initRasterFill(style.layout, style.paint, canvasSize);
    case "symbol":
      return initLabeler(style.layout, style.paint, sprite);
    case "circle":
      return initCircle(style.layout, style.paint);
    case "line":
      return initLine(style.layout, style.paint);
    case "fill":
      return initFill(style.layout, style.paint);
    case "fill-extrusion":
    case "heatmap":
    case "hillshade":
    default:
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }
}

export function makeDataGetter(style) {
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
