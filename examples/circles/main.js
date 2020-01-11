import { loadStyle, getStyleFuncs } from 'tile-stencil';
import { initTileMixer } from 'tile-mixer';
import { addPainters } from "../../src/index.js";

const styleHref = "./wells_style.json";
const tileHref = "./wells_6-14-26.pbf";
const tileCoords = { z: 6, x: 14, y: 26 };
const tileSize = 512;

export function main() {
  loadStyle(styleHref).then(getTile);
}

export function getTile(style) {
  const mixer = initTileMixer({
    threads: 1,
    source: style.sources.wells,
    layers: style.layers.filter(l => l.source === "wells"),
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
  const infoBox = document.getElementById("infoBox");
  const sources = { wells: tile };

  style.layers = style.layers.map(getStyleFuncs);
  addPainters(style);

  let t0 = performance.now();
  style.layers
    .forEach( layer => layer.painter(ctx, tileCoords.z, sources, bboxes) );
  var renderTime = (performance.now() - t0).toFixed(3) + "ms";

  infoBox.innerHTML = "Rendering time: " + renderTime;
}
