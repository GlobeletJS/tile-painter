export function makeDataGetter(style) {
  // Background layers don't need data
  if (style.type === "background") return () => true;

  // Store the source name, so we don't re-access the style object every time
  const sourceName = style["source"];
  // Raster layers don't specify a source-layer
  if (style.type === "raster") return (sources) => sources[sourceName];

  const layerName = style["source-layer"];
  const filter = style.filter;

  const renderProps = Object.values(style.layout)
    .concat(Object.values(style.paint))
    .filter(styleFunc => styleFunc.type === "property")
    .map(styleFunc => styleFunc.property);

  const processFeatures = (style.type === "symbol") ? processLabels
    : (renderProps.length < 1) ? combineFeatures
    : (features) => groupFeatures(features, trimProps);

  return function(sources) {
    let source = sources[sourceName];
    if (!source) return false;

    let layer = source[layerName];
    if (!layer) return false;

    let features = layer.features.filter(filter);
    if (features.length < 1) return false;

    return { type: "FeatureCollection", features: processFeatures(features) };
  };

  function processLabels(rawFeatures) {
    // TODO: Compute text, sprite ID, etc
    return rawFeatures;
  }

  function trimProps(properties) {
    let trimmed = {};
    renderProps.forEach(key => {
      trimmed[key] = properties[key];
    });
    return trimmed;
  }
}

function groupFeatures(rawFeatures, selectProperties) {
  // Group features that will be styled the same
  const groups = {};
  rawFeatures.forEach(feature => {
    // Keep only the properties relevant to rendering
    let properties = selectProperties(feature.properties);

    // Look up the appropriate group, or create it if it doesn't exist
    let key = Object.entries(properties).join();
    if (!groups[key]) {
      groups[key] = initFeature(feature);
      groups[key].properties = properties;
    }

    // Add this feature's coordinates to the grouped feature
    addCoords(groups[key].geometry.coordinates, feature.geometry);
  });

  // Combine features with same styling into one Multi-* feature
  return Object.values(groups).map(checkType);
}

function combineFeatures(rawFeatures) {
  var group = initFeature(rawFeatures[0]);
  rawFeatures.forEach(f => addCoords(group.geometry.coordinates, f.geometry));
  return [ checkType(group) ];
}

function initFeature(template) {
  return {
    type: "Feature",
    geometry: {
      type: template.geometry.type,
      coordinates: [],
    },
  };
}

function addCoords(coords, geom) {
  if (geom.type.substring(0, 5) === "Multi") {
    geom.coordinates.forEach(coord => coords.push(coord));
  } else {
    coords.push(geom.coordinates);
  }
}

function checkType(feature) {
  // Check if we have a Multi-* geometry, and make sure it is labeled correctly
  let geom = feature.geometry;
  let labeledMulti = geom.type.substring(0, 5) === "Multi";

  if (geom.coordinates.length < 2) {  // Not Multi
    geom.coordinates = geom.coordinates[0];
    if (labeledMulti) geom.type = geom.type.substring(5);

  } else if (!labeledMulti) {
    geom.type = "Multi" + geom.type;
  }

  return feature;
}
