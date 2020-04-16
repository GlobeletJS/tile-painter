export function initBackgroundFill(layout, paint) {
  return function(ctx, zoom) {
    ctx.fillStyle = paint["background-color"](zoom);
    ctx.globalAlpha = paint["background-opacity"](zoom);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

export function initRasterFill(layout, paint, canvSize) {
  return function(ctx, zoom, image) {
    ctx.globalAlpha = paint["raster-opacity"](zoom);
    // TODO: is canvSize necessary?
    // With the mapPainter method, coordinates are already
    // scaled to draw the tile at the correct size
    ctx.drawImage(image, 0, 0, canvSize, canvSize);
  }
}
