# tile-painter

Parse Mapbox style documents into rendering functions

Please note: many features in Mapbox's [specification] are not implemented.
tile-painter is intended to be an 80/20 solution for vector tile rendering:
implementing ~80% of the style specification with 20% of the code.

Rendering is done with [Canvas 2D] methods rather than WebGL. This makes the
code simpler, but slower.

[Canvas 2D]: (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
[specification]: (https://docs.mapbox.com/mapbox-gl-js/style-spec/#layers)

## Installation
tile-painter is provided as an ESM import.
```javascript
import { initPainter } from 'tile-painter';
```

## Initialization
initPainter takes a parameter object with the following properties:
- canvasSize (integer): the pixel size of the (square) Canvas to which the 
  layer will be rendered
- styleLayer (object): an element from the layers array of a Mapbox style
  document. See the [specification] for the allowed properties of a layer.
- spriteObject (object): an object pointing to the data for a sprite atlas.
  Must include `image` and `meta` properties, pointing to *the actual data*
  (PNG and JSON). If you are starting from a style document with a URL string,
  you will need to load the data from the URL and put it in an object before
  calling tilePainter.init

## API
initPainter returns a painter function, which will render the styleLayer
on a supplied Canvas. The painter function takes four parameters:
- `context` (REQUIRED): The [Canvas 2D] rendering context on which the
  rendering calls will be executed
- `zoom` (REQUIRED): The map zoom level at which the layer will be rendered
- `sources`: An object with *the same structure* as the `sources` property of
  the style document, but containing *actual data* for a tile. Note that
  vector tile sources must be already parsed to GeoJSON, with coordinates 
  projected to the desired pixel coordinates within the supplied context's 
  canvas. REQUIRED for all layer types except "background"
- `boundingBoxes` (Optional): For layers of "symbol" type. An array containing
  the bounding boxes of "symbols" (labels and sprites) already rendered on
  the Canvas from previous layers. Bounding boxes of any new symbols in
  the current layer will be computed and checked for collisions with previously
  rendered symbols. If there is a collision, the new symbol will not be
  rendered. If there is no collision, the new symbol will be rendered, and
  its bounding box added to the array. Bounding boxes are supplied in the
  form [[xmin, ymin], [xmax, ymax]] in the current tile's pixel coordinates.

## Un-implemented features
tile-painter is a work in progress. Many features not implemented yet.
Incomplete features include:
- this list
