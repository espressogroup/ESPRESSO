import type { SolidDataset, ThingPersisted, Url, UrlString, WebId } from "../interfaces";
import type { WithAccessibleAcr } from "./acp";
import type { Policy, ResourcePolicy } from "./policy";
/**
 * A Rule can be applied to a [[Policy]] to determine under what circumstances that Policy is applied to a Resource.
 * @since 1.6.0
 */
export type Rule = ThingPersisted;
/**
 * A ResourceRule is like a [[Rule]], but applied to a [[ResourcePolicy]] and therefore not re-used across different Resources, but only used for a single Resource and stored in that Resource's Access Control Resource.
 * @since 1.6.0
 */
export type ResourceRule = ThingPersisted;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a rule that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" rules,
 * they will not be granted access.
 *
 * Also see [[addAnyOfRuleUrl]] and [[addNoneOfRuleUrl]].
 *
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rule The rule to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new rule added.
 * @since 1.6.0
 */
export declare function addAllOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a rule that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" rules,
 * they will not be granted access.
 * @param policy The [[Policy]] from which the rule should be removed.
 * @param rule The rule to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the rule removed.
 * @since 1.6.0
 */
export declare function removeAllOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrites the rule refining the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" rules,
 * they will not be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rules The rules the policy requires.
 * @returns A new [[Policy]] clone of the original one, with the "All Of" rules replaced.
 * @since 1.6.0
 */
export declare function setAllOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "All Of" [[Rule]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the rules should be read.
 * @returns A list of the "All Of" [[Rule]]s
 * @since 1.6.0
 */
export declare function getAllOfRuleUrlAll<P extends Policy | ResourcePolicy>(policy: P): UrlString[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a rule that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" rules,
 * they will be granted access.
 *
 * Also see [[addAllOfRuleUrl]] and [[addNoneOfRuleUrl]].
 *
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rule The rule to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new rule added.
 * @since 1.6.0
 */
export declare function addAnyOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a rule that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" rules,
 * they will be granted access.
 * @param policy The [[Policy]] from which the rule should be removed.
 * @param rule The rule to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the rule removed.
 * @since 1.6.0
 */
export declare function removeAnyOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the rule extending the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" rules,
 * they will be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rules The rules the policy accepts.
 * @returns A new [[Policy]] clone of the original one, with the "Any Of" rules replaced.
 * @since 1.6.0
 */
export declare function setAnyOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "Any Of" [[Rule]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the rules should be read.
 * @returns A list of the "Any Of" [[Rule]]s
 * @since 1.6.0
 */
export declare function getAnyOfRuleUrlAll<P extends Policy | ResourcePolicy>(policy: P): UrlString[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a rule that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the forbidden rules,
 * they will **not** be granted access.
 *
 * Also see [[addAllOfRuleUrl]] and [[addAnyOfRuleUrl]].
 *
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rule The rule to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new rule added.
 * @since 1.6.0
 */
export declare function addNoneOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a rule that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the forbidden rules,
 * they will **not** be granted access.
 * @param policy The [[Policy]] from which the rule should be removed.
 * @param rule The rule to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the rule removed.
 * @since 1.6.0
 */
export declare function removeNoneOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set the rules restrincting the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "None Of" rules,
 * they will not be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rules The rules the policy accepts.
 * @returns A new [[Policy]] clone of the original one, with the "Any Of" rules replaced.
 * @since 1.6.0
 */
export declare function setNoneOfRuleUrl<P extends Policy | ResourcePolicy>(policy: P, rule: Rule | Url | UrlString): P;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "None Of" [[Rule]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the rules should be read.
 * @returns A list of the forbidden [[Rule]]s
 * @since 1.6.0
 */
export declare function getNoneOfRuleUrlAll<P extends Policy | ResourcePolicy>(policy: P): UrlString[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[Rule]].
 *
 * @param url URL that identifies this [[Rule]].
 * @since 1.6.0
 */
export declare function createRule(url: Url | UrlString): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[ResourceRule]] for the given Resource.
 *
 * @param resourceWithAcr The Resource to which the new Rule is to apply.
 * @param name Name that identifies this [[Rule]].
 * @since 1.6.0
 */
export declare function createResourceRuleFor(resourceWithAcr: WithAccessibleAcr, name: string): ResourceRule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Rule]] with the given URL from an [[SolidDataset]].
 *
 * @param ruleResource The Resource that contains the given [[Rule]].
 * @param url URL that identifies this [[Rule]].
 * @returns The requested [[Rule]], if it exists, or `null` if it does not.
 * @since 1.6.0
 */
export declare function getRule(ruleResource: SolidDataset, url: Url | UrlString): Rule | null;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[ResourceRule]] with the given name from an Resource's Access Control
 * Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains the given [[ResourceRule]].
 * @param name Name that identifies this [[ResourceRule]].
 * @returns The requested [[ResourceRule]], if it exists, or `null` if it does not.
 * @since 1.6.0
 */
export declare function getResourceRule(resourceWithAcr: WithAccessibleAcr, name: string): ResourceRule | null;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Gets the [[Rule]]s from a [[SolidDataset]].
 *
 * @param ruleResource The Resource that contains (zero or more) [[Rule]]s.
 * @returns The [[Rule]]s contained in this resource.
 * @since 1.6.0
 */
export declare function getRuleAll(ruleResource: SolidDataset): Rule[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Gets the [[ResourceRule]]s from a Resource's Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceRule]]s.
 * @returns The [[ResourceRule]]s contained in this Resource's Access Control Resource.
 * @since 1.6.0
 */
export declare function getResourceRuleAll(resourceWithAcr: WithAccessibleAcr): ResourceRule[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the given [[Rule]] from the given [[SolidDataset]].
 *
 * @param ruleResource The Resource that contains (zero or more) [[Rule]]s.
 * @returns A new SolidDataset equal to the given Rule Resource, but without the given Rule.
 * @since 1.6.0
 */
export declare function removeRule<Dataset extends SolidDataset>(ruleResource: Dataset, rule: Url | UrlString | Rule): Dataset;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the given [[ResourceRule]] from the given Resource's Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceRule]]s.
 * @returns A new Resource equal to the given Resource, but without the given Rule in its ACR.
 * @since 1.6.0
 */
export declare function removeResourceRule<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, rule: string | Url | UrlString | ResourceRule): ResourceExt;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[Rule]] into the given [[SolidDataset]], replacing previous
 * instances of that Rule.
 *
 * @param ruleResource The Resource that contains (zero or more) [[Rule]]s.
 * @returns A new SolidDataset equal to the given Rule Resource, but with the given Rule.
 * @since 1.6.0
 */
export declare function setRule<Dataset extends SolidDataset>(ruleResource: Dataset, rule: Rule): Dataset;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[ResourceRule]] into the given Resource's Access Control Resource,
 * replacing previous instances of that Rule.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceRule]]s.
 * @returns A new Resource equal to the given Resource, but with the given Rule in its ACR.
 * @since 1.6.0
 */
