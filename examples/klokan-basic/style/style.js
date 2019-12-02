import { expandLayerReferences } from "./deref.js";
import { expandStyleURL, expandSpriteURLs, expandTileURL } from "./mapbox.js";
import { getJSON, getImage } from "./read.js";
import { initPainter } from "../../../src/index.js";

export function loadStyle(style, mbToken, canvasSize) {

  // Get a Promise that resolves to a Mapbox style document
  const getStyleJson = (typeof style === "object")
    ? Promise.resolve(style)                // style is JSON already
    : getJSON( expandStyleURL(style, mbToken) ); // Get from URL


  // Now set up a Promise chain to process the document
  return getStyleJson
    .then( expandLayerReferences )

    .then( retrieveSourceInfo )

    .then( addPainterFunctions );


  function retrieveSourceInfo(styleDoc) {
    const getSprite = loadSprite(styleDoc, mbToken);

    const expandSources = Object.keys(styleDoc.sources)
      .map(key => expandSource(key, styleDoc.sources, mbToken));

    return Promise.all([...expandSources, getSprite])
      .then(() => styleDoc);
  }

  function addPainterFunctions(styleDoc) {
    styleDoc.layers.forEach(layer => {
      layer.painter = initPainter({
        canvasSize: canvasSize,
        styleLayer: layer,
        spriteObject: styleDoc.spriteData,
      });
    });

    return styleDoc;
  }
}

function loadSprite(styleDoc, token) {
  if (!styleDoc.sprite) return;

  const urls = expandSpriteURLs(styleDoc.sprite, token);

  return Promise.all([getImage(urls.image), getJSON(urls.meta)])
    .then(([image, meta]) => { styleDoc.spriteData = { image, meta }; });
}

function expandSource(key, sources, token) {
  var source = sources[key];
  if (source.url === undefined) return; // No change

  // Load the referenced TileJSON document
  return getJSON( expandTileURL(source.url, token) )
    .then(json => merge(json));

  function merge(json) {
    // Add any custom properties from the style document
    Object.keys(source).forEach( k2 => { json[k2] = source[k2]; } );
    // Replace current entry with the TileJSON data
    sources[key] = json;
  }
}
