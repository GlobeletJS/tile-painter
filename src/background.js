import { pair } from "./utils.js";

export function initBackground(paint) {
  const setters = [
    pair(paint["background-color"],   "fillStyle"),
    pair(paint["background-opacity"], "globalAlpha"),
  ];

  const methods = ["fillRect"];

  return { setters, methods };
}
