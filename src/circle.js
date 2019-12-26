import { pair, canv } from  "./brush-utils.js";
import { geomToPath } from "./path.js";

export function initCircle(layout, paint) {
  const setRadius = (radius, ctx) => ctx.lineWidth = radius * 2;
  const setters = [
    pair(paint["circle-radius"], setRadius),
    pair(paint["circle-color"], canv("strokeStyle")),
    pair(paint["circle-opacity"], canv("globalAlpha")),
    pair(() => "round", canv("lineCap")),
  ];

  const dataFuncs = setters.filter(s => s.getStyle.type === "property");
  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property");

  return function(ctx, zoom, data) {
    // Set the non-data dependent state
    zoomFuncs.forEach(f => f.setState(f.getStyle(zoom), ctx));

    // Loop over features and draw
    data.features.forEach(feature => drawFeature(ctx, zoom, feature));
  }

  function drawFeature(ctx, zoom, feature) {
    // Set data-dependent context state
    dataFuncs.forEach(f => f.setState(f.getStyle(zoom, feature), ctx));

    // Construct Path and draw
    let path = geomToPath(feature.geometry);
    ctx.stroke(path);
  }
}
