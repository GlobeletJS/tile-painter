import * as d3 from 'd3-geo';

export function initBrush({ setters, methods }) {
  const dataFuncs = setters.filter(s => s.getStyle.type === "property");
  const zoomFuncs = setters.filter(s => s.getStyle.type !== "property");

  // Choose draw function based on whether styles are data-dependent
  const draw = (dataFuncs.length > 0)
    ? dataDependentDraw
    : constantDraw;

  return function(ctx, zoom, data) {
    const path = d3.geoPath(null, ctx);

    // Set the non-data-dependent state
    zoomFuncs.forEach(f => f.setState(f.getStyle(zoom), ctx, path));

    // Draw everything and return
    return draw(ctx, path, zoom, data);
  }

  function dataDependentDraw(ctx, path, zoom, data) {
    const features = addStylesToFeatures(dataFuncs, zoom, data);

    // Draw features, updating canvas state as data-dependent styles change
    let numFeatures = features.length;
    let i = 0;
    while (i < numFeatures) {
      // Set state based on the styles of the current feature
      let styles = features[i].styles;
      dataFuncs.forEach( (f, j) => f.setState(styles[j], ctx, path) );

      ctx.beginPath();
      // Add features to the path, until the styles change
      let id = features[i].styleID;
      while (i < numFeatures && features[i].styleID === id) {
        path(features[i]);
        i++;
      }

      // Render the current path
      methods.forEach(method => ctx[method]());
    }
  }

  function constantDraw(ctx, path, zoom, data) {
    // Draw all the data with the current canvas state
    ctx.beginPath();
    path(data);
    methods.forEach(method => ctx[method]());
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
  return styledFeatures.sort( (a, b) => (a.styleID < b.styleID) ? -1 : 1 );
}
