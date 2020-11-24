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
[example]: https://globeletjs.github.io/tile-painter/examples/map-painter/
[specification]: https://docs.mapbox.com/mapbox-gl-js/style-spec/#layers
[tile-stencil]: https://github.com/GlobeletJS/tile-stencil

## Installation
tile-painter is provided as an ESM import.
```javascript
import * as tilePainter from 'tile-painter';
```

## Syntax
```javascript
const painter = tilePainter.initMapPainter(params);
```

Returns a painter function that will paint one layer from one tile, 
at a given location and scale on the supplied context's canvas.

## Parameters
The supplied parameters object has the following properties:
- `tileSize` (number): the pixel size of the (square) input tiles, in the
  same coordinates as the feature geometries.  Default: 512
- `styleLayer` (object): an element from the layers array of a Mapbox style
  document, where the `.layout` and `.paint` properties have been parsed into
  functions. See the `getStyleFuncs` method of [tile-stencil] for the expected
  signature of these functions.  REQUIRED
- `spriteObject` (object): an object pointing to the data for a sprite atlas.
  Must include `image` and `meta` properties, pointing to *the actual data*
  (PNG and JSON). If you are starting from a style document with a URL string,
  you will need to load the data from the URL and put it in an object before
  calling initPainter. REQUIRED if `layer.type === "symbol"` and
  `icon-<property>` parameters are set
- `context`: A link to the [Canvas 2D] rendering context to which the painter
  will draw.  REQUIRED

## Return value
initMapPainter returns a painter function, which will render the `styleLayer`
on the `context`'s canvas. The painter function has the following signature:
```javascript
var modified = painter(params);
```
where `modified` is a (Boolean) flag indicating whether `context.canvas` has
changed. The supplied `params` object has the following properties:
- `source`: Map data from the `source` property of the style layer, to be
  rendered on the map. Vector tile sources must be pre-processed by the
  [tile-mixer] module. See below for details.
  REQUIRED for all layer types except "background"
- `position`: An object describing the area on the output map to which the
  supplied source data will be rendered. Required properties:
  - `x`: The x-coordinate of the top left corner of the area to be rendered,
    in **map** pixels from the left edge of the map
  - `y`: The y-coordinate of the top left corner of the area to be rendered,
    in **map** pixels from the top edge of the map
  - `w`: The width of the (square) area to be rendered, in map pixels
- `crop`: An object describing the portion of the supplied source data to be
  rendered. Required properties:
  - `x`: The x-coordinate of the source data that will be aligned with the
    left edge of the rendered area on the map
  - `y`: The y-coordinate of the source data that will be aligned with the
    top edge of the rendered area on the map
  - `w`: The width of the (square) portion of the source data that will
    be rendered, in **source data coordinates**
- `zoom`: The current zoom level of the map, to be used in style calculations
- `boxes` (Optional): For layers of "symbol" type. An array containing
  the bounding boxes of "symbols" (labels and sprites) already rendered on
  the Canvas from previous layers. Bounding boxes of any new symbols in
  the current layer will be computed and checked for collisions with previously
  rendered symbols. If there is a collision, the new symbol will not be
  rendered. If there is no collision, the new symbol will be rendered, and
  its bounding box added to the array. Bounding boxes are supplied in the
  form [[xmin, ymin], [xmax, ymax]] in the current tile's pixel coordinates

## Required vector source pre-processing
The supplied `source` object for vector layers is assumed to be a dictionary
of GeoJSON FeatureCollections, where each FeatureCollection corresponds to the
data for one style layer (as returned by tile-mixer).

Each FeatureCollection may have two non-standard properties:
- `properties`: For layers of type `symbol`, this top-level `properties`
  object should contain a `font` property, with the value being a CSS font
  string to be used for all `symbols` in the layer.
- `compressed`: An array of features as pre-processed by [tile-mixer]

For style layers with type `circle`, `line`, or `fill`, each feature in the
`compressed` array should  have the following properties:
  - `properties`: The feature properties that affect styling.
  - `path`: A [Path2D] object corresponding to the geometry of the feature
Path coordinates must be scaled from the vector tile's `.extent` to the 
desired pixel size of the rendered tile. Layers of type `circle` have a path
of the form `M x y L x y` (in SVG notation) for **each point in the layer**.

For style layers with type `symbol`, each feature in the `compressed` array
may have the following properties:
- `geometry`: A GeoJSON geometry where the symbol will be drawn. Only `Point`
  geometries are currently supported. REQUIRED.
- `properties.labelText`: The text to be written at this label position
- `properties.textWidth`: The measured width of the text, as given by
  `ctx.measureText(labelText).width`
- `properties.spriteID`: The key to the metadata of the sprite to be written. 
  This will be retrieved from the `spriteObject` supplied on initialization 
  as follows: `spriteMeta = spriteObject.meta[spriteId]`

[tile-mixer]: https://github.com/GlobeletJS/tile-mixer
[Path2D]: https://developer.mozilla.org/en-US/docs/Web/API/Path2D

## Un-implemented features
tile-painter is a work in progress. Many features are not implemented yet.
Incomplete features include:

- This list
- [symbol-placement] values other than "point". Text following roads or
  riverbeds will not be rendered!
- Rotated symbols (text and sprites)
- Text wrapping for long labels. [text-max-width] is ignored
- [text-letter-spacing]

Pull requests are welcomed!

[symbol-placement]: https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-symbol-symbol-placement
[text-max-width]: https://docs.mapbox.com/mapbox-gl-js/style-spec/#layout-symbol-text-max-width
[text-letter-spacing]: https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#layout-symbol-text-letter-spacing
