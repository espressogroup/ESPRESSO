import type { Url, UrlString, WithServerResourceInfo } from "../interfaces";
import type { getSolidDataset } from "./solidDataset";
import type { getFile } from "./file";
import { FetchError } from "./resource";
type Unpromisify<T> = T extends Promise<infer R> ? R : T;
/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new [[SolidDataset]] with metadata as though the
 * SolidDataset has been retrieved from the given URL. The mock SolidDataset can be used in
 * unit tests that require persisted SolidDatasets; e.g., unit tests that call [[getSourceUrl]].
 *
 * @param url The URL from which the returned SolidDataset appears to be retrieved.
 * @returns A mock SolidDataset that appears to be retrieved from the `url`.
 * @since 0.2.0
 */
export declare function mockSolidDatasetFrom(url: Url | UrlString): Unpromisify<ReturnType<typeof getSolidDataset>>;
/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new Container [[SolidDataset]] with metadata as though the
 * Container has been retrieved from the given URL. The mock SolidDataset can be used in
 * unit tests that require persisted Containers; e.g., unit tests that call [[isContainer]].
 *
 * @param url The URL from which the returned Container appears to be retrieved. The `url` must end in a slash.
 * @returns A mock SolidDataset that appears to be retrieved from the `url`.
 * @since 0.2.0
 */
export declare function mockContainerFrom(url: Url | UrlString): Unpromisify<ReturnType<typeof getSolidDataset>>;
/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new File with metadata as though the
 * File has been retrieved from the given URL. The mock File can be used in
 * unit tests that require persisted Files; e.g. unit tests that call [[getSourceUrl]].
 *
 * @param url The URL from which the returned File appears to be retrieved.
 * @returns A mock File that appears to be retrieved from the `url`.
 * @since 0.2.0
 */
export declare function mockFileFrom(url: Url | UrlString, options?: Partial<{
    contentType: WithServerResourceInfo["internal_resourceInfo"]["contentType"];
}>): Unpromisify<ReturnType<typeof getFile>>;
/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new Error object with metadata as though the
 * it was the result of getting a 404 when trying to fetch the Resource at the
 * given URL. The mock Error can be used in unit tests that require functions
 * that fetch Resources (like [[getSolidDataset]]) to fail.
 *
 * @param url The URL of the Resource that could not be fetched according to the error.
 * @param statusCode Optional status code (defaults to 404) that caused the error.
 * @returns A mock Error that represents not having been able to fetch the Resource at `url` due to a 404 Response.
 * @since 1.1.0
 */
export declare function mockFetchError(fetchedUrl: UrlString, statusCode?: number, statusText?: string): FetchError;
export {};
