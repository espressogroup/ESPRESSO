"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toUrlString = exports.originOf = exports.navigateTo = exports.currentUrlNoParams = exports.currentUrl = void 0;

/* eslint-env browser */
function getLocation() {
  return typeof window !== 'undefined' ? window.location : {
    href: 'https://example.org/',
    pathname: '/',
    origin: 'example.org'
  };
}

const currentUrl = () => getLocation().href;

exports.currentUrl = currentUrl;

const currentUrlNoParams = () => getLocation().origin + getLocation().pathname;

exports.currentUrlNoParams = currentUrlNoParams;

const navigateTo = url => {
  getLocation().href = url;
};

exports.navigateTo = navigateTo;

const originOf = url => new URL(url).origin;

exports.originOf = originOf;

const toUrlString = url => {
  if (typeof url !== 'string') {
    url = 'url' in url ? url.url : url.toString();
  }

  return new URL(url, currentUrl()).toString();
};

exports.toUrlString = toUrlString;