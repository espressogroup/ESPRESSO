import 'jsonld-streaming-parser';
import 'jsonld-context-parser';
import { getSourceIri } from '../resource/resource.mjs';
import 'n3';
import 'http-link-header';
import { getSolidDataset } from '../resource/solidDataset.mjs';
import { getThing, getThingAll, asIri } from '../thing/thing.mjs';
import { getIriAll } from '../thing/get.mjs';
import { foaf, rdfs, pim } from '../constants.mjs';

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
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
function getAltProfileUrlAllFrom(webId, webIdProfile) {
    const webIdThing = getThing(webIdProfile, webId);
    const altProfileUrlAll = getThingAll(webIdProfile)
        .filter((thing) => getIriAll(thing, foaf.primaryTopic).length > 0)
        .map(asIri)
        .concat(webIdThing ? getIriAll(webIdThing, rdfs.seeAlso) : [])
        .concat(webIdThing ? getIriAll(webIdThing, foaf.isPrimaryTopicOf) : [])
        .filter((profileIri) => profileIri !== getSourceIri(webIdProfile));
    // Deduplicate the results.
    return Array.from(new Set(altProfileUrlAll));
}
async function getProfileAll(webId, options) {
    var _a, _b;
    const authFetch = (_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch;
    const webIdProfile = (_b = options === null || options === void 0 ? void 0 : options.webIdProfile) !== null && _b !== void 0 ? _b : 
    // This should always use an unauthenticated fetch.
    (await getSolidDataset(webId));
    const altProfileAll = (await Promise.allSettled(getAltProfileUrlAllFrom(webId, webIdProfile).map((uniqueProfileIri) => getSolidDataset(uniqueProfileIri, { fetch: authFetch }))))
        // Ignore the alternative profiles lookup which failed.
        .filter((result) => result.status === "fulfilled")
        .map((successfulResult) => successfulResult.value);
    return {
        webIdProfile,
        altProfileAll,
    };
}
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
async function getPodUrlAll(webId, options) {
    const profiles = await getProfileAll(webId, options);
    return getPodUrlAllFrom(profiles, webId);
}
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
function getPodUrlAllFrom(profiles, webId) {
    const result = new Set();
    [profiles.webIdProfile, ...profiles.altProfileAll].forEach((profileResource) => {
        const webIdThing = getThing(profileResource, webId);
        if (webIdThing !== null) {
            getIriAll(webIdThing, pim.storage).forEach((podIri) => result.add(podIri));
        }
    });
    return Array.from(result);
}
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
async function getWebIdDataset(webId) {
    return getSolidDataset(webId);
}

export { getAltProfileUrlAllFrom, getPodUrlAll, getPodUrlAllFrom, getProfileAll, getWebIdDataset };
