import { initBackgroundFill, initRasterFill } from "./roller.js";
import { initCircle, initLine, initFill } from "./brush-setup.js";
import { initLabeler } from "./labeler.js";

export function initRenderer(style, sprite, canvasSize) {
  const layout = style.layout;
  const paint = style.paint;

  switch (style.type) {
    case "background":
      return initBackgroundFill(layout, paint, canvasSize);
    case "raster":
      return initRasterFill(layout, paint, canvasSize);
    case "symbol":
      return initLabeler(layout, paint, sprite);
    case "circle":
      return initCircle(layout, paint);
    case "line":
      return initLine(layout, paint);
    case "fill":
      //return initBrush(style, layout, paint);
      return initFill(layout, paint);
    default:
      // Missing fill-extrusion, heatmap, hillshade
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }
}
