import { getSetters } from "./setters.js";

export function initRenderer(context, style, sprite) {
  const setters = getSetters(style);
  if (!setters) return;

  const method = methods[style.type];

  const zoomFuncs = setters.filter(s => s.type !== "property")
    .map(s => (z) => (context[s.key] = s.get(z)));
  const dataFuncs = setters.filter(s => s.type === "property")
    .map(s => (z, f) => (context[s.key] = s.get(z, f)));

  return { method, zoomFuncs, dataFuncs };
}

const methods = {
  background: "fillRect",
  raster: "drawImage",
  symbol: "fillText",
  circle: "stroke",
  line: "stroke",
  fill: "fill",
};
