import { getFontString } from "./font.js";
import { geomToPath } from "./path.js";

export function initPreRenderer(styles) {
  // TODO: Confirm input is an array of vector styles, all accessing the same source

  // Initialize path constructors and label printers
  const preRenderers = styles.map(style => {
    let preRenderer = (style.type === "symbol")
      ? initTextMeasurer(style)
      : addPaths;
    return [style.id, preRenderer];
  });

  // Return a function that pre-renders all layers in a source
  return function(source, zoom) {
    const preRendered = {};
    // TODO: layers should be queued...
    preRenderers.forEach( ([id, preRender]) => {
      let dataLayer = source[id];
      if (!dataLayer) return;
      // TODO: We are just updating features. Why replace the object?
      preRendered[id] = preRender(dataLayer, zoom);
    });
    return preRendered;
  };
}

function initTextMeasurer(style) {
  const layout = style.layout;
  const ctx = document.createElement("canvas").getContext("2d");

  return function(data, zoom) {
    const fontSize = layout["text-size"](zoom);
    const fontFace = layout["text-font"](zoom);
    const lineHeight = layout["text-line-height"](zoom);
    const font = getFontString(fontFace, fontSize, lineHeight);

    if (!data.properties) data.properties = {};
    data.properties.font = font;
    ctx.font = font;

    data.features.forEach(feature => {
      let labelText = feature.properties.labelText;
      if (!labelText) return;
      feature.properties.textWidth = ctx.measureText(labelText).width;
    });

    return data;
  };
}

function addPaths(data) {
  data.features.forEach(feature => {
    // TODO: Does this need to be interruptable?
    // TODO: should we replace the feature? Why keep the geometry in memory?
    feature.geometry.path = geomToPath(feature.geometry);
  });

  return data;
}
