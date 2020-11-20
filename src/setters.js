export function getSetters(style) {
  const { type, layout, paint } = style;

  const pair = (get, key) => ({ key, get, type: get.type });

  switch (type) {
    case "background":
      return [
        pair(paint["background-color"],   "fillStyle"),
        pair(paint["background-opacity"], "globalAlpha"),
      ];
    case "circle":
      let getDiameter = (z, f) => paint["circle-radius"](z, f) * 2;
      getDiameter.type = paint["circle-radius"].type;
      return [
        pair(getDiameter,             "lineWidth"),
        pair(paint["circle-color"],   "strokeStyle"),
        pair(paint["circle-opacity"], "globalAlpha"),
        pair(() => "round",           "lineCap"),
      ];
    case "line":
      return [
        // TODO: move these to serialization step??
        pair(layout["line-cap"],      "lineCap"),
        pair(layout["line-join"],     "lineJoin"),
        pair(layout["line-miter-limit"], "miterLimit"),
        // line-round-limit,

        pair(paint["line-width"],     "lineWidth"),
        pair(paint["line-opacity"],   "globalAlpha"),
        pair(paint["line-color"],     "strokeStyle"),
        // line-gap-width, 
        // line-translate, line-translate-anchor,
        // line-offset, line-blur, line-gradient, line-pattern, 
      ];
    case "fill":
      return [
        pair(paint["fill-color"],     "fillStyle"),
        pair(paint["fill-opacity"],   "globalAlpha"),
        pair(paint["fill-translate"], "translation"),
        // fill-translate-anchor,
      ];
    case "symbol":
      return [
        pair(paint["text-color"],     "fillStyle"),
        pair(paint["text-opacity"],   "globalAlpha"),

        pair(paint["text-halo-color"], "strokeStyle"),
        // TODO: sprites
      ];
    case "raster": // TODO: not implemented!
      return [
        pair(paint["raster-opacity"], "globalAlpha"),
      ];
    case "fill-extrusion":
    case "heatmap":
    case "hillshade":
    default:
      return console.log("ERROR in tile-painter: layer.type = " +
        type + " not supported!");
  }
}
