/**
 * @hidden
 * @packageDocumentation
 */
import type { ISessionInfo, ISessionInternalInfo } from "./ISessionInfo";
/**
 * @hidden
 */
export interface ISessionInfoManagerOptions {
    loggedIn?: boolean;
    webId?: string;
}
/**
 * @hidden
 */
export interface ISessionInfoManager {
    update(sessionId: string, options: ISessionInfoManagerOptions): Promise<void>;
    /**
     * Returns all information about a registered session
     * @param sessionId
     */
    get(sessionId: string): Promise<(ISessionInfo & ISessionInternalInfo) | undefined>;
    /**
     * Returns all information about all registered sessions
     */
    getAll(): Promise<(ISessionInfo & ISessionInternalInfo)[]>;
    /**
     * Registers a new session, so that its ID can be retrieved.
     * @param sessionId
     */
    register(sessionId: string): Promise<void>;
    /**
     * Returns all the registered session IDs. Differs from getAll, which also
     * returns additional session information.
     */
    getRegisteredSessionIdAll(): Promise<string[]>;
    /**
     * Deletes all information regarding one session, including its registration.
     * @param sessionId
     */
    clear(sessionId: string): Promise<void>;
    /**
     * Deletes all information about all sessions, including their registrations.
     */
    clearAll(): Promise<void>;
}
export declare const USER_SESSION_PREFIX = "solidClientAuthenticationUser";