export declare function setResourceRule<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, rule: ResourceRule): ResourceExt;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the agents a [[Rule]] applies **directly** to. This will not include agents
 * that are part of a group the [[Rule]] applies to, nor will it include specific agent
 * classes, such as authenticated or public agents.
 *
 * @param rule The rule from which agents are read.
 * @returns A list of the WebIDs of agents included in the rule.
 * @since 1.6.0
 */
export declare function getAgentAll(rule: Rule): WebId[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the agents the [[Rule]] applies to with the provided agents.
 *
 * @param rule The rule for which agents are set.
 * @param agent The agent the rule should apply to.
 * @returns A copy of the input rule, applying to a different set of agents.
 * @since 1.6.0
 */
export declare function setAgent(rule: Rule, agent: WebId): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Rule]] to an additional agent.
 *
 * @param rule The [[Rule]] to be applied to an additional agent.
 * @param agent The agent the [[Rule]] should apply to.
 * @returns A copy of the [[Rule]], applying to an additional agent.
 * @since 1.6.0
 */
export declare function addAgent(rule: Rule, agent: WebId): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Rule]] from applying to a given agent directly. This will not
 * remove the agent from any groups the rule applies to.
 *
 * @param rule The [[Rule]] that should no longer apply to a given agent.
 * @param agent The agent the rule should no longer apply to.
 * @returns A copy of the rule, not applying to the given agent.
 * @since 1.6.0
 */
export declare function removeAgent(rule: Rule, agent: WebId): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Lists all the groups a [[Rule]] applies to.
 *
 * @param rule The rule from which groups are read.
 * @returns A list of the [[URL]]'s of groups included in the rule.
 * @since 1.6.0
 * @deprecated Access Control Policies will no longer support vcard:Group. You can re-use a Rule listing multiple Agents to get the same functionality.
 */
export declare function getGroupAll(rule: Rule): UrlString[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the groups the [[Rule]] applies to with the provided groups.
 *
 * @param rule The rule for which groups are set.
 * @param group The group the rule should apply to.
 * @returns A copy of the input rule, applying to a different set of groups.
 * @since 1.6.0
 * @deprecated Access Control Policies will no longer support vcard:Group. You can re-use a Rule listing multiple Agents to get the same functionality.
 */
export declare function setGroup(rule: Rule, group: UrlString): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Rule]] to an additional group.
 *
 * @param rule The [[Rule]] to be applied to an additional group.
 * @param agent The group the [[Rule]] should apply to.
 * @returns A copy of the [[Rule]], applying to an additional group.
 * @since 1.6.0
 * @deprecated Access Control Policies will no longer support vcard:Group. You can re-use a Rule listing multiple Agents to get the same functionality.
 */
