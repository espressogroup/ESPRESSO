/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Handler for the Refresh Token Flow
 */
import type { IOidcHandler, IOidcOptions, IStorageUtility, LoginResult, ITokenRefresher } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 * Refresh token flow spec: https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens
 */
export default class RefreshTokenOidcHandler implements IOidcHandler {
    private tokenRefresher;
    private storageUtility;
    constructor(tokenRefresher: ITokenRefresher, storageUtility: IStorageUtility);
    canHandle(oidcLoginOptions: IOidcOptions): Promise<boolean>;
    handle(oidcLoginOptions: IOidcOptions): Promise<LoginResult>;
}
