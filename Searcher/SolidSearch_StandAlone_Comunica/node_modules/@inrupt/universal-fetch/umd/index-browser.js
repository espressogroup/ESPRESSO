(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UniversalFetch = {}));
})(this, (function (exports) { 'use strict';

	var indexBrowser = globalThis.fetch;
	const { fetch, Response, Request, Headers } = globalThis;

	exports.Headers = Headers;
	exports.Request = Request;
	exports.Response = Response;
	exports.default = indexBrowser;
	exports.fetch = fetch;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
