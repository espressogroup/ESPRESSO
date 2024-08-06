import { internal_accessModeIriStrings } from '../acl/acl.internal.mjs';
import { acp, rdf } from '../constants.mjs';
import { internal_isValidUrl, isNamedNode } from '../datatypes.mjs';
import { internal_toIriString } from '../interfaces.internal.mjs';
import { getSourceUrl } from '../resource/resource.mjs';
import { addIri } from '../thing/add.mjs';
import { getIriAll } from '../thing/get.mjs';
import { removeAll } from '../thing/remove.mjs';
import { setUrl } from '../thing/set.mjs';
import { createThing, getThing, getThingAll, isThingLocal, removeThing, setThing, asUrl } from '../thing/thing.mjs';
import { getPolicyUrlAll, getAcrPolicyUrlAll, removePolicyUrl, removeAcrPolicyUrl } from './control.mjs';
import { internal_getAcr, internal_setAcr } from './control.internal.mjs';

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
 * @param thing the [[Thing]] to check to see if it's an ACP Policy or not
 */
function isPolicy(thing) {
    return getIriAll(thing, rdf.type).includes(acp.Policy);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[Policy]].
 *
 * @param url URL that identifies this Policy.
 * @since 1.6.0
 */
function createPolicy(url) {
    const stringUrl = internal_toIriString(url);
    let policyThing = createThing({ url: stringUrl });
    policyThing = setUrl(policyThing, rdf.type, acp.Policy);
    return policyThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Policy]] with the given URL from an [[SolidDataset]].
 *
 * @param policyResource The Resource that contains the given Policy.
 * @param url URL that identifies this Policy.
 * @returns The requested Policy, if it exists, or `null` if it does not.
 * @since 1.6.0
 */
function getPolicy(policyResource, url) {
    const foundThing = getThing(policyResource, url);
    if (foundThing === null || !isPolicy(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[Policy]]'s in a given [[SolidDataset]].
 *
 * @param policyResource The Resource that contains Access Policies.
 * @since 1.6.0
 */
function getPolicyAll(policyResource) {
    const foundThings = getThingAll(policyResource);
    const foundPolicies = foundThings.filter((thing) => !isThingLocal(thing) && isPolicy(thing));
    return foundPolicies;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove the given [[Policy]] from the given [[SolidDataset]].
 *
 * @param policyResource The Resource that contains Access Policies.
 * @param policy The Policy to remove from the resource.
 * @since 1.6.0
 */
function removePolicy(policyResource, policy) {
    return removeThing(policyResource, policy);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[Policy]] into the given [[SolidDataset]], replacing previous instances of that Policy.
 *
 * @param policyResource The Resource that contains Access Policies.
 * @param policy The Policy to insert into the Resource.
 * @returns A new dataset equal to the given resource, but with the given Policy.
 * @since 1.6.0
 */
function setPolicy(policyResource, policy) {
    return setThing(policyResource, policy);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]] and a set of [[AccessModes]], return a new Policy based on the given
 * Policy, but with the given Access Modes allowed on it.
 *
 * @param policy The Policy on which to set the modes to allow.
 * @param modes Modes to allow for this Policy.
 * @since Not released yet.
 */
function setAllowModesV2(policy, modes) {
    let newPolicy = removeAll(policy, acp.allow);
    if (modes.read === true) {
        newPolicy = addIri(newPolicy, acp.allow, internal_accessModeIriStrings.read);
    }
    if (modes.append === true) {
        newPolicy = addIri(newPolicy, acp.allow, internal_accessModeIriStrings.append);
    }
    if (modes.write === true) {
        newPolicy = addIri(newPolicy, acp.allow, internal_accessModeIriStrings.write);
    }
    return newPolicy;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]], return which [[AccessModes]] it allows.
 *
 * @param policy The Policy for which you want to know the Access Modes it allows.
 * @since Not released yet.
 */
function getAllowModesV2(policy) {
    const allowedModes = getIriAll(policy, acp.allow);
    return {
        read: allowedModes.includes(internal_accessModeIriStrings.read),
        append: allowedModes.includes(internal_accessModeIriStrings.append),
        write: allowedModes.includes(internal_accessModeIriStrings.write),
    };
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]] and a set of [[AccessModes]], return a new Policy based on the given
 * Policy, but with the given Access Modes disallowed on it.
 *
 * @param policy The Policy on which to set the modes to disallow.
 * @param modes Modes to disallow for this Policy.
 * @since Not released yet.
 */
