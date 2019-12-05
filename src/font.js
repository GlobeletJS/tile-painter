import { fontWeights } from "./font-weights.js";

const italicRE = /(italic|oblique)$/i;
const fontCache = {};

export function getFontString(fonts, size, lineHeight) {
  // TODO: Need to pre-load all needed fonts, using FontFace API
  if (!Array.isArray(fonts)) fonts = [fonts];

  // Check if we already calculated the CSS for this font
  var cssData = fontCache[fonts.join(",")];
  if (cssData) return combine(cssData, size, lineHeight);

  var weight = 400;
  var style = 'normal';
  var fontFamilies = [];
  fonts.forEach(font => {
    var parts = font.split(' ');

    // Get font-style from end of string
    var maybeStyle = parts[parts.length - 1].toLowerCase();
    if (["normal", "italic", "oblique"].includes(maybeStyle)) {
      style = maybeStyle;
      parts.pop();
    } else if (italicRE.test(maybeStyle)) {
      // Style is part of the last word. Separate the parts
      // NOTE: haven't seen an example of this?
      // Idea from the mapbox-to-css module on NPM
      style = italicRE.exec(maybeStyle)[0];
      parts[parts.length - 1].replace(italicRE, '');
    }

    // Get font-weight
    var testWeight1 = parts[parts.length - 1].toLowerCase();
    var testWeight2 = parts.slice(-2).join(" ").toLowerCase(); // 2-word weight
    for (let w in fontWeights) {
      if (w == testWeight1 || w.replace("-", "") == testWeight1) {
        weight = fontWeights[w];
        parts.pop();
        break;
      } else if (w.replace("-", " ") == testWeight2) {
        weight = fontWeights[w];
        parts.pop();
        parts.pop();
        break;
      }
    }
    if (typeof testWeight1 == "number") {
      weight = testWeight1;
      parts.pop();
    }

    // Get font-family
    // Special handling for Noto Sans, from mapbox-to-css module on NPM
    var fontFamily = parts.join(" ")
      .replace('Klokantech Noto Sans', 'Noto Sans');
    if (fontFamily.indexOf(" ") !== -1) { // Multi-word string. Wrap it in quotes
      fontFamily = '"' + fontFamily + '"';
    }
    fontFamilies.push(fontFamily);
  });

  fontFamilies.push("sans-serif"); // Last resort fallback

  // CSS font property: font-style font-weight font-size/line-height font-family
  cssData = fontCache[fonts.join(",")] = [style, weight, fontFamilies];

  return combine(cssData, size, lineHeight);
};

function combine(cssData, size, lineHeight) {
  // Round fontSize to the nearest 0.1 pixel
  size = Math.round(10.0 * size) * 0.1;

  // Combine with line height
  let sizes = (lineHeight) 
    ? size + "px/" + lineHeight 
    : size + "px";

  return [cssData[0], cssData[1], sizes, cssData[2]].join(" ");
}
