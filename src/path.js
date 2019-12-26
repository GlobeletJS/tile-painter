function pointPath(path, point) {
  // Draws a Point geometry, which is an array of two coordinates
  path.moveTo(point[0], point[1]);
  path.lineTo(point[0], point[1]);
}

function linePath(path, points) {
  // Draws a LineString geometry, which is an array of Points. 
  path.moveTo(points[0][0], points[0][1]);

  var i = 0, n = points.length;
  while (++i < n) path.lineTo(points[i][0], points[i][1]);
}

function polygonPath(path, lines) {
  // Draws a Polygon geometry, which is an array of LineStrings
  var i = -1, n = lines.length;
  while (++i < n) linePath(path, lines[i]);
}

const pathFuncs = {
  Point: pointPath,
  LineString: linePath,
  Polygon: polygonPath,
};

export function geomToPath(geometry) {
  // Converts a GeoJSON Feature geometry to a Path2D object

  var type = geometry.type;
  var isMulti = type.substring(0, 5) === "Multi";
  if (isMulti) type = type.substring(5);

  const pathFunc = pathFuncs[type];

  const path = new Path2D();

  const coords = geometry.coordinates;
  if (isMulti) {
    // While loops faster than forEach: https://jsperf.com/loops/32
    let i = -1, n = coords.length;
    while (++i < n) pathFunc(path, coords[i]);

  } else {
    pathFunc(path, coords);
  }

  return path;
}
