"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authnFetch = authnFetch;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("isomorphic-fetch");

var _urlUtil = require("./url-util");

var _host = require("./host");

var _session = require("./session");

var _webidOidc = require("./webid-oidc");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

async function authnFetch(storage, fetch, input, options) {
  // Copy headers into a modifiable object
  if (options) {
    const headers = copyHeaders(options.headers);
    options = _objectSpread(_objectSpread({}, options), {}, {
      headers
    });
  } // If not authenticated, perform a regular fetch


  const session = await (0, _session.getSession)(storage);

  if (!session) {
    return fetch(input, options);
  } // If we know the server expects credentials, send them


  if (await shouldShareCredentials(storage, input)) {
    return (0, _webidOidc.fetchWithCredentials)(session, fetch, input, options);
  } // If we don't know for sure, try a regular fetch first


  let resp = await fetch(input, options); // If the server then requests credentials, send them

  if (resp.status === 401) {
    await (0, _host.updateHostFromResponse)(storage)(resp);

    if (await shouldShareCredentials(storage, input)) {
      resp = (0, _webidOidc.fetchWithCredentials)(session, fetch, input, options);
    }
  }

  return resp;
}

async function shouldShareCredentials(storage, input) {
  const requestHost = await (0, _host.getHost)(storage)((0, _urlUtil.toUrlString)(input));
  return requestHost != null && requestHost.requiresAuth;
}

function copyHeaders(origHeaders) {
  const headers = {};

  if (origHeaders) {
    if (typeof origHeaders.forEach === 'function') {
      origHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else {
      for (const key in origHeaders) {
        headers[key] = origHeaders[key];
      }
    }
  }

  return headers;
}