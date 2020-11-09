import { canv, pair } from "./utils.js";

export function initCircle(paint) {
  const setRadius = (radius, ctx, scale = 1) => {
    ctx.lineWidth = radius * 2 / scale;
  }
  const setters = [
    pair(paint["circle-radius"],  setRadius),
    pair(paint["circle-color"],   canv("strokeStyle")),
    pair(paint["circle-opacity"], canv("globalAlpha")),
    pair(() => "round",           canv("lineCap")),
  ];

  const methods = ["stroke"];

  return { setters, methods };
}