export declare function addGroup(rule: Rule, group: UrlString): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Rule]] from applying to a given group.
 *
 * @param rule The [[Rule]] that should no longer apply to a given group.
 * @param agent The group the rule should no longer apply to.
 * @returns A copy of the rule, not applying to the given group.
 * @since 1.6.0
 * @deprecated Access Control Policies will no longer support vcard:Group. You can re-use a Rule listing multiple Agents to get the same functionality.
 */
export declare function removeGroup(rule: Rule, group: UrlString): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to any agent.
 *
 * @param rule The rule checked for public access.
 * @returns Whether the rule applies to any agent or not.
 * @since 1.6.0
 */
export declare function hasPublic(rule: Rule): boolean;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Rule to apply to any Agent.
 *
 * @param rule The rule being modified.
 * @returns A copy of the rule, updated to apply to any agent.
 * @since 1.6.0
 */
export declare function setPublic(rule: Rule): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Rule to no longer apply to any Agent.
 *
 * @param rule The rule being modified.
 * @returns A copy of the rule, updated to no longer apply to any agent.
 * @since 1.6.0
 */
export declare function removePublic(rule: Rule): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to any authenticated agent.
 *
 * @param rule The rule checked for authenticated access.
 * @returns Whether the rule applies to any authenticated agent or not.
 * @since 1.6.0
 */
export declare function hasAuthenticated(rule: Rule): boolean;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Rule to apply to any authenticated Agent.
 *
 * @param rule The rule being modified.
 * @returns A copy of the rule, updated to apply to any authenticated Agent.
 * @since 1.6.0
 */
export declare function setAuthenticated(rule: Rule): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Rule to no longer apply to any authenticated Agent.
 *
 * @param rule The rule being modified.
 * @returns A copy of the rule, updated to apply/not apply to any authenticated agent.
 * @since 1.6.0
 */
export declare function removeAuthenticated(rule: Rule): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to the creator of the Resource.
 *
 * @param rule The rule checked for authenticated access.
 * @returns Whether the rule applies to the creator of the Resource or not.
 * @since 1.6.0
 */
export declare function hasCreator(rule: Rule): boolean;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Rule to apply to the creator of a Resource.
 *
 * @param rule The rule being modified.
 * @returns A copy of the rule, updated to apply to the creator of a Resource.
 * @since 1.6.0
 */
export declare function setCreator(rule: Rule): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Rule to no longer apply to the creator of a Resource.
 *
 * @param rule The rule being modified.
 * @returns A copy of the rule, updated to apply/not apply to the creator of a Resource.
 * @since 1.6.0
 */
export declare function removeCreator(rule: Rule): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the clients a [[Rule]] applies **directly** to. This will not include
 * specific client classes, such as public clients.
 *
 * @param rule The rule from which clients are read.
 * @returns A list of the WebIDs of clients included in the rule.
 * @since 1.6.0
 */
export declare function getClientAll(rule: Rule): WebId[];
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the clients the [[Rule]] applies to with the provided Client.
 *
 * @param rule The rule for which clients are set.
 * @param client The Client the rule should apply to.
 * @returns A copy of the input rule, applying to a different set of Clients.
 * @since 1.6.0
 */
export declare function setClient(rule: Rule, client: WebId): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Rule]] to an additional Client.
 *
 * @param rule The [[Rule]] to be applied to an additional Client.
 * @param client The Client the [[Rule]] should apply to.
 * @returns A copy of the [[Rule]], applying to an additional Client.
 * @since 1.6.0
 */
export declare function addClient(rule: Rule, client: WebId): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Rule]] from applying to a given Client directly.
 *
 * @param rule The [[Rule]] that should no longer apply to a given Client.
 * @param client The Client the rule should no longer apply to.
 * @returns A copy of the rule, not applying to the given Client.
 * @since 1.6.0
 */
export declare function removeClient(rule: Rule, client: WebId): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to any client, i.e. all the applications
 * regardless of their identifier.
 *
 * @param rule The rule checked for authenticated access.
 * @returns Whether the rule applies to public clients.
 * @since 1.6.0
 */
export declare function hasAnyClient(rule: Rule): boolean;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Make the [[Rule]] apply to any client application.
 *
 * @param rule The rule for which clients are set.
 * @returns A copy of the rule, updated to apply to any client
 * @since 1.6.0
 */
export declare function setAnyClient(rule: Rule): Rule;
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Make the [[Rule]] no longer apply to any client application.
 *
 * @param rule The rule for which clients are set.
 * @returns A copy of the rule, updated to no longer apply to any client
 * @since 1.6.0
 */
export declare function removeAnyClient(rule: Rule): Rule;
/**
 * Gets a human-readable representation of the given [[Rule]] to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param rule The Rule to get a human-readable representation of.
 * @since 1.6.0
 */
export declare function ruleAsMarkdown(rule: Rule): string;
