import { collectGetters } from "./style-function.js";
import { getTokenParser } from "./tokens.js";

export function iconSetup(style, sprite) {
  const getLayout = collectGetters(style.layout, [
    ["icon-image"],
    ["icon-padding", 2],
  ]);

  return (ctx, zoom) => initIconLabeler(ctx, zoom, getLayout, sprite);
}

function initIconLabeler(ctx, zoom, layout, sprite) {
  const getSpriteID = getTokenParser( layout["icon-image"](zoom) );
  const iconPadding = layout["icon-padding"](zoom);

  var spriteID, spriteMeta, x, y;

  return { measure, draw };

  function measure(feature) {
    spriteID = getSpriteID(feature.properties);
    if (!spriteID) return;

    spriteMeta = sprite.meta[spriteID];

    var coords = feature.geometry.coordinates;
    x = Math.round(coords[0] - spriteMeta.width / 2);
    y = Math.round(coords[1] - spriteMeta.height / 2);

    return [
      [x - iconPadding, y - iconPadding],
      [x + spriteMeta.width + iconPadding, y + spriteMeta.height + iconPadding]
    ];
  } 

  function draw() {
    if (!spriteID) return;

    ctx.drawImage(
      sprite.image,
      spriteMeta.x,
      spriteMeta.y,
      spriteMeta.width,
      spriteMeta.height,
      x,
      y,
      spriteMeta.width,
      spriteMeta.height
    );
  }
}
