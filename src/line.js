import { canv, scaleCanv, pair } from "./utils.js";

export function initLine(layout, paint) {
  const setters = [
    pair(layout["line-cap"],      canv("lineCap")),
    pair(layout["line-join"],     canv("lineJoin")),
    pair(layout["line-miter-limit"], canv("miterLimit")),
    // line-round-limit,

    pair(paint["line-width"],     scaleCanv("lineWidth")),
    pair(paint["line-opacity"],   canv("globalAlpha")),
    pair(paint["line-color"],     canv("strokeStyle")),
    // line-gap-width, 
    // line-translate, line-translate-anchor,
    // line-offset, line-blur, line-gradient, line-pattern, 
  ];

  let dasharray = paint["line-dasharray"];
  if (dasharray.type !== "constant" || dasharray() !== undefined) {
    const getWidth = paint["line-width"];
    const getDash = (zoom, feature) => {
      let width = getWidth(zoom, feature);
      let dashes = dasharray(zoom, feature);
      return dashes.map(d => d * width);
    };
    const setDash = (dash, ctx, scale = 1) => {
      ctx.setLineDash(dash.map(d => d / scale));
    };
    setters.push( pair(getDash, setDash) );
  };
  const methods = ["stroke"];

  return { setters, methods };
}
