/// <reference types="node" />
import type { EventEmitter } from "events";
import type { KeyPair } from "../../../authenticatedFetch/dpopUtils";
/**
 * Based on openid-client's TokenSetParameters. Re-creating the type allows not
 * to depend on the Node-specific library at the environment-agnostic level.
 */
export type TokenEndpointResponse = {
    /**
     * JWT-serialized access token
     */
    accessToken: string;
    /**
     * Usually "Bearer"
     */
    tokenType?: "Bearer" | "DPoP";
    /**
     * JWT-serialized id token
     */
    idToken?: string;
    /**
     * URL identifying the subject of the ID token.
     */
    webId?: string;
    /**
     * Refresh token (not necessarily a JWT)
     */
    refreshToken?: string;
    /**
     * Expiration of the access token.
     */
    expiresAt?: number;
    /**
     * ExpiresAt should be computed from expiresIn when receiving the token.
     */
    expiresIn?: number;
    /**
     * DPoP key to which the access token, and potentially the refresh token, are bound.
     */
    dpopKey?: KeyPair;
};
export interface ITokenRefresher {
    refresh(localUserId: string, refreshToken?: string, dpopKey?: KeyPair, eventEmitter?: EventEmitter): Promise<TokenEndpointResponse>;
}
