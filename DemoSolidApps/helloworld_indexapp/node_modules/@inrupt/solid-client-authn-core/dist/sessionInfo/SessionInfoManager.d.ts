import type { ISessionInfo, ISessionInfoManager, ISessionInternalInfo, ISessionInfoManagerOptions, IStorageUtility } from "..";
export declare function getUnauthenticatedSession(): ISessionInfo & {
    fetch: typeof fetch;
};
/**
 * @param sessionId
 * @param storage
 * @hidden
 */
export declare function clear(sessionId: string, storage: IStorageUtility): Promise<void>;
/**
 * @hidden
 */
export declare abstract class SessionInfoManagerBase implements ISessionInfoManager {
    protected storageUtility: IStorageUtility;
    constructor(storageUtility: IStorageUtility);
    update(_sessionId: string, _options: ISessionInfoManagerOptions): Promise<void>;
    get(_: string): Promise<(ISessionInfo & ISessionInternalInfo) | undefined>;
    getAll(): Promise<(ISessionInfo & ISessionInternalInfo)[]>;
    /**
     * This function removes all session-related information from storage.
     * @param sessionId the session identifier
     * @param storage the storage where session info is stored
     * @hidden
     */
    clear(sessionId: string): Promise<void>;
    /**
     * Registers a new session, so that its ID can be retrieved.
     * @param sessionId
     */
    register(_sessionId: string): Promise<void>;
    /**
     * Returns all the registered session IDs. Differs from getAll, which also
     * returns additional session information.
     */
    getRegisteredSessionIdAll(): Promise<string[]>;
    /**
     * Deletes all information about all sessions, including their registrations.
     */
    clearAll(): Promise<void>;
}