function setDenyModesV2(policy, modes) {
    let newPolicy = removeAll(policy, acp.deny);
    if (modes.read === true) {
        newPolicy = addIri(newPolicy, acp.deny, internal_accessModeIriStrings.read);
    }
    if (modes.append === true) {
        newPolicy = addIri(newPolicy, acp.deny, internal_accessModeIriStrings.append);
    }
    if (modes.write === true) {
        newPolicy = addIri(newPolicy, acp.deny, internal_accessModeIriStrings.write);
    }
    return newPolicy;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]], return which [[AccessModes]] it disallows.
 *
 * @param policy The Policy on which you want to know the Access Modes it disallows.
 * @since Not released yet.
 */
function getDenyModesV2(policy) {
    const deniedModes = getIriAll(policy, acp.deny);
    return {
        read: deniedModes.includes(internal_accessModeIriStrings.read),
        append: deniedModes.includes(internal_accessModeIriStrings.append),
        write: deniedModes.includes(internal_accessModeIriStrings.write),
    };
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[ResourcePolicy]] for the given Resource.
 *
 * @param resourceWithAcr The Resource to which the Policy is to apply.
 * @param name The name that identifies this Policy.
 * @since 1.6.0
 */
function createResourcePolicyFor(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const url = new URL(getSourceUrl(acr));
    url.hash = `#${name}`;
    let policyThing = createThing({ url: url.href });
    policyThing = setUrl(policyThing, rdf.type, acp.Policy);
    return policyThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[ResourcePolicy]] with the given name that applies to a Resource
 * from its Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose ACR contains the given Policy.
 * @param name The name that identifies this Policy.
 * @returns The requested Policy, if it exists and applies to the given Resource, or `null` if it does not.
 * @since 1.6.0
 */
