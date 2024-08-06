/**
 * @hidden
 * @packageDocumentation
 */
import type IHandleable from "../util/handlerPattern/IHandleable";
export interface IRpLogoutOptions {
    /**
     * Log out with through from the RP.
     */
    logoutType: "idp";
    /**
     * An optional URL to redirect to after idp logout has completed;
     * this MUST match a logout URL listed in the
     * [Client ID Document](https://docs.inrupt.com/ess/latest/security/authentication/#client-identifier-client-id)
     * of the application that is logged in.
     *
     * If the application is logged in with a Client ID that is not
     * a URI dereferencing to a Client ID Document then users will
     * not be redirected back to the `postLogoutUrl` after logout.
     */
    postLogoutUrl?: string | undefined;
    /**
     * The value that should be provided in the `state` query parameter when redirecting
     * back to the postLogoutUrl.
     *
     * Note: This parameter should only be provided when a postLogoutUrl is provided. If
     * this value is provided then you should clear it from the URL when redirected back
     * to the postLogoutUrl.
     */
    state?: string | undefined;
    /**
     * If a function is provided, the browser will not auto-redirect and will instead trigger that function to redirect.
     * Required in non-browser environments, ignored in the browser.
     */
    handleRedirect?: ((redirectUrl: string) => void) | undefined;
}
export interface IAppLogoutOptions {
    /**
     * Logout within the application only.
     */
    logoutType: "app";
    postLogoutUrl?: undefined;
    state?: undefined;
    handleRedirect?: undefined;
}
export type ILogoutOptions = IRpLogoutOptions | IAppLogoutOptions;
export type ILogoutHandlerOptions = ILogoutOptions & {
    /**
     * Generate url from IRpLogoutOptions
     */
    toLogoutUrl?: ({ state, postLogoutUrl }: IRpLogoutOptions) => string;
};
/**
 * @hidden
 */
type ILogoutHandler = IHandleable<[
    string
] | [string, ILogoutHandlerOptions | undefined], void>;
export default ILogoutHandler;
