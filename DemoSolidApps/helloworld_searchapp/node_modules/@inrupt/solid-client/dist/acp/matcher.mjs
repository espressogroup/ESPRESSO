import { acp, rdf, solid } from '../constants.mjs';
import { internal_isValidUrl, isNamedNode } from '../datatypes.mjs';
import { internal_toIriString } from '../interfaces.internal.mjs';
import { getSourceUrl } from '../resource/resource.mjs';
import { addIri, addStringNoLocale } from '../thing/add.mjs';
import { getIriAll, getStringNoLocaleAll } from '../thing/get.mjs';
import { removeIri, removeStringNoLocale } from '../thing/remove.mjs';
import { setIri, setUrl } from '../thing/set.mjs';
import { createThing, getThing, getThingAll, removeThing, asUrl, setThing } from '../thing/thing.mjs';
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
 * @param thing the [[Thing]] to check to see if it's an ACP Matcher or not
 */
function isMatcher(thing) {
    return getIriAll(thing, rdf.type).includes(acp.Matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a Matcher that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" Matchers,
 * they will not be granted access.
 *
 * Also see [[addAnyOfMatcherUrl]] and [[addNoneOfMatcherUrl]].
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new Matcher added.
 * @since Not released yet.
 */
function addAllOfMatcherUrl(policy, matcher) {
    return addIri(policy, acp.allOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a Matcher that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" Matchers,
 * they will not be granted access.
 * @param policy The [[Policy]] from which the Matcher should be removed.
 * @param matcher The Matcher to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the Matcher removed.
 * @since Not released yet.
 */
function removeAllOfMatcherUrl(policy, matcher) {
    return removeIri(policy, acp.allOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrites the Matcher refining the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" Matchers,
 * they will not be granted access.
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to set for the Policy.
 * @returns A new [[Policy]] clone of the original one, with the "All Of" Matchers replaced.
 * @since Not released yet.
 */
function setAllOfMatcherUrl(policy, matcher) {
    return setIri(policy, acp.allOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "All Of" [[Matcher]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the Matchers should be read.
 * @returns A list of the "All Of" [[Matcher]]s
 * @since Not released yet.
 */
function getAllOfMatcherUrlAll(policy) {
    return getIriAll(policy, acp.allOf);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a Matcher that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" Matchers,
 * they will be granted access.
 *
 * Also see [[addAllOfMatcherUrl]] and [[addNoneOfMatcherUrl]].
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new Matcher added.
 * @since Not released yet.
 */
function addAnyOfMatcherUrl(policy, matcher) {
    return addIri(policy, acp.anyOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a Matcher that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" Matchers,
 * they will be granted access.
 * @param policy The [[Policy]] from which the Matcher should be removed.
 * @param matcher The Matcher to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the Matcher removed.
 * @since Not released yet.
 */
function removeAnyOfMatcherUrl(policy, matcher) {
    return removeIri(policy, acp.anyOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the Matcher extending the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" Matchers,
 * they will be granted access.
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to set for the Policy.
 * @returns A new [[Policy]] clone of the original one, with the "Any Of" Matchers replaced.
 * @since Not released yet.
 */
function setAnyOfMatcherUrl(policy, matcher) {
    return setIri(policy, acp.anyOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "Any Of" [[Matcher]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the Matchers should be read.
 * @returns A list of the "Any Of" [[Matcher]]s
 * @since Not released yet.
 */
function getAnyOfMatcherUrlAll(policy) {
    return getIriAll(policy, acp.anyOf);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a Matcher that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is matched by another Matcher, but **also**
 * by the given Matcher, they will **not** be granted access.
 *
 * Also see [[addAllOfMatcherUrl]] and [[addAnyOfMatcherUrl]].
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new Matcher added.
 * @since Not released yet.
 */
function addNoneOfMatcherUrl(policy, matcher) {
    return addIri(policy, acp.noneOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a Matcher that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is matched by another Matcher, but **also**
 * in any of the "None Of" Matchers, they will **not** be granted access.
 *
 * @param policy The [[Policy]] from which the Matcher should be removed.
 * @param matcher The Matcher to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the Matcher removed.
 * @since Not released yet.
 */
function removeNoneOfMatcherUrl(policy, matcher) {
    return removeIri(policy, acp.noneOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set the Matchers restricting the scope of a given [[Policy]]. If an agent
 * requesting access to a resource is matched by another Matcher, but **also**
 * by any of the "None Of" Matchers, they will not be granted access.
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to set for the Policy.
 * @returns A new [[Policy]] clone of the original one, with the "None Of" Matchers replaced.
 * @since Not released yet.
 */
function setNoneOfMatcherUrl(policy, matcher) {
    return setIri(policy, acp.noneOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "None Of" [[Matcher]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the Matchers should be read.
 * @returns A list of the forbidden [[Matcher]]s
 * @since Not released yet.
 */
function getNoneOfMatcherUrlAll(policy) {
    return getIriAll(policy, acp.noneOf);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[Matcher]].
 *
 * @param url URL that identifies this [[Matcher]].
 * @since Not released yet.
 */
function createMatcher(url) {
    const stringUrl = internal_toIriString(url);
    let matcherThing = createThing({ url: stringUrl });
    matcherThing = setUrl(matcherThing, rdf.type, acp.Matcher);
    return matcherThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[ResourceMatcher]] for the given Resource.
 *
 * @param resourceWithAcr The Resource to which the new Matcher is to apply.
 * @param name Name that identifies this [[Matcher]].
 * @since Not released yet.
 */
function createResourceMatcherFor(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const url = new URL(getSourceUrl(acr));
    url.hash = `#${name}`;
    let matcherThing = createThing({ url: url.href });
    matcherThing = setUrl(matcherThing, rdf.type, acp.Matcher);
    return matcherThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Matcher]] with the given URL from an [[SolidDataset]].
 *
 * @param matcherResource The Resource that contains the given [[Matcher]].
 * @param url URL that identifies this [[Matcher]].
 * @returns The requested [[Matcher]], if it exists, or `null` if it does not.
 * @since Not released yet.
 */
function getMatcher(matcherResource, url) {
    const foundThing = getThing(matcherResource, url);
    if (foundThing === null || !isMatcher(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[ResourceMatcher]] with the given name from an Resource's Access Control
 * Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains the given [[ResourceMatcher]].
 * @param name Name that identifies this [[ResourceMatcher]].
 * @returns The requested [[ResourceMatcher]], if it exists, or `null` if it does not.
 * @since Not released yet.
 */
function getResourceMatcher(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const url = new URL(acrUrl);
    url.hash = `#${name}`;
    const foundThing = getThing(acr, url.href);
    if (foundThing === null || !isMatcher(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Gets the [[Matcher]]s from a [[SolidDataset]].
 *
 * @param matcherResource The Resource that contains (zero or more) [[Matcher]]s.
 * @returns The [[Matcher]]s contained in this resource.
 * @since Not released yet.
 */
function getMatcherAll(matcherResource) {
    const things = getThingAll(matcherResource);
    return things.filter(isMatcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Gets the [[ResourceMatcher]]s from a Resource's Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceMatcher]]s.
 * @returns The [[ResourceMatcher]]s contained in this Resource's Access Control Resource.
 * @since Not released yet.
 */
function getResourceMatcherAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const things = getThingAll(acr);
    return things.filter(isMatcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the given [[Matcher]] from the given [[SolidDataset]].
 *
 * @param matcherResource The Resource that contains (zero or more) [[Matcher]]s.
 * @returns A new SolidDataset equal to the given Matcher Resource, but without the given Matcher.
 * @since Not released yet.
 */
function removeMatcher(matcherResource, matcher) {
    return removeThing(matcherResource, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the given [[ResourceMatcher]] from the given Resource's Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceMatcher]]s.
 * @returns A new Resource equal to the given Resource, but without the given Matcher in its ACR.
 * @since Not released yet.
 */
function removeResourceMatcher(resourceWithAcr, matcher) {
    const acr = internal_getAcr(resourceWithAcr);
    let matcherToRemove;
    if (typeof matcher === "string") {
        if (internal_isValidUrl(matcher)) {
            matcherToRemove = matcher;
        }
        else {
            // If the given Matcher to remove is the name of the Matcher,
            // resolve it to its full URL — developers usually refer to either the
            // Matcher itself, or by its name, as they do not have access to the ACR
            // directly.
            const matcherUrl = new URL(getSourceUrl(acr));
            matcherUrl.hash = `#${matcher}`;
            matcherToRemove = matcherUrl.href;
        }
    }
    else if (isNamedNode(matcher)) {
        matcherToRemove = internal_toIriString(matcher);
    }
    else {
        matcherToRemove = asUrl(matcher);
    }
    // Check whether the actual Matcher (i.e. with the Matcher type) exists:
    const matchingMatcher = getResourceMatcher(resourceWithAcr, new URL(matcherToRemove).hash.substring(1));
    if (matchingMatcher === null) {
        // No such Matcher exists yet, so return the Resource+ACR unchanged:
        return resourceWithAcr;
    }
    const updatedAcr = removeThing(acr, matchingMatcher);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return updatedResource;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[Matcher]] into the given [[SolidDataset]], replacing previous
 * instances of that Matcher.
 *
 * @param matcherResource The Resource that contains (zero or more) [[Matcher]]s.
 * @returns A new SolidDataset equal to the given Matcher Resource, but with the given Matcher.
 * @since Not released yet.
 */
function setMatcher(matcherResource, matcher) {
    return setThing(matcherResource, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[ResourceMatcher]] into the given Resource's Access Control Resource,
 * replacing previous instances of that Matcher.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceMatcher]]s.
 * @returns A new Resource equal to the given Resource, but with the given Matcher in its ACR.
 * @since Not released yet.
 */
function setResourceMatcher(resourceWithAcr, matcher) {
    const acr = internal_getAcr(resourceWithAcr);
    const updatedAcr = setThing(acr, matcher);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return updatedResource;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the agents a [[Matcher]] applies **directly** to. This will not include agents
 * that are matched on a property other than their WebID.
 *
 * @param matcher The matcher from which agents are read.
 * @returns A list of the WebIDs of agents included in the matcher.
 * @since Not released yet.
 */
function getAgentAll(matcher) {
    return getIriAll(matcher, acp.agent).filter((agent) => agent !== acp.PublicAgent &&
        agent !== acp.AuthenticatedAgent &&
        agent !== acp.CreatorAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the agents the [[Matcher]] applies to with the provided agents.
 *
 * @param matcher The matcher for which agents are set.
 * @param agent The agent the matcher should apply to.
 * @returns A copy of the input matcher, applying to a different set of agents.
 * @since Not released yet.
 */
function setAgent(matcher, agent) {
    // Preserve the special agent classes authenticated and public, which we
    // don't want to overwrite with this function.
    const isPublic = hasPublic(matcher);
    const isAuthenticated = hasAuthenticated(matcher);
    const isCreator = hasCreator(matcher);
    let result = setIri(matcher, acp.agent, agent);
    // Restore public and authenticated
    if (isPublic) {
        result = setPublic(result);
    }
    if (isAuthenticated) {
        result = setAuthenticated(result);
    }
    if (isCreator) {
        result = setCreator(result);
    }
    return result;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Matcher]] to an additional agent.
 *
 * @param matcher The [[Matcher]] to be applied to an additional agent.
 * @param agent The agent the [[Matcher]] should apply to.
 * @returns A copy of the [[Matcher]], applying to an additional agent.
 * @since Not released yet.
 */
function addAgent(matcher, agent) {
    return addIri(matcher, acp.agent, agent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Matcher]] from applying to a given agent directly. This will not
 * prevent the agent from matching on other properties than its WebID.
 *
 * @param matcher The [[Matcher]] that should no longer apply to a given agent.
 * @param agent The agent the Matcher should no longer apply to.
 * @returns A copy of the Matcher, not applying to the given agent.
 * @since Not released yet.
 */
function removeAgent(matcher, agent) {
    return removeIri(matcher, acp.agent, agent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the Matcher applies to any agent.
 *
 * @param matcher The Matcher checked for public access.
 * @returns Whether the Matcher applies to any agent or not.
 * @since Not released yet.
 */
function hasPublic(matcher) {
    return (getIriAll(matcher, acp.agent).filter((agent) => agent === acp.PublicAgent)
        .length > 0);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to apply to any Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply to any agent.
 * @since Not released yet.
 */
function setPublic(matcher) {
    // The second argument should not be part of the function signature,
    // so it's not in the parameter list:
    // eslint-disable-next-line prefer-rest-params
    if (typeof arguments === "object" && typeof arguments[1] === "boolean") {
        throw new Error("The function `setPublic` no longer takes a second parameter. It is now used together with `removePublic` instead.");
    }
    return addIri(matcher, acp.agent, acp.PublicAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to no longer apply to any Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to no longer apply to any agent.
 * @since Not released yet.
 */
function removePublic(matcher) {
    return removeIri(matcher, acp.agent, acp.PublicAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the Matcher applies to any authenticated agent.
 *
 * @param matcher The Matcher checked for authenticated access.
 * @returns Whether the Matcher applies to any authenticated agent or not.
 * @since Not released yet.
 */
function hasAuthenticated(matcher) {
    return (getIriAll(matcher, acp.agent).filter((agent) => agent === acp.AuthenticatedAgent).length > 0);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to apply to any authenticated Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply to any authenticated Agent.
 * @since Not released yet.
 */
function setAuthenticated(matcher) {
    // The second argument should not be part of the function signature,
    // so it's not in the parameter list:
    // eslint-disable-next-line prefer-rest-params
    if (typeof arguments === "object" && typeof arguments[1] === "boolean") {
        throw new Error("The function `setAuthenticated` no longer takes a second parameter. It is now used together with `removeAuthenticated` instead.");
    }
    return addIri(matcher, acp.agent, acp.AuthenticatedAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to no longer apply to any authenticated Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply/not apply to any authenticated agent.
 * @since Not released yet.
 */
function removeAuthenticated(matcher) {
    return removeIri(matcher, acp.agent, acp.AuthenticatedAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the Matcher applies to the creator of the Resource.
 *
 * @param matcher The Matcher checked for authenticated access.
 * @returns Whether the Matcher applies to the creator of the Resource or not.
 * @since Not released yet.
 */
function hasCreator(matcher) {
    return (getIriAll(matcher, acp.agent).filter((agent) => agent === acp.CreatorAgent)
        .length > 0);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to apply to the creator of a Resource.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply to the creator of a Resource.
 * @since Not released yet.
 */
function setCreator(matcher) {
    // The second argument should not be part of the function signature,
    // so it's not in the parameter list:
    // eslint-disable-next-line prefer-rest-params
    if (typeof arguments === "object" && typeof arguments[1] === "boolean") {
        throw new Error("The function `setCreator` no longer takes a second parameter. It is now used together with `removeCreator` instead.");
    }
    return addIri(matcher, acp.agent, acp.CreatorAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to no longer apply to the creator of a Resource.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply/not apply to the creator of a Resource.
 * @since Not released yet.
 */
function removeCreator(matcher) {
    return removeIri(matcher, acp.agent, acp.CreatorAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the clients a [[Matcher]] applies **directly** to. This will not include
 * specific client classes, such as public clients.
 *
 * @param matcher The Matcher from which clients are read.
 * @returns A list of the WebIDs of clients included in the Matcher.
 * @since Not released yet.
 */
function getClientAll(matcher) {
    return getIriAll(matcher, acp.client)
        .filter((client) => client !== solid.PublicOidcClient)
        .concat(getStringNoLocaleAll(matcher, acp.client));
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Matcher]] to an additional Client.
 *
 * @param matcher The [[Matcher]] to be applied to an additional Client.
 * @param client The Client the [[Matcher]] should apply to.
 * @returns A copy of the [[Matcher]], applying to an additional Client.
 * @since Not released yet.
 */
function addClient(matcher, client) {
    if (!internal_isValidUrl(client)) {
        return addStringNoLocale(matcher, acp.client, client);
    }
    return addIri(matcher, acp.client, client);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Matcher]] from applying to a given Client directly.
 *
 * @param matcher The [[Matcher]] that should no longer apply to a given Client.
 * @param client The Client the Matcher should no longer apply to.
 * @returns A copy of the Matcher, not applying to the given Client.
 * @since Not released yet.
 */
function removeClient(matcher, client) {
    if (!internal_isValidUrl(client)) {
        return removeStringNoLocale(matcher, acp.client, client);
    }
    return removeIri(matcher, acp.client, client);
}

export { addAgent, addAllOfMatcherUrl, addAnyOfMatcherUrl, addClient, addNoneOfMatcherUrl, createMatcher, createResourceMatcherFor, getAgentAll, getAllOfMatcherUrlAll, getAnyOfMatcherUrlAll, getClientAll, getMatcher, getMatcherAll, getNoneOfMatcherUrlAll, getResourceMatcher, getResourceMatcherAll, hasAuthenticated, hasCreator, hasPublic, removeAgent, removeAllOfMatcherUrl, removeAnyOfMatcherUrl, removeAuthenticated, removeClient, removeCreator, removeMatcher, removeNoneOfMatcherUrl, removePublic, removeResourceMatcher, setAgent, setAllOfMatcherUrl, setAnyOfMatcherUrl, setAuthenticated, setCreator, setMatcher, setNoneOfMatcherUrl, setPublic, setResourceMatcher };
