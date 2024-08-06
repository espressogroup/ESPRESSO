import type { UrlString, WithResourceInfo } from "../interfaces";
import type { WithAccessibleAcr } from "./acp";
import type { AccessControlResource } from "./control";
/**
 *
 * ```{warning}
 * Do not use this function in production code.  For use in **unit tests** that require a
 * [[AccessControlResource]].
 * ```
 *
 * Initialises a new empty Access Control Resource for a given Resource for use
 * in **unit tests**.
 *
 * @param resourceUrl The URL of the Resource to which the mocked ACR should apply.
 * @returns The mocked empty Access Control Resource for the given Resource.
 * @since 1.6.0
 */
export declare function mockAcrFor(resourceUrl: UrlString): AccessControlResource;
/**
 * ```{warning}
 * Do not use this function in production code.  For use in **unit tests** that require a
 * Resource with an [[AccessControlResource]].
 * ```
 *
 * Attaches an Access Control Resource to a given [[SolidDataset]] for use
 * in **unit tests**; e.g., unit tests that call [[getPolicyUrlAll]].
 *
 * @param resource The Resource to mock up with a new resource ACL.
 * @param accessControlResource The Access Control Resource to attach to the given Resource.
 * @returns The input Resource with an empty resource ACL attached.
 * @since 1.6.0
 */
export declare function addMockAcrTo<T extends WithResourceInfo>(resource: T, accessControlResource?: AccessControlResource): T & WithAccessibleAcr;
