import { collectGetters } from "./style-func.js";
// Renders layers that cover the whole tile (like painting with a roller)

export function initBackgroundFill(style, canvSize) {
  const paint = collectGetters(style.paint, [
    ["background-color"],
    ["background-opacity"],
  ]);

  return function(ctx, zoom) {
    ctx.fillStyle = paint["background-color"](zoom);
    ctx.globalAlpha = paint["background-opacity"](zoom);
    ctx.fillRect(0, 0, canvSize, canvSize);
  }
}

export function initRasterFill(style, canvSize) {
  const paint = collectGetters(style.paint, [
    ["raster-opacity"],
    // ["raster-hue-rotate"],
    // ["raster-brightness-min"],
    // ["raster-brightness-max"],
    // ["raster-saturation"],
    // ["raster-contrast"],
  ]);

  return function(ctx, zoom, image) {
    ctx.globalAlpha = paint["raster-opacity"](zoom);
    // TODO: we are forcing one tile to cover the canvas!
    // In some cases (e.g. Mapbox Satellite Streets) the raster tiles may
    // be half the size of the vector canvas, so we need 4 of them...
    ctx.drawImage(image, 0, 0, canvSize, canvSize);
  }
}
