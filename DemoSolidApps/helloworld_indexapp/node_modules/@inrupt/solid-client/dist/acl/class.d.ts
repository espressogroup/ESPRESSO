import type { WithServerResourceInfo, WithChangeLog } from "../interfaces";
import type { Access, AclDataset, WithAcl } from "./acl";
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes granted to the public in general for a Resource.
 *
 * This function does not return Access Modes granted to specific Agents
 * through other ACL (Access Control List) rules, e.g., agent- or group-specific permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Agent may have been granted access.
 * @returns Access Modes granted to the public in general for the Resource, or `null` if it could not be determined (e.g. because the current user does not have Control Access to a given Resource or its Container).
 */
export declare function getPublicAccess(resourceInfo: WithAcl & WithServerResourceInfo): Access | null;
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes granted to the public in general for the Resource
 * associated with an ACL (Access Control List).
 *
 * This function does not return:
 * - Access Modes granted to specific Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to child Resources if the associated Resource is a Container (see [[getPublicDefaultAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @returns Access Modes granted to the public in general for the Resource associated with the `aclDataset`.
 */
export declare function getPublicResourceAccess(aclDataset: AclDataset): Access;
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes granted to the public in general for the child Resources
 * of the Container associated with an ACL (Access Control List).
 *
 * This function does not return:
 * - Access Modes granted to Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to the Container Resource itself (see [[getPublicResourceAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules for a certain Container.
 * @returns Access Modes granted to the public in general for the children of the Container associated with the given `aclDataset`.
 */
export declare function getPublicDefaultAccess(aclDataset: AclDataset): Access;
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the public.
 * Specifically, the function returns a new resource ACL (Access Control List) initialised
 * with the given resource ACL and new rules for the given public access.
 *
 * If rules for public access already exist in the given ACL, in the *returned* ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted to Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @param access The Access Modes to grant to the public.
 * @returns A new resource ACL initialised with the given `aclDataset` and public `access`.
 */
export declare function setPublicResourceAccess(aclDataset: AclDataset, access: Access): AclDataset & WithChangeLog;
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the default ACL (Access Control List) to set the public's default Access Modes
 * to child resources. Specifically, the function returns a new default ACL initialised
 * with the given default ACL and new rules for the given public access.
 *
 * If rules for public access already exist in the given ACL, in the *returned* ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted to Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to Container Resource itself.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @param access The Access Modes to grant to the public.
 * @returns A new default ACL initialised with the given `aclDataset` and public `access`.
 */
export declare function setPublicDefaultAccess(aclDataset: AclDataset, access: Access): AclDataset & WithChangeLog;
