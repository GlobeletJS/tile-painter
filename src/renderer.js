import { initBackground } from "./background.js";
import { initRaster } from "./raster.js";
import { initCircle } from "./circle.js";
import { initLine   } from "./line.js";
import { initFill   } from "./fill.js";
import { initSymbol } from "./symbol.js";

export function initRenderer(context, style, sprite) {
  const info = getMethodsAndSetters(style, sprite);
  if (!info) return;

  const { methods, setters } = info;

  const brushes = methods.map(method => context[method]);

  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property")
    .map(s => (z) => s.setState(s.getStyle(z), context));
  const dataFuncs = setters.filter(s => s.getStyle.type === "property")
    .map(s => (z, feature) => s.setState(s.getStyle(z, feature), context));

  return { brushes, zoomFuncs, dataFuncs };
}

function getMethodsAndSetters(style, sprite) {
  const  { type, layout, paint } = style;

  switch (type) {
    case "background":
      return initBackground(paint);
    case "raster":
      return initRaster(paint);
    case "symbol":
      return initSymbol(paint, sprite);
    case "circle":
      return initCircle(paint);
    case "line":
      return initLine(layout, paint);
    case "fill":
      return initFill(paint, sprite);
    case "fill-extrusion":
    case "heatmap":
    case "hillshade":
    default:
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }
}
