/**
 * @hidden
 * @packageDocumentation
 */
import type { ISessionInfo, ISessionInfoManager, ISessionInternalInfo, IStorageUtility } from "@inrupt/solid-client-authn-core";
import { SessionInfoManagerBase } from "@inrupt/solid-client-authn-core";
export { getUnauthenticatedSession } from "@inrupt/solid-client-authn-core";
/**
 * @param sessionId
 * @param storage
 * @hidden
 */
export declare function clear(sessionId: string, storage: IStorageUtility): Promise<void>;
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
}