function getResourcePolicy(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const url = new URL(acrUrl);
    url.hash = `#${name}`;
    const foundThing = getThing(acr, url.href);
    if (!getPolicyUrlAll(resourceWithAcr).includes(url.href) ||
        foundThing === null ||
        !isPolicy(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[ResourcePolicy]] with the given name that applies to a Resource's
 * Access Control Resource from that Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose ACR contains the given Policy.
 * @param name The name that identifies this Policy.
 * @returns The requested Policy, if it exists and applies to the Resource's ACR, or `null` if it does not.
 * @since 1.6.0
 */
function getResourceAcrPolicy(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const url = new URL(acrUrl);
    url.hash = `#${name}`;
    const foundThing = getThing(acr, url.href);
    if (!getAcrPolicyUrlAll(resourceWithAcr).includes(url.href) ||
        foundThing === null ||
        !isPolicy(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[ResourcePolicy]]'s that apply to a Resource in its Access Control
 * Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies applying to it.
 * @since 1.6.0
 */
function getResourcePolicyAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const policyUrls = getPolicyUrlAll(resourceWithAcr);
    const foundThings = policyUrls.map((policyUrl) => getThing(acr, policyUrl));
    const foundPolicies = foundThings.filter((thing) => thing !== null && isPolicy(thing));
    return foundPolicies;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[ResourcePolicy]]'s that apply to a given Resource's Access Control
 * Resource from that Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @since 1.6.0
 */
function getResourceAcrPolicyAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const policyUrls = getAcrPolicyUrlAll(resourceWithAcr);
    const foundThings = policyUrls.map((policyUrl) => getThing(acr, policyUrl));
    const foundPolicies = foundThings.filter((thing) => thing !== null && isPolicy(thing));
    return foundPolicies;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove the given [[ResourcePolicy]] from the given Resource's Access Control
 * Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @param policy The Policy to remove from the Resource's Access Control Resource.
 * @since 1.6.0
 */
function removeResourcePolicy(resourceWithAcr, policy) {
    const acr = internal_getAcr(resourceWithAcr);
    let policyToRemove = policy;
    if (typeof policyToRemove === "string") {
        if (internal_isValidUrl(policyToRemove) === false) {
            // If the given Policy to remove is the name of the Policy,
            // resolve it to its full URL — developers usually refer to either the
            // Policy itself, or by its name, as they do not have access to the ACR
            // directly.
            const policyUrl = new URL(getSourceUrl(acr));
            policyUrl.hash = `#${policy}`;
            policyToRemove = policyUrl.href;
        }
    }
    let policyUrlString;
    if (typeof policyToRemove === "string") {
        policyUrlString = policyToRemove;
    }
    else if (isNamedNode(policyToRemove)) {
        policyUrlString = internal_toIriString(policyToRemove);
    }
    else {
        policyUrlString = asUrl(policyToRemove, getSourceUrl(acr));
    }
    // Check whether the actual Policy (i.e. with the Policy type) exists:
    const matchingRule = getResourcePolicy(resourceWithAcr, new URL(policyUrlString).hash.substring(1));
    if (matchingRule === null) {
        // No such Policy exists yet, so return the Resource+ACR unchanged:
        return resourceWithAcr;
    }
    const updatedAcr = removeThing(acr, policyToRemove);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return removePolicyUrl(updatedResource, policyUrlString);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove the given [[ResourcePolicy]] that applies to a given Resource's Access
 * Control Resource from that Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @param policy The ACR Policy to remove from the Resource's Access Control Resource.
 * @since 1.6.0
 */
function removeResourceAcrPolicy(resourceWithAcr, policy) {
    const acr = internal_getAcr(resourceWithAcr);
    let policyToRemove = policy;
    if (typeof policyToRemove === "string") {
        if (internal_isValidUrl(policyToRemove) === false) {
            // If the given Policy to remove is the name of the Policy,
            // resolve it to its full URL — developers usually refer to either the
            // Policy itself, or by its name, as they do not have access to the ACR
            // directly.
            const policyUrl = new URL(getSourceUrl(acr));
            policyUrl.hash = `#${policy}`;
            policyToRemove = policyUrl.href;
        }
    }
    let policyUrlString;
    if (typeof policyToRemove === "string") {
        policyUrlString = policyToRemove;
    }
    else if (isNamedNode(policyToRemove)) {
        policyUrlString = internal_toIriString(policyToRemove);
    }
    else {
        policyUrlString = asUrl(policyToRemove, getSourceUrl(acr));
    }
    // Check whether the actual Policy (i.e. with the Policy type) exists:
    const matchingRule = getResourceAcrPolicy(resourceWithAcr, new URL(policyUrlString).hash.substring(1));
    if (matchingRule === null) {
        // No such Policy exists yet, so return the Resource+ACR unchanged:
        return resourceWithAcr;
    }
    const updatedAcr = removeThing(acr, policyToRemove);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return removeAcrPolicyUrl(updatedResource, policyUrlString);
}

export { createPolicy, createResourcePolicyFor, getAllowModesV2, getDenyModesV2, getPolicy, getPolicyAll, getResourceAcrPolicy, getResourceAcrPolicyAll, getResourcePolicy, getResourcePolicyAll, removePolicy, removeResourceAcrPolicy, removeResourcePolicy, setAllowModesV2, setDenyModesV2, setPolicy };
