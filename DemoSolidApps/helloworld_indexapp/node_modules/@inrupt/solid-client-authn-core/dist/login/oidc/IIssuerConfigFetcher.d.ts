/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Responsible for fetching an IDP configuration
 */
import type { IIssuerConfig } from "./IIssuerConfig";
export interface IIssuerConfigFetcher {
    /**
     * Fetches the configuration
     * @param issuer URL of the IDP
     */
    fetchConfig(issuer: string): Promise<IIssuerConfig>;
}
