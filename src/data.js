import { initPathGetter  } from "./data-paths.js";
import { initLabelGetter } from "./data-labels.js";

export function makeDataGetter(style) {
  // Background layers don't need data
  if (style.type === "background") return () => true;

  const minzoom = style.minzoom || 0;
  const maxzoom = style.maxzoom || 99; // NOTE: doesn't allow maxzoom = 0

  // Raster layers don't need any data processing
  if (style.type === "raster") return function(source, zoom) {
    if (zoom < minzoom || maxzoom < zoom) return false;
    return source;
  }

  const layerName = style["source-layer"];
  const filter = style.filter;

  const processFeatures = (style.type === "symbol") 
    ? initLabelGetter(style)
    : initPathGetter(style);

  return function(source, zoom) {
    if (!source) return false;
    if (zoom < minzoom || maxzoom < zoom) return false;

    let layer = source[layerName];
    if (!layer) return false;

    let features = layer.features.filter(filter);
    if (features.length < 1) return false;

    features = processFeatures(features, zoom);
    return { type: "FeatureCollection", features };
  };
}

export function initSourceProcessor(styles) {
  // Make sure supplied styles all read from the same source
  let sameSource = styles.map(s => s.source).every( (v, i, a) => v === a[0] );
  if (!sameSource) {
    throw Error("initSourceProcessor: supplied layers use different sources!");
  }

  // Make an [ID, getter] pair for each layer
  const getters = styles.map(style => [style.id, makeDataGetter(style)]);

  return function(source, zoom) {
    const processed = {};
    getters.forEach(([id, getter]) => {
      processed[id] = getter(source, zoom);
    });
    return processed; // Dictionary of FeatureCollections, keyed on style.id
  };
}
