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

    tileset.forEach(box => paintTile(box, zoom, tileset, pixRatio));
  }

  function paintTile(tileBox, zoom, transform, pixRatio) {
    const { x, y, sx, sy, sw, tile } = tileBox;

    const data = getData(tile.data);
    if (!data) return;

    // Set clipping mask, to limit rendering to the target output area
    const { translate, scale } = transform;
    const pixScale = scale * pixRatio;
    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * pixScale);
    context.clipRect(x0, y0, pixScale, pixScale);

    // Transform coordinates to align the crop portion of the source
    // with the target area on the canvas
    const tileScale = pixScale / sw;
    const dx = x0 - tileScale * sx;
    const dy = y0 - tileScale * sy;
    context.setTileTransform(dx, dy, tileScale);

    const atlas = tile.data.atlas;
    if (atlas) context.font = atlas;

    painter(context, zoom, data);
  }
}
