import type { ILogoutHandlerOptions } from "./ILogoutHandler";
import type ILogoutHandler from "./ILogoutHandler";
import type { ISessionInfoManager } from "../sessionInfo/ISessionInfoManager";
import type { IRedirector } from "../login/oidc/IRedirector";
export default class IWaterfallLogoutHandler implements ILogoutHandler {
    private handlers;
    constructor(sessionInfoManager: ISessionInfoManager, redirector: IRedirector);
    canHandle(): Promise<boolean>;
    handle(userId: string, options?: ILogoutHandlerOptions | undefined): Promise<void>;
}
