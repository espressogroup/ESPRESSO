import type { IRpLogoutOptions } from "./ILogoutHandler";
export interface IEndSessionOptions {
    endSessionEndpoint: string;
    idTokenHint?: string;
    postLogoutRedirectUri?: string;
    state?: string;
}
/**
 * This function is designed to isomorphically capture the behavior in oidc-client-js and node-oidc-provider
 * - https://github.com/IdentityModel/oidc-client-js/blob/edec8f59897bdeedcb0b4167586d49626203c2c1/src/OidcClient.js#L138
 * - https://github.com/panva/node-openid-client/blob/35758419489ff751a71f5b66f5020087a63e1e88/lib/client.js#L284
 *
 * @param options IEndSessionOptions
 * @returns The URL to redirect to in order to perform RP Initiated Logout
 * @hidden
 */
export declare function getEndSessionUrl({ endSessionEndpoint, idTokenHint, postLogoutRedirectUri, state, }: IEndSessionOptions): string;
/**
 * @param options.endSessionEndpoint The end_session_endpoint advertised by the server
 * @param options.idTokenHint The idToken supplied by the server after logging in
 * Redirects the window to the location required to perform RP initiated logout
 *
 * @hidden
 */
export declare function maybeBuildRpInitiatedLogout({ endSessionEndpoint, idTokenHint, }: Partial<Omit<IEndSessionOptions, keyof IRpLogoutOptions>>): (({ state, postLogoutUrl }: IRpLogoutOptions) => string) | undefined;
