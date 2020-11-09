import { canv, scaleCanv, pair, makePatternSetter } from "./utils.js";

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

  const setTranslate = (t, ctx, scale = 1) => {
    ctx.translate(t[0] / scale, t[1] / scale);
  };
  const setters = [
    pair(getStyle, setState),
    pair(paint["fill-opacity"],   canv("globalAlpha")),
    pair(paint["fill-translate"], setTranslate),
    // fill-translate-anchor,
  ];
  const methods = ["fill"];

  let outline = paint["fill-outline-color"];
  if (outline.type !== "constant" || outline() !== undefined) {
    setters.push(
      pair(paint["fill-outline-color"], canv("strokeStyle")),
      pair(paint["fill-outline-width"], scaleCanv("lineWidth")), // nonstandard
    );
    methods.push("stroke");
  }

  return { setters, methods };
}
