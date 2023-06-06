'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var indexBrowser = globalThis.fetch;
const { fetch, Response, Request, Headers } = globalThis;

exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.default = indexBrowser;
exports.fetch = fetch;
