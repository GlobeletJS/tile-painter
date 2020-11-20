import { pair } from "./utils.js";

export function initFill(paint, sprite) {
  const setters = [
    pair(paint["fill-color"],     "fillStyle"),
    pair(paint["fill-opacity"],   "globalAlpha"),
    pair(paint["fill-translate"], "translation"),
    // fill-translate-anchor,
  ];
  const methods = ["fill"];

  let outline = paint["fill-outline-color"];
  if (outline.type !== "constant" || outline() !== undefined) {
    setters.push(
      pair(paint["fill-outline-color"], "strokeStyle"),
      pair(paint["fill-outline-width"], "lineWidth"), // nonstandard
    );
    methods.push("stroke");
  }

  return { setters, methods };
}
