/**
 * Intended to be used by dependent packages as a common prefix for keys into
 * storage mechanisms (so as to group all keys related to Solid Client Authn
 * within those storage mechanisms, e.g., window.localStorage).
 */
export declare const SOLID_CLIENT_AUTHN_KEY_PREFIX = "solidClientAuthn:";
/**
 * Ordered list of signature algorithms, from most preferred to least preferred.
 */
export declare const PREFERRED_SIGNING_ALG: string[];
export declare const EVENTS: {
    readonly ERROR: "error";
    readonly LOGIN: "login";
    readonly LOGOUT: "logout";
    readonly NEW_REFRESH_TOKEN: "newRefreshToken";
    readonly SESSION_EXPIRED: "sessionExpired";
    readonly SESSION_EXTENDED: "sessionExtended";
    readonly SESSION_RESTORED: "sessionRestore";
    readonly TIMEOUT_SET: "timeoutSet";
};
/**
 * We want to refresh a token 5 seconds before it expires.
 */
export declare const REFRESH_BEFORE_EXPIRATION_SECONDS = 5;
export declare const DEFAULT_SCOPES: string;
