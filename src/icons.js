export function initIconLabeler(ctx, zoom, layout, paint, sprite) {
  const pad = layout["icon-padding"](zoom);

  return { measure, draw };

  function measure(feature) {
    let spriteID = feature.properties.spriteID;
    if (!spriteID || !sprite) return;

    let meta = sprite.meta[spriteID];
    if (!meta) return;

    let { x: cx, y: cy, width, height } = meta;
    let crop = [cx, cy, width, height];

    let coords = feature.geometry.coordinates;
    let x = Math.round(coords[0] - width / 2);
    let y = Math.round(coords[1] - height / 2);
    let position = [x, y, width, height];

    let bbox = [ [x - pad, y - pad], [x + width + pad, y + height + pad] ];

    return { crop, position, bbox };
  } 

  function draw({ crop, position }) {
    ctx.drawImage(sprite.image, ...crop, ...position);
  }
}
