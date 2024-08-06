/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Responsible for fetching an IDP configuration
 */
import type { IIssuerConfig, IIssuerConfigFetcher, IStorageUtility } from "@inrupt/solid-client-authn-core";
export declare const WELL_KNOWN_OPENID_CONFIG = ".well-known/openid-configuration";
/**
 * @hidden
 */
export default class IssuerConfigFetcher implements IIssuerConfigFetcher {
    private storageUtility;
    constructor(storageUtility: IStorageUtility);
    static getLocalStorageKey(issuer: string): string;
    fetchConfig(issuer: string): Promise<IIssuerConfig>;
}
