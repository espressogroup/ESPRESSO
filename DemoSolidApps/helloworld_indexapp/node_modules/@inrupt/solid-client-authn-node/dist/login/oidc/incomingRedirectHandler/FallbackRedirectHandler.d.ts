/**
 * @hidden
 * @packageDocumentation
 */
import type { IIncomingRedirectHandler, ISessionInfo } from "@inrupt/solid-client-authn-core";
/**
 * This class handles redirect IRIs without any query params, and returns an unauthenticated
 * session. It serves as a fallback so that consuming libraries don't have to test
 * for the query params themselves, and can always try to use them as a redirect IRI.
 * @hidden
 */
export declare class FallbackRedirectHandler implements IIncomingRedirectHandler {
    canHandle(redirectUrl: string): Promise<boolean>;
    handle(_redirectUrl: string): Promise<ISessionInfo & {
        fetch: typeof fetch;
    }>;
}
