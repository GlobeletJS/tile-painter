import { getSetters } from "./brush-setters.js";
import * as d3 from 'd3-geo';

export function initBrush(style, layout, paint) {
  const { dataFuncs, zoomFuncs, methods } = getSetters(style, layout, paint);

  const setZoomFuncs = (zoom, ctx, path) => zoomFuncs.forEach(f => {
    return f.setState(f.getStyle(zoom), ctx, path);
  });

  const prepData = (dataFuncs.length > 0)
    ? (zoom, data) => addStylesToFeatures(dataFuncs, zoom, data)
    : (zoom, data) => data;

  // Choose render function
  const draw = (dataFuncs.length > 0)
    ? (ctx, path, data) => drawVarying(data, ctx, path, methods, dataFuncs)
    : (ctx, path, data) => drawConstant(data, ctx, path, methods);

  return function(ctx, zoom, data) {
    const path = d3.geoPath(null, ctx);

    // Set the non-data-dependent state
    setZoomFuncs(zoom, ctx, path);

    // Prepare the data, computing data-dependent styles if needed
    const preppedData = prepData(zoom, data);

    // Draw everything and return
    return draw(ctx, path, preppedData);
  }
}

function addStylesToFeatures(propFuncs, zoom, data) {
  // Build an array of features, adding style values and a sortable id
  // WARNING: modifies the features in the original data object!
  let styledFeatures = data.features.map(feature => {
    feature.styles = propFuncs.map(f => f.getStyle(zoom, feature));
    feature.styleID = feature.styles.join("|");
    return feature;
  });

  // Sort the array, to collect features with the same styling
  styledFeatures.sort( (a, b) => (a.styleID < b.styleID) ? -1 : 1 );

  // Return a valid GeoJSON Feature Collection
  return { type: "FeatureCollection", features: styledFeatures };
}

function drawConstant(data, ctx, path, methods) {
  // Draw all the data with the current canvas state
  ctx.beginPath();
  path(data);
  methods.forEach(method => ctx[method]());
}

function drawVarying(data, ctx, path, methods, propFuncs) {
  // Draw features, updating canvas state as data-dependent styles change

  let numFeatures = data.features.length;
  let i = 0;
  while (i < numFeatures) {
    // Set state based on the styles of the current feature
    let styles = data.features[i].styles;
    propFuncs.forEach( (f, j) => f.setState(styles[j], ctx, path) );

    ctx.beginPath();
    // Add features to the path, until the styles change
    let id = data.features[i].styleID;
    while (i < numFeatures && data.features[i].styleID === id) {
      path(data.features[i]);
      i++;
    }

    // Render the current path
    methods.forEach(method => ctx[method]());
  }
}
