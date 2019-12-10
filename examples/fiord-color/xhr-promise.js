export function xhrPromise(href, type) {
  // Wrap XMLHttpRequest to return a Promise

  const req = new XMLHttpRequest();
  req.responseType = type;

  return new Promise( (resolve, reject) => {
    req.onerror = req.onabort = function(e) {
      let err = "XMLHttpRequest ended with an " + e.type;
      return reject(err);
    }

    req.onload = function(e) {
      if (req.responseType !== type) {
        let err = "XMLHttpRequest: Wrong responseType. Expected " +
          type + ", got " + req.responseType;
        return reject(err);
      } else if (req.status !== 200) {
        let err = "XMLHttpRequest: HTTP " + req.status + " error from " + href;
        return reject(err);
      }
      return resolve(req.response);
    }

    req.open('get', href);
    req.send();
  });
}
