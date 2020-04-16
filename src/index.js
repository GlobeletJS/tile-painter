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

    painter(context, zoom, data, boxes, scaleFactor);

    context.restore();
    return true; // Indicate that canvas has changed
  }

  return paint;
}
