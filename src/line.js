import { pair } from "./utils.js";

export function initLine(layout, paint) {
  const setters = [
    pair(layout["line-cap"],      "lineCap"),
    pair(layout["line-join"],     "lineJoin"),
    pair(layout["line-miter-limit"], "miterLimit"),
    // line-round-limit,

    pair(paint["line-width"],     "lineWidth"),
    pair(paint["line-opacity"],   "globalAlpha"),
    pair(paint["line-color"],     "strokeStyle"),
    // line-gap-width, 
    // line-translate, line-translate-anchor,
    // line-offset, line-blur, line-gradient, line-pattern, 
  ];

  const methods = ["stroke"];

  return { setters, methods };
}
