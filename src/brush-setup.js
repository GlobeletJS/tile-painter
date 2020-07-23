import { canv, scaleCanv, pair, initBrush, makePatternSetter } from "./brush-utils.js";

export function initCircle(layout, paint) {
  const setRadius = (radius, ctx, scale = 1) => {
    ctx.lineWidth = radius * 2 / scale;
  }
  const setters = [
    pair(paint["circle-radius"],  setRadius),
    pair(paint["circle-color"],   canv("strokeStyle")),
    pair(paint["circle-opacity"], canv("globalAlpha")),
    pair(() => "round",           canv("lineCap")),
  ];
  const methods = ["stroke"];

  return initBrush({ setters, methods });
}

export function initLine(layout, paint) {
  const setters = [
    pair(layout["line-cap"],      canv("lineCap")),
    pair(layout["line-join"],     canv("lineJoin")),
    pair(layout["line-miter-limit"], canv("miterLimit")),
    // line-round-limit,

    pair(paint["line-width"],     scaleCanv("lineWidth")),
    pair(paint["line-opacity"],   canv("globalAlpha")),
    pair(paint["line-color"],     canv("strokeStyle")),
    // line-gap-width, 
    // line-translate, line-translate-anchor,
    // line-offset, line-blur, line-gradient, line-pattern, 
  ];

  let dasharray = paint["line-dasharray"];
  if (dasharray.type !== "constant" || dasharray() !== undefined) {
    const getWidth = paint["line-width"];
    const getDash = (zoom, feature) => {
      let width = getWidth(zoom, feature);
      let dashes = dasharray(zoom, feature);
      return dashes.map(d => d * width);
    };
    const setDash = (dash, ctx, scale = 1) => {
      ctx.setLineDash(dash.map(d => d / scale));
    };
    setters.push( pair(getDash, setDash) );
  };
  const methods = ["stroke"];

  return initBrush({ setters, methods });
}

export function initFill(layout, paint, sprite) {
  var getStyle, setState;

  let pattern = paint["fill-pattern"];
  if (pattern.type !== "constant" || pattern() !== undefined) {
    // Fill with a repeated sprite. Style getter returns sprite name
    getStyle = pattern;
    setState = makePatternSetter(sprite);
  } else {
    // Fill with a solid color
    getStyle = paint["fill-color"];
    setState = canv("fillStyle");
  }

  const setTranslate = (t, ctx, scale = 1) => {
    ctx.translate(t[0] / scale, t[1] / scale);
  };
  const setters = [
    pair(getStyle, setState),
    pair(paint["fill-opacity"],   canv("globalAlpha")),
    pair(paint["fill-translate"], setTranslate),
    // fill-translate-anchor,
  ];
  const methods = ["fill"];

  let outline = paint["fill-outline-color"];
  if (outline.type !== "constant" || outline() !== undefined) {
    setters.push(
      pair(paint["fill-outline-color"], canv("strokeStyle")),
      pair(paint["fill-outline-width"], scaleCanv("lineWidth")), // nonstandard
    );
    methods.push("stroke");
  }

  return initBrush({ setters, methods });
}

export function initSymbol(layout, paint, sprite) {
  const setters = [
    pair(layout["text-size"], scaleCanv("fontSize")),

    pair(paint["text-color"], canv("fillStyle")),
    pair(paint["text-opacity"], canv("globalAlpha")),

    pair(paint["text-halo-color"], canv("strokeStyle")),
  ];

  const methods = ["fillText"];

  return initBrush({ setters, methods });
}
