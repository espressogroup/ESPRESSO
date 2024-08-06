import type { WithServerResourceInfo, WithChangeLog, WebId } from "../interfaces";
import type { AclDataset, Access, WithAcl } from "./acl";
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 */
export type AgentAccess = Record<WebId, Access>;
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
export declare function getAgentAccess(resourceInfo: WithAcl & WithServerResourceInfo, agent: WebId): Access | null;
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
export declare function getAgentAccessAll(resourceInfo: WithAcl & WithServerResourceInfo): AgentAccess | null;
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
export declare function getAgentResourceAccess(aclDataset: AclDataset, agent: WebId): Access;
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
export declare function getAgentResourceAccessAll(aclDataset: AclDataset): AgentAccess;
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
export declare function setAgentResourceAccess(aclDataset: AclDataset, agent: WebId, access: Access): AclDataset & WithChangeLog;
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
export declare function getAgentDefaultAccess(aclDataset: AclDataset, agent: WebId): Access;
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
export declare function getAgentDefaultAccessAll(aclDataset: AclDataset): AgentAccess;
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
export declare function setAgentDefaultAccess(aclDataset: AclDataset, agent: WebId, access: Access): AclDataset & WithChangeLog;
