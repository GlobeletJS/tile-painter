import { loadStyle, getStyleFuncs } from 'tile-stencil';
import { initTileMixer } from 'tile-mixer';
import { addPainters } from "../../src/index.js";

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

  let { z, x, y } = tileCoords;
  mixer.request({ z, x, y, callback: render });
}

function renderTile(style, tile) {
  const ctx = document.getElementById("tileCanvas").getContext("2d");
  ctx.canvas.width = tileSize;
  ctx.canvas.height = tileSize;

  const bboxes = [];
  const sources = { openmaptiles: tile };

  style.layers = style.layers.map(getStyleFuncs);
  addPainters(style);

  var t0 = performance.now();
  style.layers
    .forEach( layer => layer.painter(ctx, tileCoords.z, sources, bboxes) );
  var renderTime = (performance.now() - t0).toFixed(3) + "ms";

  console.log("example: rendering time " + renderTime);
}
