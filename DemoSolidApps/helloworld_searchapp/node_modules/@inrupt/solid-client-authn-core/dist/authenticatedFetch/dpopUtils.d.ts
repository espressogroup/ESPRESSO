import type { JWK, KeyLike } from "jose";
export type KeyPair = {
    privateKey: KeyLike;
    publicKey: JWK;
};
/**
 * Creates a DPoP header according to https://tools.ietf.org/html/draft-fett-oauth-dpop-04,
 * based on the target URL and method, using the provided key.
 *
 * @param audience Target URL.
 * @param method HTTP method allowed.
 * @param key Key used to sign the token.
 * @returns A JWT that can be used as a DPoP Authorization header.
 */
export declare function createDpopHeader(audience: string, method: string, dpopKey: KeyPair): Promise<string>;
export declare function generateDpopKeyPair(): Promise<KeyPair>;
