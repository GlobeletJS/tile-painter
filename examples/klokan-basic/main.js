import { parseStyle  } from 'tile-stencil';
import { initVectorProcessor } from "../../src/index.js";
import { initPainter } from "../../src/index.js";
import { xhrPromise  } from "./xhr-promise.js";
import { VectorTile  } from 'vector-tile-esm';
import Protobuf from 'pbf';

const styleHref = "./klokantech-basic-style.json";
const tileHref = "./maptiler_11-327-791.pbf";
const tileCoords = { z: 11, x: 327, y: 791 };
const tileSize = 512;

export function main() {
  // Load the style, and one tile
  let getStyle = parseStyle(styleHref);
  let getTile = xhrPromise(tileHref, "arraybuffer");

  // When both are loaded, then start rendering
  let render = Promise.all([getStyle, getTile])
    .then( ([style, tile]) => renderTile(style, tile) );
}

function renderTile(style, tileBuf) {
  // Get a Canvas2D rendering context
  const ctx = document.getElementById("tileCanvas").getContext("2d");
  ctx.canvas.width = tileSize;
  ctx.canvas.height = tileSize;

  var t0, t1, t2, t3;
  const bboxes = [];

  // Convert the tile to GeoJSON
  t0 = performance.now();
  const mvt = new VectorTile(new Protobuf(tileBuf));
  t1 = performance.now();
  let mvtTime = (t1 - t0).toFixed(3);
  console.log("Generated MVT in " + mvtTime + "ms");

  t0 = t1;
  const tile = mvtToJSON(mvt, tileSize);
  t1 = performance.now();
  let jsonTime = (t1 - t0).toFixed(3);
  console.log("Generated GeoJSON in " + jsonTime + "ms");

  // Initialize the source processor
  const omtLayers = style.layers.filter(l => l.source === "openmaptiles");
  const processor = initVectorProcessor(omtLayers, true);

  // Initialize the painter functions
  const painters = style.layers.map(layer => {
    return initPainter({
      canvasSize: tileSize,
      styleLayer: layer,
      spriteObject: style.spriteData,
    });
  });

  // Process the tile, and arrange into sources object
  const sources = { openmaptiles: processor(tile, tileCoords.z) };

  // Render the tile, layer by layer
  t0 = t2 = performance.now();
  painters.forEach(painter => {
    painter(ctx, tileCoords.z, sources, bboxes);
    //t3 = performance.now();
    //console.log("dt: " + (t3 - t2).toFixed(3) + "ms  id: " + layer.id);
    //t2 = t3;
  });
  t1 = performance.now();
  let renderTime = (t1 - t0).toFixed(3) + "ms";

  console.log("example: total render time: " + renderTime);
}

function mvtToJSON(tile, size) {
  // tile.layers is an object (not array!). In Mapbox Streets, it is an object
  // of { name: layer } pairs, where name = layer.name. But this is not
  // mentioned in the spec! So we use layer.name for safety
  const jsonLayers = {};
  Object.values(tile.layers).forEach(layer => {
    jsonLayers[layer.name] = layer.toGeoJSON(size);
  });
  return jsonLayers;
}

function mvtToJSON_old(tile, size) {
  const jsonLayers = {};
  Object.values(tile.layers).forEach(layer => {
    let features = [];
    let i = -1, n = layer.length;
    while (++i < n) features[i] = layer.feature(i).toGeoJSON(size);
    jsonLayers[layer.name] = { type: "FeatureCollection", features };
  });
  return jsonLayers;
}
