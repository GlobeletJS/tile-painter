import { pair } from "./utils.js";

export function initCircle(paint) {
  const getDiameter = (z, f) => paint["circle-radius"](z, f) * 2;
  const setters = [
    pair(getDiameter,             "lineWidth"),
    pair(paint["circle-color"],   "strokeStyle"),
    pair(paint["circle-opacity"], "globalAlpha"),
    pair(() => "round",           "lineCap"),
  ];

  const methods = ["stroke"];

  return { setters, methods };
}
