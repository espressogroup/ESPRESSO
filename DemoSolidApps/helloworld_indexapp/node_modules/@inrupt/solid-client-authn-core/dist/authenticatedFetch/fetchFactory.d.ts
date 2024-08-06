/// <reference types="node" />
import type { EventEmitter } from "events";
import type { ITokenRefresher } from "../login/oidc/refresh/ITokenRefresher";
import type { KeyPair } from "./dpopUtils";
export type RefreshOptions = {
    sessionId: string;
    refreshToken: string;
    tokenRefresher: ITokenRefresher;
};
/**
 * If expires_in isn't specified for the access token, we assume its lifetime is
 * 10 minutes.
 */
export declare const DEFAULT_EXPIRATION_TIME_SECONDS = 600;
export type DpopHeaderPayload = {
    htu: string;
    htm: string;
    jti: string;
};
/**
 * @param unauthFetch a regular fetch function, compliant with the WHATWG spec.
 * @param authToken an access token, either a Bearer token or a DPoP one.
 * @param options The option object may contain two objects: the DPoP key token
 * is bound to if applicable, and options to customise token renewal behaviour.
 *
 * @returns A fetch function that adds an appropriate Authorization header with
 * the provided token, and adds a DPoP header if applicable.
 */
export declare function buildAuthenticatedFetch(accessToken: string, options?: {
    dpopKey?: KeyPair;
    refreshOptions?: RefreshOptions;
    expiresIn?: number;
    eventEmitter?: EventEmitter;
}): Promise<typeof fetch>;
