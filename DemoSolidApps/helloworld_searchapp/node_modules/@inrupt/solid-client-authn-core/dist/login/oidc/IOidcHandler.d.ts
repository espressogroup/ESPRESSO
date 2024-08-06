/**
 * @hidden
 * @packageDocumentation
 */
/**
 * OidcHandlers handle the login process for a given IDP (as defined by the OIDC Options)
 */
import type IHandleable from "../../util/handlerPattern/IHandleable";
import type { IncomingRedirectResult } from "./IIncomingRedirectHandler";
import type IOidcOptions from "./IOidcOptions";
export type OidcHandlerResult = IncomingRedirectResult | undefined;
/**
 * @hidden
 */
type IOidcHandler = IHandleable<[IOidcOptions], OidcHandlerResult>;
export default IOidcHandler;
