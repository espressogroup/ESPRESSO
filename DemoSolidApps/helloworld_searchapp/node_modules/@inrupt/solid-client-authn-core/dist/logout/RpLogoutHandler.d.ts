import type ILogoutHandler from "./ILogoutHandler";
import type { IRedirector } from "../login/oidc/IRedirector";
import type { ILogoutHandlerOptions } from "./ILogoutHandler";
export default class IRpLogoutHandler implements ILogoutHandler {
    protected redirector: IRedirector;
    constructor(redirector: IRedirector);
    canHandle(userId: string, options?: ILogoutHandlerOptions | undefined): Promise<boolean>;
    handle(userId: string, options?: ILogoutHandlerOptions | undefined): Promise<void>;
}
