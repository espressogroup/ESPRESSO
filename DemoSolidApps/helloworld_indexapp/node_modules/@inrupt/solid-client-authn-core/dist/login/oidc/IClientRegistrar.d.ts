/**
 * @hidden
 * @packageDocumentation
 */
import type IStorageUtility from "../../storage/IStorageUtility";
import type ILoginOptions from "../ILoginOptions";
import type { IClient } from "./IClient";
import type { IIssuerConfig } from "./IIssuerConfig";
export interface IClientRegistrarOptions {
    sessionId: string;
    clientName?: string;
    redirectUrl?: string;
}
/**
 * @hidden
 */
export interface IClientRegistrar {
    getClient(options: IClientRegistrarOptions, issuerConfig: IIssuerConfig): Promise<IClient>;
}
export declare function determineSigningAlg(supported: string[], preferred: string[]): string | null;
export declare function isKnownClientType(clientType: string | undefined): clientType is "dynamic" | "static" | "solid-oidc";
export declare function handleRegistration(options: ILoginOptions, issuerConfig: IIssuerConfig, storageUtility: IStorageUtility, clientRegistrar: IClientRegistrar): Promise<IClient>;
