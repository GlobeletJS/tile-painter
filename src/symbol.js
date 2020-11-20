import { pair } from "./utils.js";

export function initSymbol(paint, sprite) {
  const setters = [
    pair(paint["text-color"], "fillStyle"),
    pair(paint["text-opacity"], "globalAlpha"),

    pair(paint["text-halo-color"], "strokeStyle"),
  ];

  const methods = ["fillText"];

  return { setters, methods };
}
