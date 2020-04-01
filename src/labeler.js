import { initTextLabeler } from "./text.js";
import { initIconLabeler } from "./icons.js";

export function initLabeler(layout, paint, sprite, canvasSize) {
  // Skip unsupported symbol types
  if (layout["symbol-placement"]() === "line") return () => undefined;

  const tileBox = [[0, 0], [canvasSize, canvasSize]];

  return function(ctx, zoom, data, boxes) {
    ctx.font = data.properties.font;
    const textLabeler = initTextLabeler(ctx, zoom, layout, paint);
    const iconLabeler = initIconLabeler(ctx, zoom, layout, paint, sprite);

    data.compressed.forEach(drawLabel);

    function drawLabel(feature) {
      let text = textLabeler.measure(feature);
      if ( text && collides(text.bbox) ) return;

      let icon = iconLabeler.measure(feature);
      if ( icon && collides(icon.bbox) ) return;

      // Draw the labels, IF they are inside the tile
      if ( icon && intersects(tileBox, icon.bbox) ) {
        iconLabeler.draw(icon);
        boxes.push(icon.bbox); // TODO: add box even if outside?
      }
      if ( text && intersects(tileBox, text.bbox) ) {
        textLabeler.draw(text);
        boxes.push(text.bbox); // TODO: add box even if outside?
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
