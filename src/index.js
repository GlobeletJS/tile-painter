import { initRenderer } from "./renderer.js";

export function initMapPainter(params) {
  const { context, styleLayer, spriteObject } = params;

  const info = initRenderer(context, styleLayer, spriteObject);
  if (!info) return () => null;

  const { brushes, zoomFuncs, dataFuncs } = info;

  // TODO: should maxzoom be limited to 24? See the Mapbox style spec
  const { id, type, source, minzoom = 0, maxzoom = 24 } = styleLayer;

  const getData = (type === "raster")
    ? (tile) => tile 
    : (tile) => tile.layers[id];

  const paint = (type === "background")
    ? paintBackground
    : paintTileset;

  return Object.assign(paint, { id, type, source, minzoom, maxzoom });

  function paintBackground({ zoom }) {
    zoomFuncs.forEach(f => f(zoom));
    // methods === ["fillRect"]
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  }

  function paintTileset({ tileset, zoom, pixRatio = 1 }) {
    if (!tileset || !tileset.length) return;

    const { x, y, z } = tileset[0];
    const extent = 512; // TODO: don't assume this!!
    context.setMapCoords(x, y, z, 512);

    const { translate, scale } = tileset;
    const pixScale = scale * pixRatio;
    const dxy = [x, y].map((c, i) => (c + translate[i]) * pixScale);
    context.setMapShift(...dxy, pixScale);

    zoomFuncs.forEach(f => f(zoom));

    brushes.forEach(brush => {
      tileset.forEach(box => paintTile(brush, box, zoom, translate, pixScale));
    });
  }

  function paintTile(brush, tileBox, zoom, translate, scale) {
    const { x, y, tile } = tileBox;

    const data = getData(tile.data);
    if (!data) return;

    // Set clipping mask, to limit rendering to the target output area
    const [x0, y0] = [x, y].map((c, i) => (c + translate[i]) * scale);
    context.clipRect(x0, y0, scale, scale);

    const atlas = tile.data.atlas;
    if (atlas) context.font = atlas;

    data.compressed.forEach(f => drawFeature(brush, zoom, f));
  }

  function drawFeature(brush, zoom, feature) {
    dataFuncs.forEach(f => f(zoom, feature));
    brush(feature.path);
  }
}
