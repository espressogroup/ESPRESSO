"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browser = exports.node = exports.InMemoryStorage = exports.ConfigurationError = exports.NotImplementedError = exports.Session = void 0;
/* eslint-disable unicorn/filename-case */
// We only export the common subset between @inrupt/solid-client-authn-node and @inrupt/solid-client-authn-browser
var solid_client_authn_browser_1 = require("@inrupt/solid-client-authn-browser");
Object.defineProperty(exports, "Session", { enumerable: true, get: function () { return solid_client_authn_browser_1.Session; } });
var solid_client_authn_core_1 = require("@inrupt/solid-client-authn-core");
Object.defineProperty(exports, "NotImplementedError", { enumerable: true, get: function () { return solid_client_authn_core_1.NotImplementedError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return solid_client_authn_core_1.ConfigurationError; } });
Object.defineProperty(exports, "InMemoryStorage", { enumerable: true, get: function () { return solid_client_authn_core_1.InMemoryStorage; } });
// Convenience flags for detecting environment
const node = false;
exports.node = node;
const browser = true;
exports.browser = browser;
//# sourceMappingURL=index-browser.js.map