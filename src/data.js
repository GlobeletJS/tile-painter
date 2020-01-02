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

  return function(source, zoom) {
    if (!source) return false;
    if (zoom < minzoom || maxzoom < zoom) return false;

    let layer = source[style.id];
    if (!layer || layer.features.length < 1) return false;

    return layer;
  };
}

export function initSourceCompressor(styles) {
  // Make sure supplied styles all read from the same source
  let sameSource = styles.map(s => s.source).every( (v, i, a) => v === a[0] );
  if (!sameSource) {
    throw Error("initSourceCompressor: supplied layers use different sources!");
  }
  // Make sure styles are vector types? TODO

  // Make an [ID, getter] pair for each layer
  const getters = styles.map(style => {
    let getter = (style.type === "symbol")
      ? initLabelGetter(style)
      : initPathGetter(style);
    return [style.id, getter];
  });

  return function(source, zoom) {
    const processed = {};
    getters.forEach(([id, getter]) => {
      let dataLayer = source[id];
      if (!dataLayer) return;
      let features = getter(dataLayer.features, zoom);
      processed[id] = { type: "FeatureCollection", features };
    });
    return processed;
  };
}
