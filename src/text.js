import { getTextShift  } from "./text-utils.js";

export function initTextLabeler(ctx, zoom, layout, paint) {
  const fontSize = layout["text-size"](zoom);
  const lineHeight = layout["text-line-height"](zoom);
  const textPadding = layout["text-padding"](zoom);
  const textOffset = layout["text-offset"](zoom);

  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  const posShift = getTextShift( layout["text-anchor"](zoom) );

  const haloWidth = paint["text-halo-width"](zoom);
  if (haloWidth > 0) {
    ctx.lineWidth = haloWidth * 2.0;
    ctx.lineJoin = "round";
    ctx.strokeStyle = paint["text-halo-color"](zoom);
  }
  ctx.fillStyle = paint["text-color"](zoom);

  var labelText, labelLength, labelHeight, x, y;

  return { measure, draw };

  function measure(feature) {
    labelText = feature.properties.labelText;
    if (!labelText) return;

    labelLength = feature.properties.textWidth;
    labelHeight = fontSize * lineHeight;

    // Compute coordinates of bottom left corner of text
    var coords = feature.geometry.coordinates;
    x = coords[0] + posShift[0] * labelLength + textOffset[0] * fontSize;
    y = coords[1] + posShift[1] * labelHeight + textOffset[1] * labelHeight;

    // Return a bounding box object
    return [
      [x - textPadding, y - labelHeight - textPadding],
      [x + labelLength + textPadding, y + textPadding]
    ];
  }

  function draw() {
    if (!labelText) return;

    if (haloWidth > 0) ctx.strokeText(labelText, x, y);
    ctx.fillText(labelText, x, y);
  }
}
