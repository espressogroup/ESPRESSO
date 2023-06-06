'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var undici = require('undici');
var NodeFetch = require('node-fetch');

const nodeVersion = process.versions.node.split(".");
const nodeMajor = Number(nodeVersion[0]);
const nodeMinor = Number(nodeVersion[1]);
let uniFetch;
if (nodeMajor >= 18) {
    uniFetch = globalThis;
}
else if (nodeMajor > 16 || (nodeMajor === 16 && nodeMinor >= 8)) {
    uniFetch = {
        fetch: undici.fetch,
        Headers: undici.Headers,
        Request: undici.Request,
        Response: undici.Response,
    };
}
else {
    uniFetch = {
        fetch: NodeFetch,
        Headers: NodeFetch.Headers,
        Request: NodeFetch.Request,
        Response: NodeFetch.Response,
    };
}
var index = uniFetch.fetch;
const { fetch, Request, Response, Headers } = uniFetch;

exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.default = index;
exports.fetch = fetch;
