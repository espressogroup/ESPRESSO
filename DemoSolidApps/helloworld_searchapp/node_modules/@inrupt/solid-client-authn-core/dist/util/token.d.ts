/**
 * Extract a WebID from an ID token payload based on https://github.com/solid/webid-oidc-spec.
 * Note that this does not yet implement the user endpoint lookup, and only checks
 * for `webid` or IRI-like `sub` claims.
 *
 * @param idToken the payload of the ID token from which the WebID can be extracted.
 * @returns a WebID extracted from the ID token.
 * @internal
 */
export declare function getWebidFromTokenPayload(idToken: string, jwksIri: string, issuerIri: string, clientId: string): Promise<string>;
