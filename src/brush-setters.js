import { buildStyleFunc } from "./style-function.js";

function getSetter(styleProperty, setter) {
  // For each relevant style property, return functions to:
  // 1. Get the style value. This function could depend on the data
  //    (feature.properties), or only on the zoom level.
  const getStyle = buildStyleFunc(styleProperty);

  // 2. Set the Canvas/d3-path state based on the style value. In general,
  //    the setter signature is setState(val, context, path)
  const setState = (typeof setter === "string")
    ? (val, ctx) => { ctx[setter] = val; } // Default setter sets Canvas state
    : setter;

  // These 2 functions will be composed, i.e., setState(getStyle(...), ...)
  // But we return them separately for now, since we may want to use the style
  // values first, e.g. for sorting the data
  return { getStyle, setState };
}

export function getSetters(style) {
  const layout = style.layout;
  const paint = style.paint;
  const setters = [], methods = [];

  switch (style.type) {
    case "circle":
      let setRadius = (radius, ctx, path) => { 
        if (radius) path.pointRadius(radius); 
      };
      setters.push(
        getSetter(paint["circle-radius"], setRadius),
        getSetter(paint["circle-color"], "fillStyle"),
        getSetter(paint["circle-opacity"], "globalAlpha"),
      );
      methods.push("fill");
      break;

    case "line":
      if (layout) setters.push(
        getSetter(layout["line-cap"], "lineCap"),
        getSetter(layout["line-join"], "lineJoin"),
        getSetter(layout["line-miter-limit"], "miterLimit"),
        // line-round-limit,
      );
      setters.push(
        getSetter(paint["line-width"], "lineWidth"),
        getSetter(paint["line-opacity"], "globalAlpha"),
        getSetter(paint["line-color"], "strokeStyle"),
        // line-gap-width, 
        // line-translate, line-translate-anchor,
        // line-offset, line-blur, line-gradient, line-pattern, 
        // line-dasharray
      );
      methods.push("stroke");
      break;

    case "fill":
      setters.push(
        getSetter(paint["fill-color"], "fillStyle"),
        getSetter(paint["fill-opacity"], "globalAlpha"),
        // fill-outline-color, 
        // fill-translate, 
        // fill-translate-anchor,
        // fill-pattern,
      );
      methods.push("fill");
      break;

    default:
      // Missing fill-extrusion, heatmap, hillshade
      return console.log("ERROR in initBrush: layer.type = " +
        style.type + " not supported!");
  }

  // Sort the getter/setter pairs based on whether they are data dependent
  const dataFuncs = setters.filter(s => s.getStyle.type === "property");
  // zoomFuncs could include constant styles
  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property");

  return { dataFuncs, zoomFuncs, methods };
}
