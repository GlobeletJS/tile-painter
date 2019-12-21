import { initBackgroundFill, initRasterFill } from "./roller.js";
import { initCircle, initLine, initFill } from "./brush-setup.js";
import { initLabeler } from "./labeler.js";

export function getPainter(style, sprite, canvasSize) {
  const painter = makePaintFunction(style, sprite, canvasSize);

  return function(context, zoom, data, boundingBoxes) {
    // Quick exit if there is nothing to see here
    if (!data) return false;
    if (style.layout && style.layout["visibility"] === "none") return false;
    if (style.minzoom !== undefined && zoom < style.minzoom) return false;
    if (style.maxzoom !== undefined && zoom > style.maxzoom) return false;

    // Save the initial context state, and restore it after rendering
    context.save();
    painter(context, zoom, data, boundingBoxes);
    context.restore();

    return true; // return value indicates whether canvas has changed
  };
}

function makePaintFunction(style, sprite, canvasSize) {
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
      return initFill(style.layout, style.paint, sprite);
    case "fill-extrusion":
    case "heatmap":
    case "hillshade":
    default:
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }
}
