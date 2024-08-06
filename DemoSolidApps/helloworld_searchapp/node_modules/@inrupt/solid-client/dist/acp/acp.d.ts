import type { SolidDataset, File, Url, UrlString, WithServerResourceInfo } from "../interfaces";
import type { WithAcl } from "../acl/acl";
import type { AccessControlResource } from "./control";
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a SolidDataset and its associated Access Control Resource (if available to the current user).
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A SolidDataset and the ACR that applies to it, if available to the authenticated user.
 * @since 1.6.0
 */
export declare function getSolidDatasetWithAcr(url: Url | UrlString, options?: {
    fetch?: typeof fetch;
}): Promise<SolidDataset & WithServerResourceInfo & WithAcp>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a file and its associated Access Control Resource (if available to the current user).
 *
 * @param url URL of the file to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A file and the ACR that applies to it, if available to the authenticated user.
 * @since 1.6.0
 */
export declare function getFileWithAcr(url: Url | UrlString, options?: {
    fetch: typeof fetch;
}): Promise<File & WithAcp>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Retrieve information about a Resource and its associated Access Control Resource (if available to
 * the current user), without fetching the Resource itself.
 *
 * @param url URL of the Resource about which to fetch its information.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Metadata describing a Resource, and the ACR that applies to it, if available to the authenticated user.
 * @since 1.6.0
 */
export declare function getResourceInfoWithAcr(url: Url | UrlString, options?: {
    fetch?: typeof fetch;
}): Promise<WithServerResourceInfo & WithAcp>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a SolidDataset, and:
 * - if the Resource is governed by an ACR: its associated Access Control Resource (if available to
 *                                          the current user), and all the Access Control Policies
 *                                          referred to therein, if available to the current user.
 * - if the Resource is governed by an ACL: its associated Resource ACL (if available to the current
 *                                          user), or its Fallback ACL if it does not exist.
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A SolidDataset and either the ACL access data or the ACR access data, if available to the current user.
 * @since 1.6.0
 */
export declare function getSolidDatasetWithAccessDatasets(url: Url | UrlString, options?: {
    fetch?: typeof fetch;
}): Promise<SolidDataset & (WithAcp | WithAcl)>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a File, and:
 * - if the Resource is governed by an ACR: its associated Access Control Resource (if available to
 *                                          the current user), and all the Access Control Policies
 *                                          referred to therein, if available to the current user.
 * - if the Resource is governed by an ACL: its associated Resource ACL (if available to the current
 *                                          user), or its Fallback ACL if it does not exist.
 *
 * @param url URL of the File to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A File and either the ACL access data or the ACR access data, if available to the current user.
 * @since 1.6.0
 */
export declare function getFileWithAccessDatasets(url: Url | UrlString, options?: {
    fetch?: typeof fetch;
}): Promise<File & (WithAcp | WithAcl)>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch information about a Resource, and:
 * - if the Resource is governed by an ACR: its associated Access Control Resource (if available to
 *                                          the current user), and all the Access Control Policies
 *                                          referred to therein, if available to the current user.
 * - if the Resource is governed by an ACL: its associated Resource ACL (if available to the current
 *                                          user), or its Fallback ACL if it does not exist.
 *
 * @param url URL of the Resource information about which to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Information about a Resource and either the ACL access data or the ACR access data, if available to the current user.
 * @since 1.6.0
 */
export declare function getResourceInfoWithAccessDatasets(url: Url | UrlString, options?: {
    fetch?: typeof fetch;
}): Promise<WithServerResourceInfo & (WithAcp | WithAcl)>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Save a Resource's Access Control Resource.
 *
 * @param resource Resource with an Access Control Resource that should be saved.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @since 1.6.0
 */
export declare function saveAcrFor<ResourceExt extends WithAccessibleAcr>(resource: ResourceExt, options?: {
    fetch?: typeof fetch;
}): Promise<ResourceExt>;
/**
 * The Access Control Resource of Resources that conform to this type were attempted to be fetched together with those Resources. This might not have been successful; see [[hasAccessibleAcr]] to check.
 * @since 1.6.0
 */
export type WithAcp = {
    internal_acp: {
        acr: AccessControlResource | null;
    };
};
/**
 * Resources that conform to this type have an Access Control Resource attached. See [[hasAccessibleAcr]].
 * @since 1.6.0
 */
export type WithAccessibleAcr = WithAcp & {
    internal_acp: {
        acr: Exclude<WithAcp["internal_acp"]["acr"], null>;
    };
};
/**
 * @param resource Resource of which to check whether it has an Access Control Resource attached.
 * @returns Boolean representing whether the given Resource has an Access Control Resource attached for use in e.g. [[getPolicyUrlAll]].
 * @since 1.6.0
 */
export declare function hasAccessibleAcr(resource: WithAcp): resource is WithAccessibleAcr;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * To make it easy to fetch all the relevant Access Policy Resources,
 * this function returns all referenced Access Policy Resources referenced in an
 * Access Control Resource.
 * In other words, if Access Controls refer to different Policies in the same
 * Access Policy Resource, this function will only return that Access Policy
 * Resource's URL once.
 *
 * @param withAcr A Resource with an Access Control Resource attached.
 * @returns List of all unique Access Policy Resources that are referenced in the given Access Control Resource.
 * @since 1.6.0
 */
export declare function getReferencedPolicyUrlAll(withAcr: WithAccessibleAcr): UrlString[];
/**
 * Verify whether the access to the given resource is controlled using the ACP
 * system.
 * @param resource The target resource
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns True if the access to the resource is controlled using ACP, false otherwise.
 * @since 1.14.0.
 */
export declare function isAcpControlled(resource: Url | UrlString, options?: {
    fetch?: typeof fetch;
}): Promise<boolean>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a Resource, find out the URL of its governing Access Control Resource.
 *
 * @param resource Resource which should be governed by Access Policies.
 * @returns The URL of the Access Control Resource, or undefined if not ACR is found.
 * @since 1.15.0
 */
export declare function getLinkedAcrUrl<Resource extends WithServerResourceInfo>(resource: Resource): UrlString | undefined;
export { getVcAccess } from "./util/getVcAccess";
export { setVcAccess } from "./util/setVcAccess";
