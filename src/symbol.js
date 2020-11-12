import { canv, pair } from "./utils.js";

export function initSymbol(layout, paint, sprite) {
  const setters = [
    pair(layout["text-size"], canv("fontSize")),

    pair(paint["text-color"], canv("fillStyle")),
    pair(paint["text-opacity"], canv("globalAlpha")),

    pair(paint["text-halo-color"], canv("strokeStyle")),
  ];

  const methods = ["fillText"];

  return { setters, methods };
}
