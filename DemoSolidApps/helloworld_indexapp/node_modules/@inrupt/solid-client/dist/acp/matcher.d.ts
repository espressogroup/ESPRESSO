import type { SolidDataset, ThingPersisted, Url, UrlString, WebId } from "../interfaces";
import type { WithAccessibleAcr } from "./acp";
import type { Policy, ResourcePolicy } from "./policy";
/**
 * A Matcher can be applied to a [[Policy]] to determine under what circumstances that Policy is applied to a Resource.
 * @since Not released yet.
 */
export type Matcher = ThingPersisted;
/**
 * A ResourceMatcher is like a [[Matcher]], but applied to a [[ResourcePolicy]] and therefore not re-used across different Resources, but only used for a single Resource and stored in that Resource's Access Control Resource.
 * @since Not released yet.
 */
export type ResourceMatcher = ThingPersisted;
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
export declare function addAllOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function removeAllOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function setAllOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function getAllOfMatcherUrlAll<P extends Policy | ResourcePolicy>(policy: P): UrlString[];
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
export declare function addAnyOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function removeAnyOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function setAnyOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function getAnyOfMatcherUrlAll<P extends Policy | ResourcePolicy>(policy: P): UrlString[];
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
export declare function addNoneOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function removeNoneOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function setNoneOfMatcherUrl<P extends Policy | ResourcePolicy>(policy: P, matcher: Matcher | Url | UrlString): P;
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
export declare function getNoneOfMatcherUrlAll<P extends Policy | ResourcePolicy>(policy: P): UrlString[];
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
export declare function createMatcher(url: Url | UrlString): Matcher;
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
export declare function createResourceMatcherFor(resourceWithAcr: WithAccessibleAcr, name: string): ResourceMatcher;
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
export declare function getMatcher(matcherResource: SolidDataset, url: Url | UrlString): Matcher | null;
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
export declare function getResourceMatcher(resourceWithAcr: WithAccessibleAcr, name: string): ResourceMatcher | null;
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
export declare function getMatcherAll(matcherResource: SolidDataset): Matcher[];
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
export declare function getResourceMatcherAll(resourceWithAcr: WithAccessibleAcr): ResourceMatcher[];
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
export declare function removeMatcher<Dataset extends SolidDataset>(matcherResource: Dataset, matcher: Url | UrlString | Matcher): Dataset;
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
export declare function removeResourceMatcher<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, matcher: string | Url | UrlString | ResourceMatcher): ResourceExt;
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
export declare function setMatcher<Dataset extends SolidDataset>(matcherResource: Dataset, matcher: Matcher): Dataset;
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
export declare function setResourceMatcher<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, matcher: ResourceMatcher): ResourceExt;
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
export declare function getAgentAll(matcher: Matcher): WebId[];
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
export declare function setAgent(matcher: Matcher, agent: WebId): Matcher;
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
export declare function addAgent(matcher: Matcher, agent: WebId): Matcher;
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
export declare function removeAgent(matcher: Matcher, agent: WebId): Matcher;
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
export declare function hasPublic(matcher: Matcher): boolean;
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
export declare function setPublic(matcher: Matcher): Matcher;
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
export declare function removePublic(matcher: Matcher): Matcher;
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
export declare function hasAuthenticated(matcher: Matcher): boolean;
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
export declare function setAuthenticated(matcher: Matcher): Matcher;
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
export declare function removeAuthenticated(matcher: Matcher): Matcher;
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
export declare function hasCreator(matcher: Matcher): boolean;
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
export declare function setCreator(matcher: Matcher): Matcher;
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
export declare function removeCreator(matcher: Matcher): Matcher;
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
export declare function getClientAll(matcher: Matcher): WebId[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the clients the [[Matcher]] applies to with the provided Client.
 *
 * @param matcher The Matcher for which clients are set.
 * @param client The Client the Matcher should apply to.
 * @returns A copy of the input Matcher, applying to a different set of Clients.
 */
export declare function setClient(matcher: Matcher, client: Url | string): Matcher;
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
export declare function addClient(matcher: Matcher, client: Url | string): Matcher;
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
export declare function removeClient(matcher: Matcher, client: Url | string): Matcher;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the Matcher applies to any client, i.e. all the applications
 * regardless of their identifier.
 *
 * @param matcher The Matcher checked for authenticated access.
 * @returns Whether the Matcher applies to public clients.
 * @since Not released yet.
 * @deprecated
 */
export declare function hasAnyClient(matcher: Matcher): boolean;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Make the [[Matcher]] apply to any client application.
 *
 * @param matcher The Matcher for which clients are set.
 * @returns A copy of the Matcher, updated to apply to any client
 * @since Not released yet.
 * @deprecated
 */
export declare function setAnyClient(matcher: Matcher): Matcher;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Make the [[Matcher]] no longer apply to any client application.
 *
 * @param matcher The Matcher for which clients are set.
 * @returns A copy of the Matcher, updated to no longer apply to any client
 * @since Not released yet.
 * @deprecated
 */
export declare function removeAnyClient(matcher: Matcher): Matcher;
/**
 * Gets a human-readable representation of the given [[Matcher]] to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param matcher The Matcher to get a human-readable representation of.
 * @since Not released yet.
 * @deprecated
 */
export declare function matcherAsMarkdown(matcher: Matcher): string;
