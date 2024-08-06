import { acl } from '../constants.mjs';
import { getSolidDataset, createSolidDataset, saveSolidDatasetAt } from '../resource/solidDataset.mjs';
import { setThing } from '../thing/thing.mjs';
import { removeAll } from '../thing/remove.mjs';
import { setIri } from '../thing/set.mjs';
import { getSourceUrl, getResourceInfo } from '../resource/resource.mjs';
import { getFile } from '../resource/file.mjs';
import { internal_cloneResource } from '../resource/resource.internal.mjs';
import { internal_fetchAcl, internal_setAcl, internal_getAclRules, internal_getDefaultAclRulesForResource } from './acl.internal.mjs';
import { freeze } from '../rdf.internal.mjs';

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
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Verify whether a given SolidDataset was fetched together with its Access Control List.
 *
 * @param dataset A [[SolidDataset]] that may have its ACLs attached.
 * @returns True if `dataset` was fetched together with its ACLs.
 */
function hasAcl(dataset) {
    const potentialAcl = dataset;
    return typeof potentialAcl.internal_acl === "object";
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Verifies whether the given Resource has a resource ACL (Access Control List) attached.
 *
 * The [[hasResourceAcl]] function checks that:
 * - a given Resource has a resource ACL attached, and
 * - the user calling [[hasResourceAcl]] has Control access to the Resource.
 *
 * To retrieve a Resource with its ACLs, see [[getSolidDatasetWithAcl]].
 *
 * @param resource A Resource that might have an ACL attached.
 * @returns `true` if the Resource has a resource ACL attached that is accessible by the user.
 */
function hasResourceAcl(resource) {
    return (resource.internal_acl.resourceAcl !== null &&
        getSourceUrl(resource) ===
            resource.internal_acl.resourceAcl.internal_accessTo &&
        resource.internal_resourceInfo.aclUrl ===
            getSourceUrl(resource.internal_acl.resourceAcl));
}
/**
 * Experimental: fetch a SolidDataset and its associated Access Control List.
 *
 * This is an experimental function that fetches both a Resource, the linked ACL Resource (if
 * available), and the ACL that applies to it if the linked ACL Resource is not available. This can
 * result in many HTTP requests being executed, in lieu of the Solid spec mandating servers to
 * provide this info in a single request. Therefore, and because this function is still
 * experimental, prefer [[getSolidDataset]] instead.
 *
 * If the Resource does not advertise the ACL Resource (because the authenticated user does not have
 * access to it), the `acl` property in the returned value will be null. `acl.resourceAcl` will be
 * undefined if the Resource's linked ACL Resource could not be fetched (because it does not exist),
 * and `acl.fallbackAcl` will be null if the applicable Container's ACL is not accessible to the
 * authenticated user.
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A SolidDataset and the ACLs that apply to it, if available to the authenticated user.
 */
async function getSolidDatasetWithAcl(url, options) {
    const solidDataset = await getSolidDataset(url, options);
    const acl = await internal_fetchAcl(solidDataset, options);
    return internal_setAcl(solidDataset, acl);
}
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Retrieves a file, its resource ACL (Access Control List) if available,
 * and its fallback ACL from a URL and returns them as a blob.
 *
 * If the user calling the function does not have access to the file's resource ACL,
 * [[hasAccessibleAcl]] on the returned blob returns false.
 * If the user has access to the file's resource ACL but the resource ACL does not exist,
 * [[getResourceAcl]] on the returned blob returns null.
 * If the fallback ACL is inaccessible by the user,
 * [[getFallbackAcl]] on the returned blob returns null.
 *
 * ```{tip}
 * To retrieve the ACLs, the function results in multiple HTTP requests rather than a single
 * request as mandated by the Solid spec. As such, prefer [[getFile]] instead if you do not need the ACL.
 * ```
 *
 * @param url The URL of the fetched file
 * @param options Fetching options: a custom fetcher and/or headers.
 * @returns A file and its ACLs, if available to the authenticated user, as a blob.
 * @since 0.2.0
 */
async function getFileWithAcl(input, options) {
    const file = await getFile(input, options);
    const acl = await internal_fetchAcl(file, options);
    return internal_setAcl(file, acl);
}
/**
 * Experimental: fetch a Resource's metadata and its associated Access Control List.
 *
 * This is an experimental function that fetches both a Resource's metadata, the linked ACL Resource (if
 * available), and the ACL that applies to it if the linked ACL Resource is not available (if accessible). This can
 * result in many HTTP requests being executed, in lieu of the Solid spec mandating servers to
 * provide this info in a single request.
 *
 * If the Resource's linked ACL Resource could not be fetched (because it does not exist, or because
 * the authenticated user does not have access to it), `acl.resourceAcl` will be `null`. If the
 * applicable Container's ACL is not accessible to the authenticated user, `acl.fallbackAcl` will be
 * `null`.
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A Resource's metadata and the ACLs that apply to the Resource, if available to the authenticated user.
 */
async function getResourceInfoWithAcl(url, options) {
    const resourceInfo = await getResourceInfo(url, options);
    const acl = await internal_fetchAcl(resourceInfo, options);
    return internal_setAcl(resourceInfo, acl);
}
function getResourceAcl(resource) {
    if (!hasResourceAcl(resource)) {
        return null;
    }
    return resource.internal_acl.resourceAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Verifies whether the given Resource has a fallback ACL (Access Control List) attached.
 *
 * A fallback ACL for a Resource is inherited from the Resource's parent Container
 * (or another of its ancestor Containers) and applies if the Resource does
 * not have its own resource ACL.
 *
 * The [[hasFallbackAcl]] function checks that:
 * - a given Resource has a fallback ACL attached, and
 * - the user calling [[hasFallbackAcl]] has Control access to the Container
 * from which the Resource inherits its ACL.
 *
 * To retrieve a Resource with its ACLs, see [[getSolidDatasetWithAcl]].
 *
 * @param resource A [[SolidDataset]] that might have a fallback ACL attached.
 *
 * @returns `true` if the Resource has a fallback ACL attached that is accessible to the user.
 */
function hasFallbackAcl(resource) {
    return resource.internal_acl.fallbackAcl !== null;
}
function getFallbackAcl(dataset) {
    if (!hasFallbackAcl(dataset)) {
        return null;
    }
    return dataset.internal_acl.fallbackAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Creates an empty resource ACL (Access Control List) for a given Resource.
 *
 * @param targetResource A Resource that does not have its own ACL yet (see [[hasResourceAcl]]).
 * @returns An empty resource ACL for the given Resource.
 */
function createAcl(targetResource) {
    const emptyResourceAcl = freeze({
        ...createSolidDataset(),
        internal_accessTo: getSourceUrl(targetResource),
        internal_resourceInfo: {
            sourceIri: targetResource.internal_resourceInfo.aclUrl,
            isRawData: false,
            linkedResources: {},
        },
    });
    return emptyResourceAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Creates a resource ACL (Access Control List), initialised from the fallback ACL
 * inherited from the given Resource's Container (or another of its ancestor Containers).
 * That is, the new ACL has the same rules/entries as the fallback ACL that currently
 * applies to the Resource.
 *
 * @param resource A Resource without its own resource ACL (see [[hasResourceAcl]]) but with an accessible fallback ACL (see [[hasFallbackAcl]]).
 * @returns A resource ACL initialised with the rules/entries from the Resource's fallback ACL.
 */
function createAclFromFallbackAcl(resource) {
    const emptyResourceAcl = createAcl(resource);
    const fallbackAclRules = internal_getAclRules(resource.internal_acl.fallbackAcl);
    const defaultAclRules = internal_getDefaultAclRulesForResource(fallbackAclRules, resource.internal_acl.fallbackAcl.internal_accessTo);
    const newAclRules = defaultAclRules.map((rule) => {
        rule = removeAll(rule, acl.default);
        rule = removeAll(rule, acl.defaultForNew);
        rule = setIri(rule, acl.accessTo, getSourceUrl(resource));
        rule = setIri(rule, acl.default, getSourceUrl(resource));
        return rule;
    });
    // Iterate over every ACL Rule we want to import, inserting them into `emptyResourceAcl` one by one:
    const initialisedResourceAcl = newAclRules.reduce(setThing, emptyResourceAcl);
    return initialisedResourceAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Saves the resource ACL for a Resource.
 *
 * @param resource The Resource to which the given resource ACL applies.
 * @param resourceAcl An [[AclDataset]] whose ACL Rules will apply to `resource`.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 */
async function saveAclFor(resource, resourceAcl, options) {
    if (!hasAccessibleAcl(resource)) {
        throw new Error(`Could not determine the location of the ACL for the Resource at [${getSourceUrl(resource)}]; possibly the current user does not have Control access to that Resource. Try calling \`hasAccessibleAcl()\` before calling \`saveAclFor()\`.`);
    }
    const savedDataset = await saveSolidDatasetAt(resource.internal_resourceInfo.aclUrl, resourceAcl, options);
    const savedAclDataset = {
        ...savedDataset,
        internal_accessTo: getSourceUrl(resource),
    };
    return savedAclDataset;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the resource ACL (Access Control List) from a Resource.
 *
 * Once the resource ACL is removed from the Resource, the Resource relies on the
 * fallback ACL inherited from the Resource's parent Container (or another of its ancestor Containers).
 *
 * @param resource The Resource for which you want to delete the ACL.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 */
async function deleteAclFor(resource, options) {
    var _a;
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(resource.internal_resourceInfo.aclUrl, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Deleting the ACL of the Resource at [${getSourceUrl(resource)}] failed: [${response.status}] [${response.statusText}].`);
    }
    const storedResource = Object.assign(internal_cloneResource(resource), {
        acl: {
            resourceAcl: null,
        },
    });
    return storedResource;
}
/**
 * Given a [[SolidDataset]], verify whether its Access Control List is accessible to the current user.
 *
 * This should generally only be true for SolidDatasets fetched by
 * [[getSolidDatasetWithAcl]].
 *
 * Please note that the Web Access Control specification is not yet finalised, and hence, this
 * function is still experimental and can change in a non-major release.
 *
 * @param dataset A [[SolidDataset]].
 * @returns Whether the given `dataset` has a an ACL that is accessible to the current user.
 */
function hasAccessibleAcl(dataset) {
    return typeof dataset.internal_resourceInfo.aclUrl === "string";
}

export { createAcl, createAclFromFallbackAcl, deleteAclFor, getFallbackAcl, getFileWithAcl, getResourceAcl, getResourceInfoWithAcl, getSolidDatasetWithAcl, hasAccessibleAcl, hasAcl, hasFallbackAcl, hasResourceAcl, saveAclFor };
