/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Responsible for selecting the correct OidcHandler to handle the provided OIDC Options
 */
import type { IOidcHandler, IOidcOptions, LoginResult } from "@inrupt/solid-client-authn-core";
import { AggregateHandler } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 */
export default class AggregateOidcHandler extends AggregateHandler<[IOidcOptions], LoginResult> implements IOidcHandler {
    constructor(oidcLoginHandlers: IOidcHandler[]);
}
