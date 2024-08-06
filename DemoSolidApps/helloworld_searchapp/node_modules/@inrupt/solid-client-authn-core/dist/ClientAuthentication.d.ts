/**
 * @hidden
 * @packageDocumentation
 */
import type { IIssuerConfigFetcher } from "./login/oidc/IIssuerConfigFetcher";
import type { ILogoutOptions, IRpLogoutOptions } from "./logout/ILogoutHandler";
import type ILogoutHandler from "./logout/ILogoutHandler";
import type ILoginHandler from "./login/ILoginHandler";
import type IIncomingRedirectHandler from "./login/oidc/IIncomingRedirectHandler";
import type { ISessionInfoManager } from "./sessionInfo/ISessionInfoManager";
import type { ISessionInfo, ISessionInternalInfo } from "./sessionInfo/ISessionInfo";
/**
 * @hidden
 */
export default class ClientAuthentication {
    protected loginHandler: ILoginHandler;
    protected redirectHandler: IIncomingRedirectHandler;
    protected logoutHandler: ILogoutHandler;
    protected sessionInfoManager: ISessionInfoManager;
    protected issuerConfigFetcher?: IIssuerConfigFetcher | undefined;
    protected boundLogout?: (options: IRpLogoutOptions) => string;
    constructor(loginHandler: ILoginHandler, redirectHandler: IIncomingRedirectHandler, logoutHandler: ILogoutHandler, sessionInfoManager: ISessionInfoManager, issuerConfigFetcher?: IIssuerConfigFetcher | undefined);
    fetch: typeof fetch;
    logout: (sessionId: string, options?: ILogoutOptions) => Promise<void>;
    getSessionInfo: (sessionId: string) => Promise<(ISessionInfo & ISessionInternalInfo) | undefined>;
    getAllSessionInfo: () => Promise<ISessionInfo[]>;
}
