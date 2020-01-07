import { initSourceFilter   } from "./source-filter.js";
import { initFeatureGrouper } from "./group-features.js";
import { initLabelParser    } from "./parse-labels.js";
import { initPreRenderer    } from "./prerender.js";

const vectorTypes = ["symbol", "circle", "line", "fill"];

export function initVectorProcessor(layers, verbose) {
  // Confirm supplied styles are all vector layers reading from the same source
  let allVectors = layers.every( l => vectorTypes.includes(l.type) );
  let sameSource = layers.every( l => l.source === layers[0].source );
  if (!allVectors) {
    throw Error("initVectorProcessor: not all layers are vector types!");
  } else  if (!sameSource) {
    throw Error("initVectorProcessor: supplied layers use different sources!");
  }

  var t0, t1, timeString;

  //const filter = initSourceFilter(layers);
  const compress = initSourceCompressor(layers);
  const prerender = initPreRenderer(layers);

  return function(tile, zoom) {
    if (verbose) t0 = performance.now();

    //const dataLayers = filter(tile, zoom);
    //if (verbose) reportTime("filter");

    //const compressed = compress(dataLayers, zoom);
    const compressed = compress(tile, zoom);
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
      processed[id] = getter(dataLayer, zoom);
    });
    return processed;
  };
}
