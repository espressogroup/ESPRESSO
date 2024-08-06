"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSession = getSession;
exports.saveSession = saveSession;
exports.clearSession = clearSession;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _storage = require("./storage");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

async function getSession(storage) {
  const data = await (0, _storage.getData)(storage);
  return data.session || null;
}

function saveSession(storage) {
  return async session => {
    const data = await (0, _storage.updateStorage)(storage, data => _objectSpread(_objectSpread({}, data), {}, {
      session
    }));
    return data.session;
  };
}

async function clearSession(storage) {
  await (0, _storage.updateStorage)(storage, data => _objectSpread(_objectSpread({}, data), {}, {
    session: null
  }));
}