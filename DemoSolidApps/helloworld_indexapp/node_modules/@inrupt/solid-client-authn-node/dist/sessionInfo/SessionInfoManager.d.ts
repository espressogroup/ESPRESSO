/**
 * @hidden
 * @packageDocumentation
 */
import type { ISessionInfo, ISessionInternalInfo, ISessionInfoManager } from "@inrupt/solid-client-authn-core";
import { SessionInfoManagerBase } from "@inrupt/solid-client-authn-core";
export { getUnauthenticatedSession, clear, } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 */
export declare class SessionInfoManager extends SessionInfoManagerBase implements ISessionInfoManager {
    get(sessionId: string): Promise<(ISessionInfo & ISessionInternalInfo) | undefined>;
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
    register(sessionId: string): Promise<void>;
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
