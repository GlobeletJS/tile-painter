import { initBackgroundFill, initRasterFill } from "./roller.js";
import { initCircle, initLine, initFill, initSymbol } from "./brush-setup.js";

export function initRenderer(style, sprite, canvasSize) {
  const  { type, layout, paint } = style;

  switch (type) {
    case "background":
      return initBackgroundFill(layout, paint);
    case "raster":
      return initRasterFill(layout, paint, canvasSize);
    case "symbol":
      return initSymbol(layout, paint, sprite);
    case "circle":
      return initCircle(layout, paint);
    case "line":
      return initLine(layout, paint);
    case "fill":
      return initFill(layout, paint, sprite);
    case "fill-extrusion":
    case "heatmap":
    case "hillshade":
    default:
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }
}
