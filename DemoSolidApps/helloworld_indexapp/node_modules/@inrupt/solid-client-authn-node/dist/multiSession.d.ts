import { type IStorage } from "@inrupt/solid-client-authn-core";
import { Session } from "./Session";
/**
 * Retrieve a Session from the given storage based on its session ID. If possible,
 * the Session is logged in before it is returned, so that `session.fetch` may
 * access private Resource without any additional interaction.
 *
 * If no storage is provided, a default in-memory storage will be used. It is
 * instanciated once on load, and is shared across all the sessions. Since it
 * is only available in memory, the storage is lost when the code stops running.
 *
 * A Session is available in storage as soon as it logged in once, and it is removed
 * from storage on logout.
 *
 * @param sessionId The ID of the Session to retrieve
 * @param storage The storage where the Session can be found
 * @returns A session object, authenticated if possible, or undefined if no Session
 * in storage matches the given ID.
 */
export declare function getSessionFromStorage(sessionId: string, storage?: IStorage, onNewRefreshToken?: (newToken: string) => unknown): Promise<Session | undefined>;
/**
 * Retrieve the IDs for all the Sessions available in the given storage. Note that
 * it is only the Session IDs that are returned, and not Session object. Given a
 * Session ID, one may use [[getSessionFromStorage]] to get the actual Session
 * object, while being conscious that logging in a Session required an HTTP
 * interaction, so doing it in batch for a large number of sessions may result
 * in performance issues.
 *
 * If no storage is provided, a default in-memory storage will be used. It is
 * instanciated once on load, and is shared across all the sessions. Since it
 * is only available in memory, the storage is lost when the code stops running.
 *
 * A Session is available in storage as soon as it logged in once, and it is removed
 * from storage on logout.
 *
 * @param storage The storage where the Session can be found
 * @returns An array of Session IDs
 */
export declare function getSessionIdFromStorageAll(storage?: IStorage): Promise<string[]>;
/**
 * Clear the given storage from any existing Session ID. In order to remove an
 * individual Session from storage, rather than going through this batch deletion,
 * one may simply log the Session out calling `session.logout`.
 *
 * If no storage is provided, a default in-memory storage will be used. It is
 * instanciated once on load, and is shared across all the sessions. Since it
 * is only available in memory, the storage is lost when the code stops running.
 *
 * A Session is available in storage as soon as it logged in once, and it is removed
 * from storage on logout.
 *
 * @param storage The storage where the Session can be found
 */
export declare function clearSessionFromStorageAll(storage?: IStorage): Promise<void>;
