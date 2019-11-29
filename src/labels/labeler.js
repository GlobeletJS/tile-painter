import { textSetup } from "./text.js";
import { iconSetup } from "./icons.js";

export function initLabeler(style, sprite) {
  // Skip unsupported symbol types
  if (style.layout["symbol-placement"] === "line") return () => undefined;

  const initTextLabeler = textSetup(style);
  const initIconLabeler = iconSetup(style, sprite);

  return function(ctx, zoom, data, boxes) {
    const textLabeler = initTextLabeler(ctx, zoom);
    const iconLabeler = initIconLabeler(ctx, zoom);

    data.features.forEach(drawLabel);

    function drawLabel(feature) {
      var textBox = textLabeler.measure(feature);
      if ( collides(textBox) ) return;

      var iconBox = iconLabeler.measure(feature);
      if ( collides(iconBox) ) return;

      if (textBox) boxes.push(textBox);
      if (iconBox) boxes.push(iconBox);

      // Draw the labels
      iconLabeler.draw();
      textLabeler.draw();
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
