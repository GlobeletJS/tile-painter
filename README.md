# tile-painter

Canvas 2D rendering for vector maps, guided by a Mapbox style document

Rendering is done with [Canvas 2D] methods rather than WebGL. This makes the
code simpler, but slower.

See a simple [example] using data and styles from [OpenMapTiles].

Please note: many features in Mapbox's [specification] are not implemented.
tile-painter is intended to be an 80/20 solution for vector tile rendering:
implementing ~80% of the style specification with 20% of the code.

[Canvas 2D]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
[OpenMapTiles]: https://openmaptiles.org/styles/
[example]: https://globeletjs.github.io/tile-painter/examples/klokan-basic/
[specification]: https://docs.mapbox.com/mapbox-gl-js/style-spec/#layers
[tile-stencil]: https://github.com/GlobeletJS/tile-stencil

## Installation
tile-painter is provided as an ESM import.
```javascript
import * as tilePainter from 'tile-painter';
```

tilePainter exposes two methods: initPainter and addPainters

## initPainter
Returns a painter function for a single style layer

### Syntax
```javascript
const painter = initPainter(params);
```

### Parameters
The supplied parameters object has the following properties:
- canvasSize (integer): the pixel size of the (square) Canvas to which the 
  layer will be rendered. Default: 512
- styleLayer (object): an element from the layers array of a Mapbox style
  document, where the `.filter`, `.layout`, and `.paint` properties have been
  parsed into functions. See the parseLayer function of [tile-stencil] for
  the expected signature of these functions.  REQUIRED
- spriteObject (object): an object pointing to the data for a sprite atlas.
  Must include `image` and `meta` properties, pointing to *the actual data*
  (PNG and JSON). If you are starting from a style document with a URL string,
  you will need to load the data from the URL and put it in an object before
  calling initPainter. REQUIRED if `layer.type === "symbol"` and
  `icon-<property>` parameters are set

### Return value
initPainter returns a painter function, which will render the styleLayer
on a supplied Canvas. The painter function has the following signature:
```javascript
var modified = painter(context, zoom, sources, boundingBoxes);
```
where `modified` is a (Boolean) flag indicating whether `context.canvas` has
been changed. The supplied parameters are:
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
  form [[xmin, ymin], [xmax, ymax]] in the current tile's pixel coordinates

## addPainters
Adds a painter function to every layer of a style document

### Syntax
```javascript
const styleDoc = addPainters(styleDoc, canvasSize);
```

### Parameters
- `canvasSize`: The size (in pixels) of the canvas to which the supplied
  context is drawing. Default: 512
- `styleDoc`: A parsed Mapbox style document, as output by the parseStyle 
  function from [tile-stencil].

### Return value
A link back to the modified style document. (NOTE: input document is changed!)
Each layer in the document will have an added `.painter` property, which is
a function constructed by initPainter as described above.

## Un-implemented features
tile-painter is a work in progress. Many features are not implemented yet.
Incomplete features include:

- This list
- [symbol-placement] values other than "point". Text following roads or
  riverbeds will not be rendered!
- Rotated symbols (text and sprites)
- Text wrapping for long labels. [text-max-width] is ignored

Pull requests are welcomed!

[symbol-placement]: https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-symbol-symbol-placement
[text-max-width]: https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-symbol-text-max-width
