/**
 * @hidden
 * @packageDocumentation
 */
import type { IStorage } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 */
export default class BrowserStorage implements IStorage {
    get storage(): typeof window.localStorage;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
