import { pair, canv } from  "./brush-utils.js";

const tau = 2 * Math.PI;

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
    //let sprite = makeCircleSprite(params);
    //data.features.forEach(feature => drawCircle(ctx, sprite, feature.geometry.coordinates));
    let path = new Path2D();
    data.features.map(f => f.geometry.coordinates)
      //.forEach(point => circlePath(path, point, params.radius));
      .forEach(point => linePoint(path, point));
    //ctx.fillStyle = params.color;
    ctx.strokeStyle = params.color;
    ctx.globalAlpha = params.opacity;
    //ctx.fill(path);
    ctx.lineWidth = params.radius * 2;
    ctx.lineCap = "round";
    ctx.stroke(path);
  }
}

function linePoint(ctx, pt) {
  ctx.moveTo(pt[0], pt[1]);
  ctx.lineTo(pt[0], pt[1]);
}

function circlePath(ctx, coords, radius) {
  ctx.moveTo(coords[0] + radius, coords[1]);
  ctx.arc(coords[0], coords[1], radius, 0, tau);
}

function drawCircle(ctx, sprite, coords) {
  //let [x, y] = feature.geometry.coordinates.map(c => Math.round(c - sprite.size / 2));
  let x = Math.round(coords[0] - sprite.size / 2);
  let y = Math.round(coords[1] - sprite.size / 2);
  ctx.drawImage(sprite.image, x, y);
}

// TODO: benchmark iteration over drawImage vs adding many circles to one path, 
// followed by a single fill/stroke call (as d3-geo-path is doing)
// BUT NOTE that circle-radius is meant to be a 'paint' property, potentially
// changing continuously with zoom, so we can't really save and reuse the path
function makeCircleSprite(params) {
  // TODO: add 1-2 pixels to avoid edge effects?
  const halfWidth = Math.ceil(params.radius + params.strokeWidth);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 2 * halfWidth;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = params.color;
  ctx.globalAlpha = params.opacity;

  ctx.beginPath();
  // TODO: should we reduce the fill radius by 0.5 * strokeWidth?
  ctx.arc(halfWidth, halfWidth, params.radius, 0, 2 * Math.PI);
  ctx.fill();

  if (params.strokeWidth > 0) {
    ctx.lineWidth = params.strokeWidth;
    ctx.strokeStyle = params.strokeColor;
    ctx.globalAlpha = params.strokeOpacity;
    ctx.stroke();
  }

  return { 
    image: canvas,
    size: 2 * halfWidth,
  };
}
