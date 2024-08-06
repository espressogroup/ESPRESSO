/// <reference types="node" />
/**
 * @hidden
 * @packageDocumentation
 */
import type { IClientRegistrar, IIssuerConfigFetcher, IIncomingRedirectHandler, ISessionInfoManager, IStorageUtility, ITokenRefresher, IncomingRedirectResult } from "@inrupt/solid-client-authn-core";
import type { EventEmitter } from "events";
/**
 * @hidden
 * Token endpoint request: https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
 */
export declare class AuthCodeRedirectHandler implements IIncomingRedirectHandler {
    private storageUtility;
    private sessionInfoManager;
    private issuerConfigFetcher;
    private clientRegistrar;
    private tokenRefresher;
    constructor(storageUtility: IStorageUtility, sessionInfoManager: ISessionInfoManager, issuerConfigFetcher: IIssuerConfigFetcher, clientRegistrar: IClientRegistrar, tokenRefresher: ITokenRefresher);
    canHandle(redirectUrl: string): Promise<boolean>;
    handle(inputRedirectUrl: string, eventEmitter?: EventEmitter): Promise<IncomingRedirectResult>;
}
