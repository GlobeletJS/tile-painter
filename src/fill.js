import { canv, pair, makePatternSetter } from "./utils.js";

export function initFill(paint, sprite) {
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
    pair(paint["fill-translate"], canv("translation")),
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

  return { setters, methods };
}
