import { getTile   } from "./read.js";
import { loadStyle } from "./style/style.js";

const tileHref = "https://api.maptiler.com/tiles/v3/11/327/791.pbf?key=mrAq6zQEFxOkanukNbGm";

export function main() {
  const tileSize = 512;
  const bboxes = [];

  // Get a Canvas2D rendering context
  const ctx = document.getElementById("tileCanvas").getContext("2d");
  ctx.canvas.width = tileSize;
  ctx.canvas.height = tileSize;

  // Load the style
  let getStyle = loadStyle("./klokantech-basic-style.json", null, tileSize);
  
  // Load a tile, parse to GeoJSON
  let tilePromise = getTile(tileHref, tileSize);
  
  // Render to the Canvas
  let render = Promise.all([getStyle, tilePromise])
    .then( ([style, tile]) => {
      let sources = { openmaptiles: tile };
      style.layers.forEach( layer => layer.painter(ctx, 11, sources, bboxes) );
    });
}
