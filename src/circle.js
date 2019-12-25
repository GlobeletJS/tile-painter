import { pair, canv } from  "./brush-utils.js";
import { geomToPath } from "./path.js";

export function initCircle(layout, paint) {
  const setters = [
    pair(paint["circle-radius"], canv("radius")),
    pair(paint["circle-color"], canv("color")),
    pair(paint["circle-opacity"], canv("opacity")),
    pair(paint["circle-stroke-width"], canv("strokeWidth")),
    pair(paint["circle-stroke-color"], canv("strokeColor")),
    pair(paint["circle-stroke-opacity"], canv("strokeOpacity")),
  ];

  const dataFuncs = setters.filter(s => s.getStyle.type === "property");
  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property");

  const draw = (dataFuncs.length > 0)
    ? dataDependentDraw
    : constantDraw;

  return function(ctx, zoom, data) {
    const params = {};

    // Set the non-data dependent state
    zoomFuncs.forEach(f => f.setState(f.getStyle(zoom), params));

    // Draw everything and return
    return draw(ctx, params, zoom, data);
  }

  function dataDependentDraw(ctx, params, zoom, data) {
    const features = addStylesToFeatures(dataFuncs, zoom, data);

    // Draw features, updating canvas state as data-dependent styles change
    throw Error("circle.dataDependentDraw: not implemented yet!!");
  }

  function constantDraw(ctx, params, zoom, data) {
    //let path = new Path2D();
    //data.features.map(f => f.geometry.coordinates)
    //  .forEach(point => linePoint(path, point));
    let paths = data.features.map(f => geomToPath(f.geometry));
    ctx.strokeStyle = params.color;
    ctx.globalAlpha = params.opacity;
    ctx.lineWidth = params.radius * 2;
    ctx.lineCap = "round";
    //ctx.stroke(path);
    paths.forEach(path => ctx.stroke(path));
  }
}

function linePoint(ctx, pt) {
  ctx.moveTo(pt[0], pt[1]);
  ctx.lineTo(pt[0], pt[1]);
}
