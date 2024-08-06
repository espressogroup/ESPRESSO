"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHost = getHost;
exports.saveHost = saveHost;
exports.updateHostFromResponse = updateHostFromResponse;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _session = require("./session");

var _storage = require("./storage");

var WebIdOidc = _interopRequireWildcard(require("./webid-oidc"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getHost(storage) {
  return async url => {
    const {
      host
    } = new URL(url);
    const session = await (0, _session.getSession)(storage);

    if (session && host === new URL(session.idp).host) {
      return {
        url: host,
        requiresAuth: true
      };
    }

    const {
      hosts
    } = await (0, _storage.getData)(storage);
    return hosts && hosts[host];
  };
}

function saveHost(storage) {
  return async ({
    url,
    requiresAuth
  }) => {
    await (0, _storage.updateStorage)(storage, data => _objectSpread(_objectSpread({}, data), {}, {
      hosts: _objectSpread(_objectSpread({}, data.hosts), {}, {
        [url]: {
          requiresAuth
        }
      })
    }));
  };
}

function updateHostFromResponse(storage) {
  return async resp => {
    if (WebIdOidc.requiresAuth(resp)) {
      const {
        host
      } = new URL(resp.url);
      await saveHost(storage)({
        url: host,
        requiresAuth: true
      });
    }
  };
}