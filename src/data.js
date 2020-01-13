export function makeDataGetter(style) {
  // Background layers don't need data
  if (style.type === "background") return () => true;
  
  // Store the source name, so we don't re-access the style object every time
  const sourceName = style["source"];

  if (style.type === "geotiff") return (sources) => sources[sourceName];

  // Raster layers don't specify a source-layer
  if (style.type === "raster") return (sources) => sources[sourceName];

  const layerName = style["source-layer"];
  const filter = style.filter;

  return function(sources) {
    let source = sources[sourceName];
    if (!source) return false;

    let layer = source[layerName];
    if (!layer) return false;

    let features = layer.features.filter(filter);
    if (features.length < 1) return false;

    return { type: "FeatureCollection", features: features };
  };
}
