import { canv, pair, initBrush, makePatternSetter } from "./brush-utils.js";

// Renders discrete lines, points, polygons... like painting with a brush

export function initCircle(layout, paint) {
  const setRadius = (radius, ctx) => ctx.lineWidth = radius * 2;
  const setters = [
    pair(paint["circle-radius"],  setRadius),
    pair(paint["circle-color"],   canv("strokeStyle")),
    pair(paint["circle-opacity"], canv("globalAlpha")),
    pair(() => "round",           canv("lineCap")),
  ];
  const methods = ["stroke"];

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

export function initFill(layout, paint, sprite) {
  var getStyle, setState;

  let pattern = paint["fill-pattern"];
  if (pattern.type !== "constant" || pattern() !== undefined) {
    // Fill with a repeated sprite. Style getter returns sprite name
    getStyle = pattern;
    setState = makePatternSetter(sprite);
  } else {
    // Fill with a solid color
    getStyle = paint["fill-color"];
    setState = canv("fillStyle");
  }

  const setters = [
    pair(getStyle, setState),
    pair(paint["fill-opacity"],   canv("globalAlpha")),
    // fill-translate, 
    // fill-translate-anchor,
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
