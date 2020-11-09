import { canv, pair } from "./utils.js";

export function initBackground(paint) {
  const setters = [
    pair(paint["background-color"],   canv("fillStyle")),
    pair(paint["background-opacity"], canv("globalAlpha")),
  ];

  const methods = ["fillRect"];

  return { setters, methods };
}
