// Plugin for .glsl files, roughly following the rollup.config.js in three.js
// with some guidance from github.com/vwochnik/rollup-plugin-glsl
// and rollupjs.org/guide/en#plugins-overview
// TODO: replace with glslify and rollup-plugin-glslify ?
export function glsl() {
  return {
    transform( source, id ) { // Too much indentation? Follows rollup docs
      // Confirm filename extension is .glsl -- follows three.js
      if ( /\.glsl$/.test( id ) === false ) return;

      // This line follows vwochnik's generateCode()
      const code = `export default ${JSON.stringify(source)};`;
      //const code = `${source}`;

      return {
        code: code,
        map: { mappings: '' }, // No map -- follows three.js
      };
    }
  };
}
