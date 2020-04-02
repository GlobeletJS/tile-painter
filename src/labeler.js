import { initTextLabeler } from "./text.js";
import { initIconLabeler } from "./icons.js";

export function initLabeler(layout, paint, sprite, tileSize) {
  // Skip unsupported symbol types
  if (layout["symbol-placement"]() === "line") return () => undefined;

  const tileBox = [[0, 0], [tileSize, tileSize]];

  return function(ctx, zoom, data, boxes, scale = 1) {
    const font = data.properties.font;
    const textLabeler = initTextLabeler(zoom, layout, paint, font);
    const iconLabeler = initIconLabeler(zoom, layout, paint, sprite);

    if (scale != 1) {
      let invScale = 1 / scale;
      ctx.scale(invScale, invScale);
    }
    textLabeler.setState(ctx);

    data.compressed.forEach(drawLabel);

    if (scale != 1) ctx.scale(scale, scale);

    function drawLabel(feature) {
      // Find bounding box and other info for the sprite and text
      let icon = iconLabeler.measure(feature, scale);
      if ( icon && collides(icon.bbox) ) return;

      let text = textLabeler.measure(feature, scale);
      if ( text && collides(text.bbox) ) return;

      if (icon) boxes.push(icon.bbox);
      if (text) boxes.push(text.bbox);

      // Draw the labels, IF they are inside the tile
      if ( icon && intersects(tileBox, icon.bbox) ) {
        iconLabeler.draw(ctx, icon);
      }
      if ( text && intersects(tileBox, text.bbox) ) {
        textLabeler.draw(ctx, text);
      }
    }

    function collides(newBox) {
      if (!newBox) return false;
      return boxes.some( box => intersects(box, newBox) );
    }
  }
}

function intersects(box1, box2) {
  // box[0] = [xmin, ymin]; box[1] = [xmax, ymax]
  if (box1[0][0] > box2[1][0]) return false;
  if (box2[0][0] > box1[1][0]) return false;
  if (box1[0][1] > box2[1][1]) return false;
  if (box2[0][1] > box1[1][1]) return false;

  return true;
}
