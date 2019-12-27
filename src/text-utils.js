export function getTextShift(anchor) {
  // We use the Canvas 2D settings 
  //  textBaseline = "bottom", textAlign = "left"
  // and shift the text box based on the specified "text-anchor"
  // Returned values will be scaled by the text box dimensions
  switch (anchor) {
    case "top-left":
      return [ 0.0, 1.0];
    case "top-right":
      return [-1.0, 1.0];
    case "top":
      return [-0.5, 1.0];
    case "bottom-left":
      return [ 0.0, 0.0];
    case "bottom-right":
      return [-1.0, 0.0];
    case "bottom":
      return [-0.5, 0.0];
    case "left":
      return [ 0.0, 0.5];
    case "right":
      return [-1.0, 0.5];
    case "center":
    default:
      return [-0.5, 0.5];
  }
}
