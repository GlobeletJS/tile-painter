import { getTokenParser } from "./data-tokens.js";
import { getFontString } from "./font.js";

export function initLabelGetter(style) {
  const layout = style.layout;

  return function(features, zoom) {
    const getSpriteID = getTokenParser( layout["icon-image"](zoom) );
    const parseText = getTokenParser( layout["text-field"](zoom) );
    const transformText = getTextTransform( layout["text-transform"](zoom) );

    function getProps(properties) {
      var spriteID = getSpriteID(properties);
      var labelText = parseText(properties);
      if (labelText) labelText = transformText(labelText);
      return { spriteID, labelText };
    }

    return features.map( f => initLabel(f.geometry, getProps(f.properties)) );
  }
}

function initLabel(geometry, properties) {
  return { type: "Feature", geometry, properties };
}

function getTextTransform(code) {
  switch (code) {
    case "uppercase":
      return f => f.toUpperCase();
    case "lowercase":
      return f => f.toLowerCase();
    case "none":
    default:
      return f => f;
  }
}
