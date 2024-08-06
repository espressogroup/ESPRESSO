/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Responsible for fetching an IDP configuration
 */
import type { IIssuerConfig, IIssuerConfigFetcher, IStorageUtility } from "@inrupt/solid-client-authn-core";
import type { IssuerMetadata } from "openid-client";
/**
 * Transforms an openid-client IssuerMetadata object into an [[IIssuerConfig]]
 * @param metadata the object to transform.
 * @returns an [[IIssuerConfig]] initialized from the metadata.
 * @internal
 */
export declare function configFromIssuerMetadata(metadata: IssuerMetadata): IIssuerConfig;
/**
 * Transforms an [[IIssuerConfig]] into an openid-client IssuerMetadata
 * @param config the IIssuerConfig to convert.
 * @returns an IssuerMetadata object initialized from the [[IIssuerConfig]].
 */
export declare function configToIssuerMetadata(config: IIssuerConfig): IssuerMetadata;
/**
 * @hidden
 */
export default class IssuerConfigFetcher implements IIssuerConfigFetcher {
    private storageUtility;
    constructor(storageUtility: IStorageUtility);
    static getLocalStorageKey(issuer: string): string;
    fetchConfig(issuer: string): Promise<IIssuerConfig>;
}
