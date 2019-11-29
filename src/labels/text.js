import { collectGetters } from "../style-func.js";
import { getTokenParser } from "./tokens.js";
import { getFontString  } from "./font.js";
import { getTextShift, getTextTransform } from "./text-utils.js";

export function textSetup(style) {
  // Parse the style properties into zoom-dependent functions
  const getLayout = collectGetters(style.layout, [
    ["text-field"],
    ["text-size", 16],
    ["text-font"],
    ["text-line-height", 1.2],
    ["text-padding", 2.0],
    ["text-offset", [0, 0]],
    ["text-anchor"],
    ["text-transform", "none"],
  ]);

  const getPaint = collectGetters(style.paint, [
    ["text-color"],
    ["text-halo-color"],
    ["text-halo-width", 0],
  ]);

  return (ctx, zoom) => initTextLabeler(ctx, zoom, getLayout, getPaint);
}

function initTextLabeler(ctx, zoom, layout, paint) {
  const textParser = getTokenParser( layout["text-field"](zoom) );

  const fontSize = layout["text-size"](zoom);
  const fontFace = layout["text-font"](zoom);
  ctx.font = getFontString(fontSize, fontFace);

  const lineHeight = layout["text-line-height"](zoom);
  const textPadding = layout["text-padding"](zoom);
  const textOffset = layout["text-offset"](zoom);

  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  const posShift = getTextShift( layout["text-anchor"](zoom) );

  const transform = getTextTransform( layout["text-transform"](zoom) );

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
    labelText = textParser(feature.properties);
    if (!labelText) return;

    labelText = transform(labelText);
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
