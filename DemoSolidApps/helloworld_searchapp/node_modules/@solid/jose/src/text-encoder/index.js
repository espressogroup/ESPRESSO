const TextEncoder = global.TextEncoder
  ? global.TextEncoder  // browser
  : require('@sinonjs/text-encoding').TextEncoder  // node shim
module.exports = TextEncoder
