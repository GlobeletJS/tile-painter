import { buildFeatureFilter } from "./filter.js";

const vectorTypes = ["symbol", "circle", "line", "fill"];

export function initSourceFilter(styles) {
  // Make sure supplied styles all read from the same source
  let sameSource = styles.map(s => s.source).every( (v, i, a) => v === a[0] );
  if (!sameSource) {
    throw Error("initSourceFilter: supplied layers use different sources!");
  }

  // Make an [ID, getter] pair for each layer
  const filters = styles.map(style => [style.id, makeLayerFilter(style)]);

  return function(source, zoom) {
    const filtered = {};
    filters.forEach(([id, filter]) => {
      let data = filter(source, zoom);
      if (data) filtered[id] = data;
    });
    return filtered; // Dictionary of FeatureCollections, keyed on style.id
  };
}

function makeLayerFilter(style) {
  // Make sure this is a vector style
  if (!vectorTypes.includes(style.type)) {
    throw Error("makeDataGetter: supplied style is not a vector layer!");
  }

  const minzoom = style.minzoom || 0;
  const maxzoom = style.maxzoom || 99; // NOTE: doesn't allow maxzoom = 0

  const sourceLayer = style["source-layer"];
  const filter = buildFeatureFilter(style.filter);

  return function(source, zoom = minzoom) {
    // source is a dictionary of FeatureCollections, keyed on source-layer
    if (!source) return false;
    if (zoom < minzoom || maxzoom < zoom) return false;

    let layer = source[sourceLayer];
    if (!layer) return false;

    let features = layer.features.filter(filter);
    if (features.length < 1) return false;

    return { type: "FeatureCollection", features };
  };
}
