import { getFontString } from "./font.js";
import { getTextShift  } from "./text-utils.js";

export function initTextLabeler(ctx, zoom, layout, paint) {
  const fontSize = layout["text-size"](zoom);
  const fontFace = layout["text-font"](zoom);
  const lineHeight = layout["text-line-height"](zoom);
  ctx.font = getFontString(fontFace, fontSize, lineHeight);

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

    // TODO: ctx.measureText is slow!! Need to pre-compute in data prep
    labelLength = ctx.measureText(labelText).width;
    labelHeight = fontSize * lineHeight;

    var coords = feature.geometry.coordinates;
    // Compute coordinates of bottom left corner of text
    x = coords[0] + textOffset[0] * fontSize + posShift[0] * labelLength;
    y = coords[1] + textOffset[1] * labelHeight + posShift[1] * labelHeight;

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
