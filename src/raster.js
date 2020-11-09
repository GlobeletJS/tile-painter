import { canv, pair } from "./utils.js";

export function initRaster(paint) {
  // TODO: skeleton idea only, not working at all
  const setters = [
    pair(paint["raster-opacity"], canv("globalAlpha")),
  ];

  const methods = ["drawImage"];

  return { setters, methods };
}
