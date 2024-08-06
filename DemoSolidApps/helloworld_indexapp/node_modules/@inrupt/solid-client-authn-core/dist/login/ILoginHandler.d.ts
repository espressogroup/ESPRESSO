/**
 * @hidden
 * @packageDocumentation
 */
/**
 * A Login Handler will log a user in if it is able to use the provided Login Parameters
 */
import type IHandleable from "../util/handlerPattern/IHandleable";
import type ILoginOptions from "./ILoginOptions";
import type { IncomingRedirectResult } from "./oidc/IIncomingRedirectHandler";
export type LoginResult = IncomingRedirectResult | undefined;
/**
 * @hidden
 */
type ILoginHandler = IHandleable<[ILoginOptions], LoginResult>;
export default ILoginHandler;
