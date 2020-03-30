import { loadStyle, getStyleFuncs } from 'tile-stencil';
import { initTileMixer } from 'tile-mixer';
import { initMapPainter } from "../../src/index.js";

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

  let { z, x, y } = tileCoords;
  mixer.request({ z, x, y, callback: render });
}

function renderTile(style, tile) {
  // Get a Canvas2D rendering context
  const context = document.getElementById("mapCanvas").getContext("2d");
  context.canvas.width = 800;
  context.canvas.height = 600;

  // Initialize the painter functions
  const spriteObject = style.spriteData;
  const painters = style.layers
    .map( getStyleFuncs )  // Parse the .layout and .paint functions
    .map( styleLayer => {
      return initMapPainter({context, styleLayer, spriteObject, tileSize});
    });

  // Setup coordinates interaction
  const coordInput = document.getElementById("coordInput");
  coordInput.addEventListener("input", update, false);
  update();

  function update() {
    context.clearRect(0, 0, 800, 600);
    render(tile, painters, coordInput.elements);
  }
}

function render(source, painters, coords) {
  let position = {
    x: coords["posX"].value,
    y: coords["posY"].value,
    w: coords["posW"].value,
  };

  let crop = {
    x: coords["cropX"].value,
    y: coords["cropY"].value,
    w: coords["cropW"].value,
  };

  crop.w = Math.min(crop.w, tileSize - crop.x, tileSize - crop.y);
  coords["cropW"].value = crop.w;

  let zoom = tileCoords.z;
  let boxes = [];

  // Render the tile, layer by layer
  var t0 = performance.now();

  painters.forEach( painter => {
    return painter({ source, position, crop, zoom, boxes }); 
  });

  var renderTime = (performance.now() - t0).toFixed(3) + "ms";

  console.log("example: total render time: " + renderTime);
}
