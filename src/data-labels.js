import { getTokenParser   } from "./tokens.js";
import { getTextTransform } from "./text-utils.js";

export function initLabelGetter(style) {
  const layout = style.layout;

  return function(features, zoom) {
    const getSpriteID = getTokenParser( layout["icon-image"](zoom) );
    const textParser = getTokenParser( layout["text-field"](zoom) );
    const textTransform = getTextTransform( layout["text-transform"](zoom) );

    function getProps(properties) {
      var spriteID = getSpriteID(properties);
      var labelText = textParser(properties);
      if (labelText) labelText = textTransform(labelText);
      return { spriteID, labelText };
    }

    return features.map( f => initLabel(f.geometry, getProps(f.properties)) );
  }
}

function initLabel(geometry, properties) {
  return { type: "Feature", geometry, properties };
}
