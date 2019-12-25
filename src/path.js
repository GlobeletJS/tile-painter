export function geomToPath(geometry) {
  // Converts a GeoJSON Feature geometry to a Path2D object

  let type = geometry.type;
  let isMulti = false;
  if (type.substring(0, 5) === "Multi") {
    isMulti = true;
    type = type.substring(5);
  }

  const pathFunc = (type === "Point") ? pointPath
    : (type === "Line") ? linePath
    : (type === "Polygon") ? polygonPath
    : () => null;

  const path = new Path2D();

  let coords = geometry.coordinates;
  if (isMulti) {
    //coords.forEach(coord => pathFunc(path, coord));
    // Use while loop for speed. See https://jsperf.com/loops/32
    let i = -1, n = coords.length;
    while (++i < n) pathFunc(path, coords[i]);

  } else {
    pathFunc(path, coords);
  }

  return path;
}

function pointPath(path, point) {
  // Draws a Point geometry, which is an array of two coordinates
  path.moveTo(point[0], point[1]);
  path.lineTo(point[0], point[1]);
}

function linePath(path, points) {
  // Draws a LineString geometry, which is an array of Points. 
  // Move to the beginning of the line (first point)
  path.moveTo(points[0][0], points[0][1]);

  // Connect remaining points with lines
  var i = 0, n = points.length;
  while (++i < n) path.lineTo(points[i][0], points[i][1]);
}

function polygonPath(path, coords) {
  // Draws a Polygon geometry, which is an array of LineStrings
  var i = -1, n = coords.length;
  while (++i < n) linePath(path, coords[i]);
}
