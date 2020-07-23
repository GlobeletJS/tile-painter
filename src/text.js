export function initTextLabeler(zoom, layout, paint, font) {
  // Evaluate layout functions at current zoom
  const fontSize = layout["text-size"](zoom);
  const haloWidth = paint["text-halo-width"](zoom);

  return { setState, measure, draw };

  function setState(ctx) {
    ctx.font = font;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";

    if (haloWidth > 0) {
      ctx.lineWidth = haloWidth * 2.0;
      ctx.lineJoin = "round";
      ctx.strokeStyle = paint["text-halo-color"](zoom);
    }
    ctx.fillStyle = paint["text-color"](zoom);
  }

  function measure(feature, scale) {
    let text = feature.properties.labelText;
    if (!text) return;

    let labelLength = feature.properties.textWidth;
    let labelHeight = fontSize * lineHeight;

    // Compute coordinates of bottom left corner of text
    let coords = feature.geometry.coordinates.map(c => c * scale);
    let x = coords[0] + posShift[0] * labelLength + textOffset[0] * fontSize;
    let y = coords[1] + posShift[1] * labelHeight + textOffset[1] * labelHeight;

    let bbox = [
      [x - textPadding, y - labelHeight - textPadding],
      [x + labelLength + textPadding, y + textPadding]
    ];

    return { text, position: [x, y], bbox };
  }

  function draw(ctx, { text, position }) {
    if (haloWidth > 0) ctx.strokeText(text, ...position);
    ctx.fillText(text, ...position);
  }
}
