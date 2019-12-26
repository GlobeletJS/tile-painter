import { geomToPath } from "./path.js";

export function canv(property) {
  // Create a default state setter for a Canvas 2D renderer
  return (val, ctx) => { ctx[property] = val; };
}

export function pair(getStyle, setState) {
  // Return a style value getter and a renderer state setter as a paired object
  return { getStyle, setState };
}

export function initBrush({ setters, methods }) {
  const dataFuncs = setters.filter(s => s.getStyle.type === "property");
  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property");

  return function(ctx, zoom, data) {
    // Set the non-data-dependent context state
    zoomFuncs.forEach(f => f.setState(f.getStyle(zoom), ctx));

    // Loop over features and draw
    data.features.forEach(feature => drawFeature(ctx, zoom, feature));
  }

  function drawFeature(ctx, zoom, feature) {
    // Set data-dependent context state
    dataFuncs.forEach(f => f.setState(f.getStyle(zoom, feature), ctx));

    // Construct Path and draw
    let path = geomToPath(feature.geometry); // TODO: move to data prep
    methods.forEach(method => ctx[method](path));
  }
}

export function makePatternSetter(sprite) {
  return function(spriteID, ctx) {
    const sMeta = sprite.meta[spriteID];
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = sMeta.width;
    patternCanvas.height = sMeta.height;
    const pCtx = patternCanvas.getContext("2d");
    pCtx.drawImage(
      sprite.image, 
      sMeta.x, 
      sMeta.y, 
      sMeta.width, 
      sMeta.height,
      0,
      0,
      sMeta.width,
      sMeta.height
    );
    ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat");
  };
}
