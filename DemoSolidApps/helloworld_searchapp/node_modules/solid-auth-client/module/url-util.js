/* eslint-env browser */
function getLocation() {
  return typeof window !== 'undefined' ? window.location : {
    href: 'https://example.org/',
    pathname: '/',
    origin: 'example.org'
  };
}

export var currentUrl = function currentUrl() {
  return getLocation().href;
};
export var currentUrlNoParams = function currentUrlNoParams() {
  return getLocation().origin + getLocation().pathname;
};
export var navigateTo = function navigateTo(url) {
  getLocation().href = url;
};
export var originOf = function originOf(url) {
  return new URL(url).origin;
};
export var toUrlString = function toUrlString(url) {
  if (typeof url !== 'string') {
    url = 'url' in url ? url.url : url.toString();
  }

  return new URL(url, currentUrl()).toString();
};