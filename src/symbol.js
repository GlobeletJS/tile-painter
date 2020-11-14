import { canv, pair } from "./utils.js";

export function initSymbol(paint, sprite) {
  const setters = [
    pair(paint["text-color"], canv("fillStyle")),
    pair(paint["text-opacity"], canv("globalAlpha")),

    pair(paint["text-halo-color"], canv("strokeStyle")),
  ];

  const methods = ["fillText"];

  return { setters, methods };
}
