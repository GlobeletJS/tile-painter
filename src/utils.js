export function canv(property) {
  // Create a default state setter for a Canvas 2D renderer
  return (val, ctx) => { ctx[property] = val; };
}

export function pair(getStyle, setState) {
  // Return a style value getter and a renderer state setter as a paired object
  return { getStyle, setState };
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
