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

  const zoomFuncs = setters.filter(s => s.type !== "property")
    .map(s => (z) => (context[s.key] = s.get(z)));
  const dataFuncs = setters.filter(s => s.type === "property")
    .map(s => (z, f) => (context[s.key] = s.get(z, f)));

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
