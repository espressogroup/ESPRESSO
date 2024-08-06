/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Handler for the Authorization Code with PKCE Flow
 */
import type { IOidcHandler, IOidcOptions, LoginResult } from "@inrupt/solid-client-authn-core";
import { AuthorizationCodeWithPkceOidcHandlerBase } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 * Authorization code flow spec: https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
 * PKCE: https://tools.ietf.org/html/rfc7636
 */
export default class AuthorizationCodeWithPkceOidcHandler extends AuthorizationCodeWithPkceOidcHandlerBase implements IOidcHandler {
    handle(oidcLoginOptions: IOidcOptions): Promise<LoginResult>;
}
