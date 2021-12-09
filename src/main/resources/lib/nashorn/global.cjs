// https://stackoverflow.com/questions/9107240/1-evalthis-vs-evalthis-in-javascript
const global = (1, eval)('this'); // eslint-disable-line no-eval
global.global = global;
global.globalThis = global;
global.frames = global;
global.self = global;
global.window = global;

// Actually works, but:
// WARNING Prefer a proper cryptographic entropy source over this module. If you are out of luck you can use this in a pinch
global.crypto = { getRandomValues: require('polyfill-crypto.getrandomvalues') };

module.exports = global;
