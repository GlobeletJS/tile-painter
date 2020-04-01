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

  return { measure, draw };

  function measure(feature) {
    let text = feature.properties.labelText;
    if (!text) return;

    let labelLength = feature.properties.textWidth;
    let labelHeight = fontSize * lineHeight;

    // Compute coordinates of bottom left corner of text
    let coords = feature.geometry.coordinates;
    let x = coords[0] + posShift[0] * labelLength + textOffset[0] * fontSize;
    let y = coords[1] + posShift[1] * labelHeight + textOffset[1] * labelHeight;

    let bbox = [
      [x - textPadding, y - labelHeight - textPadding],
      [x + labelLength + textPadding, y + textPadding]
    ];

    return { text, position: [x, y], bbox };
  }

  function draw({ text, position }) {
    if (haloWidth > 0) ctx.strokeText(text, ...position);
    ctx.fillText(text, ...position);
  }
}
