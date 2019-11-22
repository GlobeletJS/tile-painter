import { parseCSSColor } from 'csscolorparser';

export function collectGetters(properties = {}, keyDefaultPairs) {
  const getters = {};
  keyDefaultPairs.forEach( ([key, defaultVal]) => {
    getters[key] = buildStyleFunc(properties[key], defaultVal);
  });
  return getters;
}

export function buildStyleFunc(style, defaultVal) {
  var styleFunc, getArg;

  if (style === undefined) {
    styleFunc = () => defaultVal;
    styleFunc.type = "constant";

  } else if (typeof style !== "object" || Array.isArray(style)) {
    styleFunc = () => style;
    styleFunc.type = "constant";

  } else if (!style.property || style.property === "zoom") {
    getArg = (zoom, feature) => zoom;
    styleFunc = getStyleFunc(style, getArg);
    styleFunc.type = "zoom";

  } else {
    getArg = (zoom, feature) => feature.properties[style.property];
    styleFunc = getStyleFunc(style, getArg);
    styleFunc.type = "property";

  } // NOT IMPLEMENTED: zoom-and-property functions

  return styleFunc;
}

function getStyleFunc(style, getArg) {
  if (style.type === "identity") return getArg;

  // We should be building a stop function now. Make sure we have enough info
  var stops = style.stops;
  if (!stops || stops.length < 2 || stops[0].length !== 2) {
    console.log("buildStyleFunc: style = " + JSON.stringify(style));
    console.log("ERROR in buildStyleFunc: failed to understand style!");
    return;
  }

  var stopFunc = buildStopFunc(stops, style.base);
  return (zoom, feature) => stopFunc( getArg(zoom, feature) );
}

function buildStopFunc(stops, base = 1) {
  const izm = stops.length - 1;
  const interpolate = getInterpolator(stops[0][1]);

  return function(x) {
    let iz = stops.findIndex(stop => stop[0] > x);

    if (iz === 0) return stops[0][1]; // x is below first stop
    if (iz < 0) return stops[izm][1]; // x is above last stop

    let t = interpFactor(base, stops[iz-1][0], x, stops[iz][0]);

    return interpolate(stops[iz-1][1], stops[iz][1], t);
  }
}

function getInterpolator(sampleVal) {
  var type = typeof sampleVal;

  // Linear interpolator for numbers
  if (type === "number") return (v1, v2, t) => v1 + t * (v2 - v1);

  var isColor = (type === "string" && parseCSSColor(sampleVal));
  return (isColor)
    ? (v1, v2, t) => interpColor(parseCSSColor(v1), parseCSSColor(v2), t)
    : (v1, v2, t) => v1; // Assume step function for other types
}

function interpFactor(base, x0, x, x1) {
  // Follows mapbox-gl-js, style-spec/function/index.js.
  // NOTE: https://github.com/mapbox/mapbox-gl-js/issues/2698 not addressed!
  const range = x1 - x0;
  if (range === 0) return 0;

  const dx = x - x0;
  if (base === 1) return dx / range;

  return (Math.pow(base, dx) - 1) / (Math.pow(base, range) - 1);
}

function interpColor(c0, c1, t) {
  // Inputs c0, c1 are 4-element RGBA arrays as returned by parseCSSColor
  let c = [];
  for (let i = 0; i < 4; i++) {
    c[i] = c0[i] + t * (c1[i] - c0[i]);
  }
  return "rgba(" +
    Math.round(c[0]) + ", " +
    Math.round(c[1]) + ", " + 
    Math.round(c[2]) + ", " +
    c[3] + ")";
}
