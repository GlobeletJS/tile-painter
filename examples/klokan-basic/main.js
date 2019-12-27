import { parseStyle  } from 'tile-stencil';
import { initPainterOnly, initSourceProcessor } from "../../src/index.js";
import { xhrPromise  } from "./xhr-promise.js";
import { VectorTile  } from 'vector-tile-esm';
import Protobuf from 'pbf';

const styleHref = "./klokantech-basic-style.json";
const tileHref = "./maptiler_11-327-791.pbf";
const tileCoords = { z: 11, x: 327, y: 791 };
const tileSize = 512;

export function main() {
  // Get a Canvas2D rendering context
  const ctx = document.getElementById("tileCanvas").getContext("2d");
  ctx.canvas.width = tileSize;
  ctx.canvas.height = tileSize;

  // Load the style, and add painter functions
  let getStyle = parseStyle(styleHref);

  // Load a tile, parse to GeoJSON
  let getTile = xhrPromise(tileHref, "arraybuffer")
    .then( buffer => new VectorTile(new Protobuf(buffer)) )
    .then( mvt => mvtToJSON(mvt, tileSize) );

  // Render to the Canvas
  let render = Promise.all([getStyle, getTile])
    .then( ([style, tile]) => renderTile(ctx, style, tile) );
}

function renderTile(ctx, style, tile) {
  var t0, t1;
  const bboxes = [];

  // Initialize the source processor
  const omtLayers = style.layers.filter(l => l.source === "openmaptiles");
  const processOmt = initSourceProcessor(omtLayers);

  // Initialize the painter functions
  const layers = style.layers.map(layer => {
    let painter = initPainterOnly({
      canvasSize: tileSize,
      styleLayer: layer,
      spriteObject: style.spriteData,
    });
    return { id: layer.id, source: layer.source, painter };
  });

  // Process the tile data, arrange it in a sources object
  t0 = performance.now();
  const processedTile = processOmt(tile, tileCoords.z);
  const sources = { openmaptiles: processedTile };
  t1 = performance.now();
  let getDataTime = (t1 - t0).toFixed(3) + "ms";

  // Render the tile, layer by layer
  t0 = performance.now();
  layers.forEach(layer => {
    let source = sources[layer.source];
    let data = (source)
      ? source[layer.id]
      : true;
    layer.painter(ctx, tileCoords.z, data, bboxes);
  });
  t1 = performance.now();
  let renderTime = (t1 - t0).toFixed(3) + "ms";

  console.log("example: total getData time: " + getDataTime);
  console.log("example: total render time: " + renderTime);
}

function mvtToJSON(tile, size) {
  // tile.laers is an object (not array!). In Mapbox Streets, it is an object
  // of { name: layer } pairs, where name = layer.name. But this is not
  // mentioned in the spec! So we use layer.name for safety
  const jsonLayers = {};
  Object.values(tile.layers).forEach(layer => {
    jsonLayers[layer.name] = layer.toGeoJSON(size);
  });
  return jsonLayers;
}
