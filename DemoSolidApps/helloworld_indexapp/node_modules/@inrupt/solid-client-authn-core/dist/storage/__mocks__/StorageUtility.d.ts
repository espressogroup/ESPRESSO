import type IStorage from "../IStorage";
import type IStorageUtility from "../IStorageUtility";
export declare const StorageUtilityGetResponse = "getResponse";
export declare const StorageUtilityMock: IStorageUtility;
export declare const mockStorage: (stored: Record<string, string | Record<string, string>>) => IStorage;
export declare const mockStorageUtility: (stored: Record<string, string | Record<string, string>>, isSecure?: boolean) => IStorageUtility;
