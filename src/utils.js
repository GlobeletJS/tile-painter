export function pair(get, key) {
  // Return a style value getter and a renderer state setter as a paired object
  return { key, get, type: get.type };
}
