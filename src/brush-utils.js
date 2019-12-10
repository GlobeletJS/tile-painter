export function canv(property) {
  // Create a default state setter for a Canvas 2D renderer
  return (val, ctx) => { ctx[property] = val; };
}

export function pair(getStyle, setState) {
  // Return a style value getter and a renderer state setter as a paired object
  return { getStyle, setState };
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
