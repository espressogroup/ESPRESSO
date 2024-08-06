import type { IEndSessionOptions, IRpLogoutOptions } from "@inrupt/solid-client-authn-core";
/**
 * @param options.endSessionEndpoint The end_session_endpoint advertised by the server
 * @param options.idTokenHint The idToken supplied by the server after logging in
 * Redirects the window to the location required to perform RP initiated logout
 *
 * @hidden
 */
export declare function buildRpInitiatedLogout({ endSessionEndpoint, idTokenHint, }: Omit<IEndSessionOptions, keyof IRpLogoutOptions>): ({ state, postLogoutUrl }: IRpLogoutOptions) => void;
