export function getFontString(fontSize, fontFace) {
  // Round fontSize to the nearest 0.1 pixel
  fontSize = Math.round(10.0 * fontSize) * 0.1;

  // Get the last word of the first font string
  var lastWord;
  if (fontFace) lastWord = fontFace[0].split(" ").splice(-1)[0].toLowerCase();
  
  var fontStyle;
  switch (lastWord) {
    case "bold":
      fontStyle = "bold";
      break;
    case "italic":
      fontStyle = "italic";
      break;
  }

  return (fontStyle)
    ? fontStyle + " " + fontSize + 'px "PT Sans", sans-serif'
    : fontSize + 'px "PT Sans", sans-serif';
}
