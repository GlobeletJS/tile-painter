import { parseStyle  } from 'tile-stencil';
import { addPainters } from "../../src/index.js";
import { getTile     } from "./read.js";

const styleHref = "./klokantech-basic-style.json";
const tileHref = "./maptiler_11-327-791.pbf";
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
  let tilePromise = getTile(tileHref, tileSize);
  
  // Render to the Canvas
  let render = Promise.all([getStyle, tilePromise])
    .then( ([style, tile]) => {
      let sources = { openmaptiles: tile };
      style.layers.forEach( layer => layer.painter(ctx, 11, sources, bboxes) );
    });
}
