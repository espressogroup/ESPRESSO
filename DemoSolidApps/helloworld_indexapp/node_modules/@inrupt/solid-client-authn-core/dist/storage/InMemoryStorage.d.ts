/**
 * @hidden
 * @packageDocumentation
 */
import type IStorage from "./IStorage";
/**
 * @hidden
 */
export default class InMemoryStorage implements IStorage {
    private map;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
