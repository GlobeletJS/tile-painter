// https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight#Common_weight_name_mapping
// Some obscure names from https://css3-tutorial.net/text-font/font-weight/
// But the 2 sources conflict!! The mapping is not standardized!
const fontWeights = {
  "thin": 100,
  "hairline": 100,
  "extra-light": 200,
  "ultra-light": 200,
  "light": 300,
  "book": 300,
  "regular": 400,
  "normal": 400,
  "plain": 400,
  "roman": 400,
  "standard": 400,
  "medium": 500,
  "semi-bold": 600,
  "demi-bold": 600,
  "bold": 700,
  "extra-bold": 800,
  "ultra-bold": 800,
  "heavy": 900,
  "black": 900,
  "fat": 900,
  "poster": 900,
  "ultra-black": 950,
  "extra-black": 950,
  "heavy-black": 950,
};
const wNames = Object.keys(fontWeights);

export function popFontWeight(words, defaultWeight) {
  // Input words is an array of words from a font descriptor string, 
  // where the last word (or two) may contain font-weight info. 
  // Returns a numeric font-weight (if found), or defaultWeight
  // NOTES
  //  - ASSUMES font-style info (italics) has already been removed.
  //  - Input words array may be shortened!

  // If the last word is already a numeric weight, just remove and return it
  if (typeof words.slice(-1)[0] === "number") return words.pop();

  // Check if the last word matches one of the weight names in the dictionary
  var test = words.slice(-1)[0].toLowerCase();
  let wName = wNames.find(w => w == test || w.replace("-", "") == test);
  if (wName) {
    words.pop();
    return fontWeights[wName];
  }

  // Try again with the last 2 words
  test = words.slice(-2).join(" ").toLowerCase();
  wName = wNames.find(w => w.replace("-", " ") == test);
  if (wName) {
    words.pop();
    words.pop();
  }
  return fontWeights[wName] || defaultWeight;
}
