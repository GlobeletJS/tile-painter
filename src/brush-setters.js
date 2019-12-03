function canv(property) {
  // Create a default state setter for a Canvas 2D renderer
  return (val, ctx) => { ctx[property] = val; };
}

function pair(getStyle, setState) {
  // Return a style value getter and a renderer state setter as a paired object
  return { getStyle, setState };
}

export function getSetters(style, layout, paint) {
  const setters = [], methods = [];

  switch (style.type) {
    case "circle":
      let setRadius = (radius, ctx, path) => { 
        if (radius) path.pointRadius(radius); 
      };
      setters.push(
        pair(paint["circle-radius"], setRadius),
        pair(paint["circle-color"], canv("fillStyle")),
        pair(paint["circle-opacity"], canv("globalAlpha")),
      );
      methods.push("fill");
      break;

    case "line":
      if (layout) setters.push(
        pair(layout["line-cap"], canv("lineCap")),
        pair(layout["line-join"], canv("lineJoin")),
        pair(layout["line-miter-limit"], canv("miterLimit")),
        // line-round-limit,
      );
      setters.push(
        pair(paint["line-width"], canv("lineWidth")),
        pair(paint["line-opacity"], canv("globalAlpha")),
        pair(paint["line-color"], canv("strokeStyle")),
        // line-gap-width, 
        // line-translate, line-translate-anchor,
        // line-offset, line-blur, line-gradient, line-pattern, 
        // line-dasharray
      );
      methods.push("stroke");
      break;

    case "fill":
      setters.push(
        pair(paint["fill-color"], canv("fillStyle")),
        pair(paint["fill-opacity"], canv("globalAlpha")),
        // fill-translate, 
        // fill-translate-anchor,
        // fill-pattern,
      );
      methods.push("fill");
      let outline = paint["fill-outline-color"];
      if (outline.type !== "constant" || outline() !== undefined) {
        setters.push(
          pair(paint["fill-outline-color"], canv("strokeStyle")),
          pair(paint["fill-outline-width"], canv("lineWidth")), // nonstandard
        );
        methods.push("stroke");
      }
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
