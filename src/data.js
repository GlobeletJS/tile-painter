import { initPathGetter  } from "./data-paths.js";
import { initLabelGetter } from "./data-labels.js";

export function makeDataGetter(style) {
  // TODO: returned function should input one source, rather than
  // a sources object? There may be one source per Worker...

  // Background layers don't need data
  if (style.type === "background") return () => true;

  // Store some properties, to avoid re-accessing the style object every time
  const minzoom = style.minzoom || 0;
  const maxzoom = style.maxzoom || 99; // NOTE: doesn't allow maxzoom = 0
  const sourceName = style["source"];

  // Raster layers don't specify a source-layer
  if (style.type === "raster") return getRaster;

  function getRaster(sources, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    return sources[sourceName];
  }

  const layerName = style["source-layer"];
  const filter = style.filter;

  const processFeatures = (style.type === "symbol") 
    ? initLabelGetter(style)
    : initPathGetter(style);

  return function(sources, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;

    let source = sources[sourceName];
    if (!source) return false;

    let layer = source[layerName];
    if (!layer) return false;

    let features = layer.features.filter(filter);
    if (features.length < 1) return false;

    features = processFeatures(features, zoom);
    return { type: "FeatureCollection", features };
  };
}
