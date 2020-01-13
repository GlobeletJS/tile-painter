// Renders layers that cover the whole tile (like painting with a roller)

export function initBackgroundFill(layout, paint, canvSize) {
  return function(ctx, zoom) {
    ctx.fillStyle = paint["background-color"](zoom);
    ctx.globalAlpha = paint["background-opacity"](zoom);
    ctx.fillRect(0, 0, canvSize, canvSize);
  }
}

export function initRasterFill(layout, paint, canvSize) {
  return function(ctx, zoom, image) {
    ctx.globalAlpha = paint["raster-opacity"](zoom);
    // TODO: we are forcing one tile to cover the canvas!
    // In some cases (e.g. Mapbox Satellite Streets) the raster tiles may
    // be half the size of the vector canvas, so we need 4 of them...
    ctx.drawImage(image, 0, 0, canvSize, canvSize);
  }
}

export function initGeoTiff(layout, paint, canvSize) {
  return function(ctx, zoom, data) {
    // paint pixel values onto canvas with Plotty
    //If colorbar-type=log, compute log of the data, plot on a log scale
    if (paint["colorbar-type"]() === "log"){
      var logData=[];
      for (let i=0; i<data.length; i++){
        logData[i]=Math.log(data[i]);
      }
      var plot = new plotty.plot({
        canvas: ctx.canvas,
        data: logData, width: canvSize, height: canvSize,
        domain: [Math.log(paint["colorbar-min"]()), Math.log(paint["colorbar-max"]())], colorScale: paint["colorbar"]()
      });
    }else if (paint["colorbar-type"] === "linear"){
      var plot = new plotty.plot({
        canvas: ctx.canvas,
        data: data, width: canvSize, height: canvSize,
        domain: [(paint["colorbar-min"]()), (paint["colorbar-max"]())], colorScale: paint["colorbar"]()
      });
    }
    plot.render();
    return ctx;
  };
}
