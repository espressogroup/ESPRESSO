/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Responsible for selecting the correct OidcHandler to handle the provided OIDC Options
 */
import type { IIncomingRedirectHandler, IncomingRedirectInput, IncomingRedirectResult } from "@inrupt/solid-client-authn-core";
import { AggregateHandler } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 */
export default class AggregateRedirectHandler extends AggregateHandler<IncomingRedirectInput, IncomingRedirectResult> implements IIncomingRedirectHandler {
    constructor(redirectHandlers: IIncomingRedirectHandler[]);
}
