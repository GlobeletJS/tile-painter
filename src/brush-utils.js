export function canv(property) {
  // Create a default state setter for a Canvas 2D renderer
  return (val, ctx) => { ctx[property] = val; };
}

export function scaleCanv(property) {
  // Canvas 2D state setter with compensation for scaling
  return (val, ctx, scale = 1) => { ctx[property] = val / scale; };
}

export function pair(getStyle, setState) {
  // Return a style value getter and a renderer state setter as a paired object
  return { getStyle, setState };
}

export function initBrush({ setters, methods }) {
  const dataFuncs = setters.filter(s => s.getStyle.type === "property");
  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property");

  return function(ctx, zoom, data, atlas, scale) {
    // Set the non-data-dependent context state
    zoomFuncs.forEach(f => f.setState(f.getStyle(zoom), ctx, scale));
    if (atlas) ctx.font = atlas;

    methods.forEach(method => {
      // Loop over features and draw
      data.compressed.forEach(f => drawFeature(ctx, method, zoom, f, scale));
    });
  }

  function drawFeature(ctx, method, zoom, feature, scale) {
    // Set data-dependent context state
    dataFuncs.forEach(f => f.setState(f.getStyle(zoom, feature), ctx, scale));

    // Draw path
    ctx[method](feature.path);
  }
}

export function makePatternSetter(sprite) {
  const { image, meta } = sprite;
  const pCanvas = document.createElement("canvas");
  const pCtx = pCanvas.getContext("2d");

  return function(spriteID, ctx) {
    const { x, y, width, height } = meta[spriteID];
    pCanvas.width = width;
    pCanvas.height = height;
    pCtx.drawImage(image, x, y, width, height, 0, 0, width, height);
    ctx.fillStyle = ctx.createPattern(pCanvas, "repeat");
  };
}
