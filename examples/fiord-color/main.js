import { parseStyle  } from 'tile-stencil';
import { initVectorProcessor, addPainters } from "../../src/index.js";
import { xhrPromise  } from "./xhr-promise.js";
import { VectorTile  } from 'vector-tile-esm';
import Protobuf from 'pbf';

const styleHref = "./fiord-color-style.json";
const tileHref = "./maptiler_11-327-791.pbf";
const tileCoords = { z: 11, x: 327, y: 791 };
const tileSize = 512;

export function main() {
  const bboxes = [];

  // Get a Canvas2D rendering context
  const ctx = document.getElementById("tileCanvas").getContext("2d");
  ctx.canvas.width = tileSize;
  ctx.canvas.height = tileSize;

  // Load the style, and add painter functions
  let getStyle = parseStyle(styleHref)
    .then( addPainters );

  // Load a tile, parse to GeoJSON
  let getTile = xhrPromise(tileHref, "arraybuffer")
    .then( buffer => new VectorTile(new Protobuf(buffer)) )
    .then( mvt => mvtToJSON(mvt, tileSize) );

  // Render to the Canvas
  let render = Promise.all([getStyle, getTile])
    .then( ([style, tile]) => {
      const omtLayers = style.layers.filter(l => l.source === "openmaptiles");
      const processor = initVectorProcessor(omtLayers, true);
      let sources = { openmaptiles: processor(tile, tileCoords.z) };
      var t0 = performance.now();
      style.layers.forEach( layer => layer.painter(ctx, 11, sources, bboxes) );
      var renderTime = (performance.now() - t0).toFixed(3) + "ms";
      console.log("example: rendering time " + renderTime);
    });
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
