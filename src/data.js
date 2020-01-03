import { initSourceFilter   } from "./sources/source-filter.js";
import { initFeatureGrouper } from "./sources/group-features.js";
import { initLabelParser    } from "./sources/parse-labels.js";
import { initPreRenderer    } from "./prerender.js";

export function initVectorProcessor(layers, verbose) {
  var t0, t1, timeString;

  const filter = initSourceFilter(layers);
  const compress = initSourceCompressor(layers);
  const prerender = initPreRenderer(layers);

  return function(tile, zoom) {
    if (verbose) t0 = performance.now();

    const dataLayers = filter(tile, zoom);
    if (verbose) reportTime("filter");

    const compressed = compress(dataLayers, zoom);
    if (verbose) reportTime("compress");

    const prerendered = prerender(compressed, zoom);
    if (verbose) reportTime("prerender");

    return prerendered;
  };

  function reportTime(process) {
    t1 = performance.now();
    timeString = (t1 - t0).toFixed(3) + "ms";
    console.log("vectorProcessor: " + timeString + " " + process + "ing");
    t0 = t1;
  }
}

function initSourceCompressor(styles) {
  // Make sure supplied styles all read from the same source
  let sameSource = styles.map(s => s.source).every( (v, i, a) => v === a[0] );
  if (!sameSource) {
    throw Error("initSourceCompressor: supplied layers use different sources!");
  }
  // Make sure styles are vector types? TODO

  // Make an [ID, getter] pair for each layer
  const getters = styles.map(style => {
    let getter = (style.type === "symbol")
      ? initLabelParser(style)
      : initFeatureGrouper(style);
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
