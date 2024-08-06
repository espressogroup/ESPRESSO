/// <reference types="node" />
/**
 * @hidden
 * @packageDocumentation
 */
import type { IIncomingRedirectHandler, ISessionInfo } from "@inrupt/solid-client-authn-core";
import type { EventEmitter } from "events";
/**
 * This class handles redirect IRIs without any query params, and returns an unauthenticated
 * session. It serves as a fallback so that consuming libraries don't have to test
 * for the query params themselves, and can always try to use them as a redirect IRI.
 * @hidden
 */
export declare class ErrorOidcHandler implements IIncomingRedirectHandler {
    canHandle(redirectUrl: string): Promise<boolean>;
    handle(redirectUrl: string, eventEmitter?: EventEmitter): Promise<ISessionInfo & {
        fetch: typeof fetch;
    }>;
}
