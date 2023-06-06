export default interface IStorageUtility {
    get(key: string, options?: {
        errorIfNull?: boolean;
        secure?: boolean;
    }): Promise<string | undefined>;
    set(key: string, value: string, options?: {
        secure?: boolean;
    }): Promise<void>;
    delete(key: string, options?: {
        secure?: boolean;
    }): Promise<void>;
    getForUser(userId: string, key: string, options?: {
        errorIfNull?: boolean;
        secure?: boolean;
    }): Promise<string | undefined>;
    setForUser(userId: string, values: Record<string, string>, options?: {
        secure?: boolean;
    }): Promise<void>;
    deleteForUser(userId: string, key: string, options?: {
        secure?: boolean;
    }): Promise<void>;
    deleteAllUserData(userId: string, options?: {
        secure?: boolean;
    }): Promise<void>;
}
