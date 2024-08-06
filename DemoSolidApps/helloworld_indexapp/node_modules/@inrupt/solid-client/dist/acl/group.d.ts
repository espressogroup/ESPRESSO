import type { WithServerResourceInfo, IriString, UrlString, WithChangeLog } from "../interfaces";
import type { AclDataset, Access, WithAcl } from "./acl";
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Returns a Group's explicity-granted Access Modes for a given Resource.
 *
 * The function does not return Access Modes granted indirectly to the Group through other
 * ACL rules, e.g., public permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Group may have been granted access.
 * @param group URL of the Group for which to retrieve what access it has to the Resource.
 * @returns Access Modes that have been explicitly granted to the `group` for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control Access to a given Resource or its Container).
 */
export declare function getGroupAccess(resourceInfo: WithAcl & WithServerResourceInfo, group: UrlString): Access | null;
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns all explicitly-granted Access Modes per Group for the given Resource.
 *
 * The function does not return Access Modes granted indirectly to the Group through other
 * ACL rules, e.g., public permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Group may have been granted access.
 * @returns Access Modes per Group that have been explicitly granted for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control Access to a given Resource or its Container).
 */
export declare function getGroupAccessAll(resourceInfo: WithAcl & WithServerResourceInfo): Record<IriString, Access> | null;
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes explicitly granted to a Group for the Resource
 * associated with an ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g., public permissions.
 * - Access Modes granted to the Group for the child Resources if the associated Resource is a Container
 *   (see [[getGroupDefaultAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @param group URL of the Group for which to retrieve what access it has to the Resource.
 * @returns Access Modes explicitly granted to a Group for the Resource associated with an ACL.
 */
export declare function getGroupResourceAccess(aclDataset: AclDataset, group: UrlString): Access;
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the explicitly granted Access Modes per Group for the Resource associated
 * with an ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g., public permissions.
 * - Access Modes granted to Groups for the child Resources if the associated Resource is a Container.
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @returns Access Modes per Group that have been explicitly granted for the Resource associated with an ACL.
 */
export declare function getGroupResourceAccessAll(aclDataset: AclDataset): Record<UrlString, Access>;
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns a Group's Access Modes explicitly granted for the children of the
 * Container associated with an ACL (Access ControlList).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g. public permissions.
 * - Access Modes granted to the Group for the Container Resource itself (see [[getGroupResourceAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains ACL rules for a certain Container.
 * @param group URL of the Group for which to retrieve what access it has to the child Resources of the given Container.
 * @returns Access Modes that have been explicitly granted to the Group for the children of the Container associated with the given ACL.
 */
export declare function getGroupDefaultAccess(aclDataset: AclDataset, group: UrlString): Access;
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes, per Group, that have been explicitly granted for the children
 * of the Container associated with the given ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Groups through other ACL rules, e.g. public permissions.
 * - Access Modes granted to the Groups for the Container Resource itself (see [[getGroupResourceAccessAll]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules for a certain Container.
 * @returns Access Modes per Group that have been explicitly granted for the children of the Container associated with the given ACL SolidDataset.
 */
export declare function getGroupDefaultAccessAll(aclDataset: AclDataset): Record<UrlString, Access>;
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the given Group.
 * Specifically, the function returns a new resource ACL initialised with the given ACL and
 * new rules for the Group's access.
 *
 * If rules for Groups's access already exist in the given ACL, in the returned ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 *
 * - Access Modes granted indirectly to Groups through other ACL rules, e.g., public or Agent-specific permissions.
 * - Access Modes granted to Groups for the child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param group The Group to grant specific Access Modes.
 * @param access The Access Modes to grant to the Group for the Resource.
 * @returns A new resource ACL initialised with the given `aclDataset` and `access` for the `group`.
 * @since 1.4.0
 */
export declare function setGroupResourceAccess(aclDataset: AclDataset, group: UrlString, access: Access): AclDataset & WithChangeLog;
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the default ACL (Access Control List) to set a Group's Access Modes for the Container's children.
 * Specifically, the function returns a new default ACL initialised with the given ACL and
 * new rules for the Group's access.
 *
 * If rules already exist for the Group in the given ACL, in the returned ACL, they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g., public or Agent-specific permissions.
 * - Access Modes granted to the Group for the Container Resource itself.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param group The Group to grant specific Access Modes.
 * @param access The Access Modes to grant to the Group.
 * @returns A new default ACL initialised with the given `aclDataset` and `access` for the `group`.
 * @since 1.4.0
 */
export declare function setGroupDefaultAccess(aclDataset: AclDataset, group: UrlString, access: Access): AclDataset & WithChangeLog;
