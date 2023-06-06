export declare const SOLID_CLIENT_AUTHN_KEY_PREFIX = "solidClientAuthn:";
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
export declare const REFRESH_BEFORE_EXPIRATION_SECONDS = 5;
export declare const DEFAULT_SCOPES: string;
