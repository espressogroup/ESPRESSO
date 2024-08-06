/**
 * Removes OIDC-specific query parameters from a given URL (state, code...), and
 * sanitizes the URL (e.g. removes the hash fragment).
 * @param redirectUrl The URL to clean up.
 * @returns A copy of the URL, without OIDC-specific query params.
 */
export declare function normalizeCallbackUrl(redirectUrl: string): string;
/**
 * Clears any OIDC-related data lingering in the local storage.
 */
export declare function clearOidcPersistentStorage(): Promise<void>;
