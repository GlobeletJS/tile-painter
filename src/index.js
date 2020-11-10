import { initRenderer } from "./renderer.js";
import { initRoller, initBrush } from "./utils.js";

export function initMapPainter(params) {
  const { context, styleLayer, spriteObject } = params;

  const info = initRenderer(styleLayer, spriteObject);
  if (!info) return () => null;

  // TODO: should maxzoom be limited to 24? See the Mapbox style spec
  const { id, type, source, minzoom = 0, maxzoom = 24 } = styleLayer;

  const painter = (type === "background")
    ? initRoller(info)
    : initBrush(info);

  const getData = (type === "raster")
    ? (tile) => tile 
    : (tile) => tile.layers[id];

  const paint = (type === "background")
    ? paintBackground
    : paintLayer;

  return Object.assign(paint, { id, type, source, minzoom, maxzoom });

  function paintBackground({ zoom }) {
    painter(context, zoom);
  }

  function paintLayer({ tileset, zoom, pixRatio = 1 }) {
    if (!tileset) return;

    let { translate: [tx, ty], scale } = tileset;
    let pixScale = scale * pixRatio;

    tileset.forEach(tileBox => {
      let { x, y, sx, sy, sw, tile } = tileBox;

      let data = getData(tile.data);
      if (!data) return;

      let x0 = (x + tx) * pixScale;
      let y0 = (y + ty) * pixScale;

      // Set clipping mask, to limit rendering to the desired output area
      context.clipRect(x0, y0, pixScale, pixScale);

      // Transform coordinates to align the crop portion of the source
      // with the target position on the canvas
      let tileScale = pixScale / sw;
      let dx = x0 - tileScale * sx;
      let dy = y0 - tileScale * sy;
      context.setTransform(tileScale, 0, 0, tileScale, dx, dy);

      let styleScale = tileScale / pixRatio;
      painter(context, zoom, data, tile.data.atlas, styleScale);
    });
  }
}
