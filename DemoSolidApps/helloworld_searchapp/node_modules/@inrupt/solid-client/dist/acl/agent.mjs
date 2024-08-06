import { getIri } from '../thing/get.mjs';
import { acl } from '../constants.mjs';
import { hasResourceAcl, hasFallbackAcl, getResourceAcl, getFallbackAcl } from './acl.mjs';
import { internal_getAclRules, internal_getResourceAclRulesForResource, internal_getAccess, internal_combineAccessModes, internal_setActorAccess, internal_getDefaultAclRulesForResource, internal_getAclRulesForIri, internal_getAccessByIri } from './acl.internal.mjs';

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
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns an Agent's explicitly-granted Access Modes for the given Resource.
 *
 * The function does not return Access Modes granted indirectly to the Agent through other
 * ACL rules, e.g., public or group-specific permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Agent may have been granted access.
 * @param agent WebID of the Agent for which to retrieve what access it has to the Resource.
 * @returns Access Modes that have been explicitly granted to the Agent for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control access to a given Resource or its Container).
 */
function getAgentAccess(resourceInfo, agent) {
    if (hasResourceAcl(resourceInfo)) {
        return getAgentResourceAccess(resourceInfo.internal_acl.resourceAcl, agent);
    }
    if (hasFallbackAcl(resourceInfo)) {
        return getAgentDefaultAccess(resourceInfo.internal_acl.fallbackAcl, agent);
    }
    return null;
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Returns all explicitly-granted Access Modes per Agent for the given Resource.
 *
 * The function does not return Access Modes granted indirectly to Agents through other
 * ACL rules, e.g., public or group-specific permissions.
 *
 * @param resourceInfo Information about the Resource to which Agents may have been granted access.
 * @returns Access Modes per Agent that have been explicitly granted for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control access to a given Resource or its Container).
 */
function getAgentAccessAll(resourceInfo) {
    if (hasResourceAcl(resourceInfo)) {
        const resourceAcl = getResourceAcl(resourceInfo);
        return getAgentResourceAccessAll(resourceAcl);
    }
    if (hasFallbackAcl(resourceInfo)) {
        const fallbackAcl = getFallbackAcl(resourceInfo);
        return getAgentDefaultAccessAll(fallbackAcl);
    }
    return null;
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes explicitly granted to an Agent for the Resource
 * associated with an ACL (Access ControlList).
 *
 * The function does not return:
 *
 * - Access Modes granted indirectly to the Agent through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to the Agent for the child Resources if the associated Resource is a Container (see [[getAgentDefaultAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains ACL rules.
 * @param agent WebID of the Agent for which to retrieve what access it has to the Resource.
 * @returns Access Modes that have been explicitly granted to an Agent for the Resource associated with an ACL SolidDataset.
 */
function getAgentResourceAccess(aclDataset, agent) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getResourceAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRulesForAgent(resourceRules, agent);
    const agentAccessModes = agentResourceRules.map(internal_getAccess);
    return internal_combineAccessModes(agentAccessModes);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the explicitly granted Access Modes per Agent for the Resource associated
 * with an ACL (Access Control List).
 *
 * The function does not return:
 *
 * - Access Modes granted indirectly to Agents through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to Agents for the child Resources if the associated Resource is a Container.
 *
 * @param aclDataset The SolidDataset that contains ACL rules.
 * @returns Access Modes per Agent that have been explicitly granted for the Resource associated with an ACL SolidDataset.
 */
function getAgentResourceAccessAll(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getResourceAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRules(resourceRules);
    return getAccessByAgent(agentResourceRules);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the given Agent.
 * Specifically, the function returns a new resource ACL initialised with the given ACL and
 * new rules for the Agent's access.
 *
 * If rules for Agent's access already exist in the given ACL, in the returned ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 *
 * - Access Modes granted indirectly to Agents through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to Agents for the child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param agent The Agent to grant specific Access Modes.
 * @param access The Access Modes to grant to the Agent for the Resource.
 * @returns A new resource ACL initialised with the given `aclDataset` and `access` for the `agent`.
 */
function setAgentResourceAccess(aclDataset, agent, access) {
    return internal_setActorAccess(aclDataset, access, acl.agent, "resource", agent);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns an Agent's Access Modes explicitly granted for the children of the
 * Container associated with the given ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Agent through other ACL rules, e.g. public or group-specific permissions.
 * - Access Modes granted to the Agent for the Container Resource itself (see [[getAgentResourceAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules for a certain Container.
 * @param agent WebID of the Agent for which to retrieve what access it has to the Container's children.
 * @returns Access Modes that have been explicitly granted to an Agent for the children of the Container associated with the given ACL.
 */
function getAgentDefaultAccess(aclDataset, agent) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getDefaultAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRulesForAgent(resourceRules, agent);
    const agentAccessModes = agentResourceRules.map(internal_getAccess);
    return internal_combineAccessModes(agentAccessModes);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes, per Agent, that have been explicitly granted for the children
 * of the Container associated with the given ACL (Access Control List).
 *
 * The function does not return:
 *
 * - Access Modes granted indirectly to the Agents through other ACL rules, e.g. public or group-specific permissions.
 * - Access Modes granted to the Agents for the Container Resource itself (see [[getAgentResourceAccessAll]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @returns Access Modes, per Agent, that have been explicitly granted for the children of the Container associated with the given ACL.
 */
function getAgentDefaultAccessAll(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getDefaultAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRules(resourceRules);
    return getAccessByAgent(agentResourceRules);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the default ACL (Access Control List) to set an Agent's Access Modes for the Container's children.
 * Specifically, the function returns a new default ACL initialised with the given ACL and
 * new rules for the Agent's access.
 *
 * If rules already exist for the Agent in the given ACL, in the returned ACL, they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted indirectly to the Agent through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to the Agent for the Container Resource itself.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param agent The Agent to grant specific Access Modes.
 * @param access The Access Modes to grant to the Agent.
 * @returns A new default ACL initialised with the given `aclDataset` and `access` for the `agent`.
 */
function setAgentDefaultAccess(aclDataset, agent, access) {
    return internal_setActorAccess(aclDataset, access, acl.agent, "default", agent);
}
function getAgentAclRulesForAgent(aclRules, agent) {
    return internal_getAclRulesForIri(aclRules, agent, acl.agent);
}
function getAgentAclRules(aclRules) {
    return aclRules.filter(isAgentAclRule);
}
function isAgentAclRule(aclRule) {
    return getIri(aclRule, acl.agent) !== null;
}
function getAccessByAgent(aclRules) {
    return internal_getAccessByIri(aclRules, acl.agent);
}

export { getAgentAccess, getAgentAccessAll, getAgentDefaultAccess, getAgentDefaultAccessAll, getAgentResourceAccess, getAgentResourceAccessAll, setAgentDefaultAccess, setAgentResourceAccess };
