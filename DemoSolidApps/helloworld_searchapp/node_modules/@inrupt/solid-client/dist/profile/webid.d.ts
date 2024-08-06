import type { SolidDataset, UrlString, WebId, WithServerResourceInfo } from "..";
import { getSolidDataset } from "..";
export type ProfileAll<T extends SolidDataset & WithServerResourceInfo> = {
    webIdProfile: T;
    altProfileAll: Array<SolidDataset & WithServerResourceInfo>;
};
/**
 * List all the alternative profiles IRI found in a given WebID profile.
 *
 * Note that some of these profiles may be private, and you may not have access to
 * the resulting resource.
 *
 * @param webId The WebID of the user's whose alternative profiles you are discovering.
 * @param webIdProfile The WebID profile obtained dereferencing the provided WebID.
 * @returns A list of URLs of the user's alternative profiles.
 * @since 1.20.0
 */
export declare function getAltProfileUrlAllFrom(webId: WebId, webIdProfile: SolidDataset): UrlString[];
/**
 * Get all the Profile Resources discoverable from a WebID Profile.
 *
 * A WebID Profile may be any RDF resource on the Web, it doesn't have
 * to be a Solid resource. That is why, in order to expose a Solid-enabled part
 * of their profile, some WebID profiles link to one or more Extended Profile Resources,
 * which may are Solid resources. A WebID resource should be public, so `getProfileAll` will
 * issue an unauthenticated request to the WebID, and only use the provided
 * authenticated `fetch` (if any) to access extended profile documents.
 *
 * @param webId WebID of the agent you want the profile of.
 * @param options Optional parameter
 *  - `options.webIdProfile`: The data retrieved when looking up the WebID. This
 *    will be fetched if not provided.
 *  - `options.fetch`: An alternative `fetch` function to make the HTTP request,
 *    compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Promise resolving to an array of [[SolidDataset]], each corresponding
 *  to a personal profile document discoverable from the WebID Profile Document.
 *  If none are found, the WebID profile document itself is returned.
 * @since 1.16.0
 */
export declare function getProfileAll<T extends SolidDataset & WithServerResourceInfo>(webId: WebId, options?: {
    fetch?: typeof fetch;
    webIdProfile?: T;
}): Promise<ProfileAll<T>>;
export declare function getProfileAll(webId: WebId, options?: {
    fetch?: typeof fetch;
    webIdProfile: undefined;
}): Promise<ProfileAll<SolidDataset & WithServerResourceInfo>>;
/**
 * Discover the Pods an agent advertises for in their profile resources. Both the
 * agent's WebID and alternative profiles are fetched. Note that this function will
 * only return URLs of Pods linked to using the `pim:storage`, i.e. a triple
 * looking like <myWebid, pim:storage, myPodUrl> should appear in the profile
 * resources.
 *
 * @param webId The WebID of the agent whose Pods should be discovered
 * @param options Optional parameter
 * - `options.fetch`: An alternative `fetch` function to make the HTTP request,
 *    compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns a Promise resolving to an array containing the URLs of all the Pods
 * linked from the agent's profile resource using the `pim:storage` predicate.
 * @since 1.18.0
 */
export declare function getPodUrlAll(webId: WebId, options?: {
    fetch?: typeof fetch;
}): Promise<UrlString[]>;
/**
 * Discover the Pods advertised for in the provided profile resources. Note that
 * this function will only return URLs of Pods linked to using the `pim:storage`
 * predicate, i.e. a triple looking like <myWebid, pim:storage, myPodUrl>
 * should appear in the profile resources.
 *
 * @param profiles The profile resources in which the Pods should be discovered
 * @param webId The WebID of the agent whose Pods should be discovered
 * @returns An array containing the URLs of all the Pods linked from the agent's
 * profile resource using the `pim:storage` predicate.
 * @since 1.18.0
 */
export declare function getPodUrlAllFrom(profiles: ProfileAll<SolidDataset & WithServerResourceInfo>, webId: WebId): UrlString[];
/**
 * Get the WebID Profile document dataset.
 *
 * @example
 * ```
 * const webId = "https://example.org/people/me";
 * const profile = await getWebIdDataset(webId);
 * const podRoot = getPodUrlAllFrom({ webIdProfile: profile, altProfileAll: [] }, webId);
 * const profileThing = getThing(profile, webId);
 * const name = getStringNoLocale(profileThing, FOAF.name);
 * ```
 *
 * @param webId The WebID of the agent whose WebID Profile dataset is to be fetched.
 * @returns a SolidDataset for the WebID Profile document.
 * @since 1.24.0
 */
export declare function getWebIdDataset(webId: WebId): Promise<ReturnType<typeof getSolidDataset>>;
