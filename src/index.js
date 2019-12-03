import { initBackgroundFill, initRasterFill  } from "./roller.js";
import { initBrush   } from "./brush.js";
import { initLabeler } from "./labeler.js";

export function initPainter(params) {
  const style = params.styleLayer;
  const sprite = params.spriteObject;
  const canvasSize = params.canvasSize || 512;

  const layout = style.layout;
  const paint = style.paint;

  // Define data prep and rendering functions
  var getData, render;
  switch (style.type) {
    case "background":
      getData = () => true;
      render = initBackgroundFill(layout, paint, canvasSize);
      break;
    case "raster":
      getData = makeSourceGetter(style);
      render = initRasterFill(layout, paint, canvasSize);
      break;
    case "symbol":
      getData = makeFeatureGetter(style);
      render = initLabeler(layout, paint, sprite);
      break;
    case "circle":
    case "line":
    case "fill":
      getData = makeFeatureGetter(style);
      render = initBrush(style, layout, paint);
      break;
    default:
      // Missing fill-extrusion, heatmap, hillshade
      return console.log("ERROR in initRenderer: layer.type = " +
        style.type + " not supported!");
  }

  // Compose into one function
  return function(context, zoom, sources, boundingBoxes) {
    // Quick exits if this layer is not meant to be displayed
    // TODO: this is keeping alive the link back to the style document?
    if (style.layout && style.layout["visibility"] === "none") return false;
    if (style.minzoom !== undefined && zoom < style.minzoom) return false;
    if (style.maxzoom !== undefined && zoom > style.maxzoom) return false;

    // Get the data for the layer
    const data = getData(sources);
    if (!data) return false;

    // Render
    render(context, zoom, data, boundingBoxes);

    // Restore Canvas state to starting point
    context.restore();
    // Save the starting point again (restore removed the saved copy)
    context.save();

    // Return flag to indicate the canvas has changed
    return true;
  }
}

function makeSourceGetter(style) {
  // Store the source name, so we don't re-access the style object every time
  const sourceName = style["source"];
  return (sources) => sources[sourceName];
}

function makeFeatureGetter(style) {
  const sourceName = style["source"];
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
  }
}
