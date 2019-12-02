import { xhrPromise } from "./xhr-promise.js";
import Protobuf from 'pbf';
import { VectorTile } from 'vector-tile-js';

export function getTile(tileHref, tileSize) {
  // Load a tile, parse to GeoJSON
  return xhrPromise(tileHref, "arraybuffer")
    .then( buffer => new VectorTile(new Protobuf(buffer)) )
    .then( mvt => mvtToJSON(mvt, tileSize) );
}

function mvtToJSON(tile, size) {
  // tile.layers is an object (not array!). In Mapbox Streets, it is an
  // object of { name: layer, } pairs, where name = layer.name.
  // But this is not mentioned in the spec! So we use layer.name for safety
  const jsonLayers = {};
  Object.values(tile.layers).forEach(layer => {
    jsonLayers[layer.name] = layerToJSON(layer, size);
  });
  return jsonLayers;
}

function layerToJSON(layer, size) {
  const getFeature = (i) => layer.feature(i).toGeoJSON(size);
  const features = Array.from(Array(layer.length), (v, i) => getFeature(i));

  return { type: "FeatureCollection", features: features };
}
