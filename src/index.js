import { initRenderer } from "./renderer.js";
export { initPainterOnly, initPainter, addPainters } from "./wrappers.js";

export function initMapPainter(params) {
  const { context, styleLayer, spriteObject, tileSize = 512 } = params;

  const painter = initRenderer(styleLayer, spriteObject, tileSize);
  if (!painter) return () => null;

  // TODO: should maxzoom be limited to 24? See the Mapbox style spec
  const { id, type, source, minzoom = 0, maxzoom = 99 } = styleLayer;

  const getData = (type === "raster")
    ? (source) => source
    : (source) => source[id];

  const clipRect = context.clipRect || clip2d;

  const paint = (type === "background")
    ? paintBackground
    : paintTile;

  Object.assign(paint, { id, type, source, minzoom, maxzoom });

  function paintBackground({ zoom }) {
    // Background layer: just fill the whole canvas, no transform or clip
    context.save();
    painter(context, zoom); // No data needed
    context.restore();
  }

  function paintTile({ source, position, crop, zoom, boxes }) {
    // Input source is one tile's data for a single source,
    // which for vector sources, could include multiple layers
    let data = getData(source);
    if (!data) return false;

    context.save();

    // Transform coordinates to align the crop portion of the source
    // with the target position on the canvas
    let scale = position.w / crop.w;
    let tx = position.x - scale * crop.x;
    let ty = position.y - scale * crop.y;
    context.setTransform(scale, 0, 0, scale, tx, ty);

    // Set clipping mask, to limit rendering to the desired output area
    clipRect(crop.x, crop.y, crop.w, crop.w);

    painter(context, zoom, data, boxes, scale);

    context.restore();
    return true; // Indicate that canvas has changed
  }

  function clip2d(x, y, width, height) {
    let area = new Path2D();
    area.rect(x, y, width, height);
    context.clip(area);
  }

  return paint;
}
