import { initBrush } from "./brush-stroke.js";
// Renders discrete lines, points, polygons... like painting with a brush

function canv(property) {
  // Create a default state setter for a Canvas 2D renderer
  return (val, ctx) => { ctx[property] = val; };
}

function pair(getStyle, setState) {
  // Return a style value getter and a renderer state setter as a paired object
  return { getStyle, setState };
}

export function initCircle(layout, paint) {
  const setRadius = (radius, ctx, path) => {
    if (radius) path.pointRadius(radius);
  };
  const setters = [
    pair(paint["circle-radius"],  setRadius),
    pair(paint["circle-color"],   canv("fillStyle")),
    pair(paint["circle-opacity"], canv("globalAlpha")),
  ];
  const methods = ["fill"];

  return initBrush({ setters, methods });
}

export function initLine(layout, paint) {
  const setters = [
    pair(layout["line-cap"],      canv("lineCap")),
    pair(layout["line-join"],     canv("lineJoin")),
    pair(layout["line-miter-limit"], canv("miterLimit")),
    // line-round-limit,

    pair(paint["line-width"],     canv("lineWidth")),
    pair(paint["line-opacity"],   canv("globalAlpha")),
    pair(paint["line-color"],     canv("strokeStyle")),
    // line-gap-width, 
    // line-translate, line-translate-anchor,
    // line-offset, line-blur, line-gradient, line-pattern, 
    // line-dasharray
  ];
  const methods = ["stroke"];

  return initBrush({ setters, methods });
}

export function initFill(layout, paint) {
  const setters = [
    pair(paint["fill-color"],     canv("fillStyle")),
    pair(paint["fill-opacity"],   canv("globalAlpha")),
    // fill-translate, 
    // fill-translate-anchor,
    // fill-pattern,
  ];
  const methods = ["fill"];

  let outline = paint["fill-outline-color"];
  if (outline.type !== "constant" || outline() !== undefined) {
    setters.push(
      pair(paint["fill-outline-color"], canv("strokeStyle")),
      pair(paint["fill-outline-width"], canv("lineWidth")), // nonstandard
    );
    methods.push("stroke");
  }

  return initBrush({ setters, methods });
}
