import { loadStyle, getStyleFuncs } from 'tile-stencil';
import { initPreRenderer, addPainters } from "../../src/index.js";
import { xhrPromise  } from "./xhr-promise.js";
import { initTileMixer } from 'tile-mixer';

const styleHref = "./fiord-color-style.json";
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
  const ctx = document.getElementById("tileCanvas").getContext("2d");
  ctx.canvas.width = tileSize;
  ctx.canvas.height = tileSize;

  const bboxes = [];

  style.layers = style.layers.map(getStyleFuncs);
  const omtLayers = style.layers.filter(l => l.source === "openmaptiles");
  const processor = initPreRenderer(omtLayers);

  const sources = { openmaptiles: processor(tile, tileCoords.z) };

  addPainters(style);
  var t0 = performance.now();
  style.layers.forEach(layer => layer.painter(ctx, tileCoords.z, sources, bboxes));

  var renderTime = (performance.now() - t0).toFixed(3) + "ms";
  console.log("example: rendering time " + renderTime);
}
