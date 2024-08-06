/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Handler for the Client Credentials Flow
 */
import type { IOidcHandler, IOidcOptions, LoginResult, ITokenRefresher } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 */
export default class ClientCredentialsOidcHandler implements IOidcHandler {
    private tokenRefresher;
    constructor(tokenRefresher: ITokenRefresher);
    canHandle(oidcLoginOptions: IOidcOptions): Promise<boolean>;
    handle(oidcLoginOptions: IOidcOptions): Promise<LoginResult>;
}
