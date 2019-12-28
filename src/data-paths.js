import { geomToPath } from "./path.js";

export function initPathGetter(style) {
  // Find the names of the feature properties that affect rendering
  const renderProps = Object.values(style.layout)
    .concat(Object.values(style.paint))
    .filter(styleFunc => styleFunc.type === "property")
    .map(styleFunc => styleFunc.property);

  //return (renderProps.length > 0)
  const grouper = (renderProps.length > 0)
    ? (features) => groupFeatures(features, trimProps)
    : combineFeatures;

  return function(features) {
    const grouped = grouper(features);
    grouped.forEach(feature => {
      feature.geometry.path = geomToPath(feature.geometry);
    });
    return grouped;
  }

  function trimProps(properties) {
    let trimmed = {};
    renderProps.forEach(key => {
      trimmed[key] = properties[key];
    });
    return trimmed;
  }
}

function groupFeatures(features, selectProperties) {
  // Group features that will be styled the same
  const groups = {};
  features.forEach(feature => {
    // Keep only the properties relevant to rendering
    let properties = selectProperties(feature.properties);

    // Look up the appropriate group, or create it if it doesn't exist
    let key = Object.entries(properties).join();
    if (!groups[key]) groups[key] = initFeature(feature, properties);

    // Add this feature's coordinates to the grouped feature
    addCoords(groups[key].geometry.coordinates, feature.geometry);
  });

  return Object.values(groups).map(checkType);
}

function combineFeatures(features) {
  var group = initFeature(features[0]);
  features.forEach(f => addCoords(group.geometry.coordinates, f.geometry));
  return [ checkType(group) ];
}

function initFeature(template, properties) {
  var type = template.geometry.type;
  return {
    type: "Feature",
    geometry: { type, coordinates: [] },
    properties: properties,
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
