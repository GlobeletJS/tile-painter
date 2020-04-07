import { initRenderer } from "./renderer.js";
export { initPainterOnly, initPainter, addPainters } from "./wrappers.js";

export function initMapPainter(params) {
  const { context, styleLayer, spriteObject, tileSize = 512 } = params;

  const painter = initRenderer(styleLayer, spriteObject, tileSize);
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

    // TODO: This assumes the supplied zoom is an integer!
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
