import { initBackgroundFill, initRasterFill } from "./roller.js";
import { initCircle, initLine, initFill } from "./brush-setup.js";
import { initLabeler } from "./labeler.js";

export function getPainter(style, sprite, canvasSize) {
  const painter = makePaintFunction(style, sprite, canvasSize);

  return function(context, zoom, data, boundingBoxes) {
    if (!data) return false;
    if (style.layout.visibility() === "none") return false;

    // Save the initial context state, and restore it after rendering
    context.save();
    painter(context, zoom, data, boundingBoxes);
    context.restore();

    return true; // return value indicates whether canvas has changed
  };
}

export function initMapPainter(params) {
  const { context, styleLayer, spriteObject, tileSize = 512 } = params;

  const painter = makePaintFunction(styleLayer, spriteObject, tileSize);
  const getData = getGetter(styleLayer);

  // TODO: Provide default position and crop?
  function paint({ source, position, crop, zoom, boxes }) {
    // Input source is one tile's data for a single source,
    // which for vector sources, could include multiple layers
    let data = getData(source);
    if (!data) return false;

    context.save();

    // Translate coordinates to the output position
    context.translate(position.x, position.y);

    // Scale and translate to match geometry of the cropped data
    let scaleFactor = position.w / crop.w;
    context.scale(scaleFactor, scaleFactor);
    context.translate(-crop.x, -crop.y);

    // Set clipping mask, to limit rendering to the desired output area
    let area = new Path2D();
    area.rect(crop.x, crop.y, crop.w, crop.w);
    context.clip(area);

    let fracZoom = zoom + Math.log2(position.w / tileSize);
    painter(context, fracZoom, data, boxes, scaleFactor);

    context.restore();
    return true; // Indicate that canvas has changed
  }

  // Copy some style properties to the paint function
  const { id, source, minzoom = 0, maxzoom = 99 } = styleLayer;
  Object.assign(paint, { id, source, minzoom, maxzoom });

  return paint;
}

function getGetter(style) {
  let id = style.id;
  switch (style.type) {
    case "background": return () => true;
    case "raster": return (source) => source;
    default: return (source) => source[id];
  }
}

function makePaintFunction(style, sprite, canvasSize) {
  switch (style.type) {
    case "background":
      return initBackgroundFill(style.layout, style.paint, canvasSize);
    case "raster":
      return initRasterFill(style.layout, style.paint, canvasSize);
    case "symbol":
      return initLabeler(style.layout, style.paint, sprite, canvasSize);
    case "circle":
      return initCircle(style.layout, style.paint);
    case "line":
      return initLine(style.layout, style.paint);
    case "fill":
      return initFill(style.layout, style.paint, sprite);
    case "fill-extrusion":
    case "heatmap":
    case "hillshade":
    default:
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }
}
