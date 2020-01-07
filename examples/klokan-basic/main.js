import { loadStyle, getStyleFuncs } from 'tile-stencil';
import { initVectorProcessor, initPainter } from "../../src/index.js";
import { xhrPromise  } from "./xhr-promise.js";
import { initTileMixer } from 'tile-mixer';

const styleHref = "./klokantech-basic-style.json";
const tileHref = "./maptiler_11-327-791.pbf";
const tileCoords = { z: 11, x: 327, y: 791 };
const tileSize = 512;

export function main() {
  loadStyle(styleHref).then(getTile);
}

function getTile(style) {
  const mixer = initTileMixer({
    threads: 1,
    source: style.sources.openmaptiles,
    layers: style.layers.filter(l => l.source === "openmaptiles"),
  });

  function render(err, tile) {
    if (err) return console.log(err);
    renderTile(style, tile);
  }

  mixer.request(tileCoords.z, tileCoords.x, tileCoords.y, render);
}

function renderTile(style, tile) {
  // Get a Canvas2D rendering context
  const ctx = document.getElementById("tileCanvas").getContext("2d");
  ctx.canvas.width = tileSize;
  ctx.canvas.height = tileSize;

  var t0, t1, t2, t3;
  const bboxes = [];

  // Parse style functions
  style.layers = style.layers.map(getStyleFuncs);

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
