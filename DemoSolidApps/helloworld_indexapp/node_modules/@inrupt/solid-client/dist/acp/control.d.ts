import { acp } from "../constants";
import type { SolidDataset, Thing, ThingPersisted, Url, UrlString, WithResourceInfo, WithServerResourceInfo } from "../interfaces";
import type { WithAccessibleAcr } from "./acp";
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a Resource, check whether it is governed by Access Policies.
 * (Specifically, a Resource that is governed by Access Policies will refer to exactly one Access
 * Control Resource, and expose that to users who are allowed to see or modify access to the given
 * Resource.)
 *
 * @param resource Resource which may or may not be governed by Access Policies.
 * @returns True if the Resource refers to an Access Control Resource and is hence governed by Access Policies, or false if it does not.
 * @since 1.6.0
 */
export declare function hasLinkedAcr<Resource extends WithServerResourceInfo>(resource: Resource): resource is WithLinkedAcr<Resource>;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * An Access Control Resource, containing [[Control]]s specifying which [[Policy]]'s
 * apply to the Resource this Access Control Resource is linked to.
 * @since 1.6.0
 */
export type AccessControlResource = SolidDataset & WithResourceInfo & {
    accessTo: UrlString;
};
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * A Control, usually contained in an [[AccessControlResource]]. It describes which
 * [[Policy]]'s apply to a Resource.
 * @since 1.6.0
 */
export type Control = Thing;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * If this type applies to a Resource, it is governed by an Access Control Resource,
 * and thus not the Web Access Control spec.
 * It does not indicate that this Access Control Resource will also be accessible to the current
 * user.
 * @since 1.6.0
 */
export type WithLinkedAcr<Resource extends WithServerResourceInfo = WithServerResourceInfo> = Resource & {
    internal_resourceInfo: {
        linkedResources: {
            [acp.accessControl]: [string];
        };
    };
};
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a [[Policy]] to an Access Control Resource such that that [[Policy]] applies to the Access
 * Control Resource itself, rather than the Resource it governs.
 *
 * @param resourceWithAcr The Resource with an Access Control Resource to which the ACR Policy should be added.
 * @param policyUrl URL of the Policy that should apply to the given Access Control Resource.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given ACR Policy added to it.
 * @since 1.6.0
 */
export declare function addAcrPolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString | ThingPersisted): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a [[Policy]] to a Resource's Access Control Resource such that that
 * Policy applies to the Access Control Resources of child Resources.
 *
 * @param resourceWithAcr The Resource with an Access Control Resource to which the ACR Policy should be added.
 * @param policyUrl URL of the Policy that should apply to the given Access Control Resources of children of the Resource.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given ACR Policy added to it.
 * @since 1.6.0
 */
export declare function addMemberAcrPolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString | ThingPersisted): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to an Access Control Resource itself, rather than
 * to the Resource it governs.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to it.
 * @returns URLs of the Policies that govern access to the given Access Control Resource.
 * @since 1.6.0
 */
export declare function getAcrPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): UrlString[];
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to the Access Control Resources of the Resource's
 * children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to its children.
 * @returns URLs of the Policies that govern access to the Access Control Resources of the given Resource's children.
 * @since 1.6.0
 */
export declare function getMemberAcrPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): UrlString[];
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop the URL of a given [[Policy]] from applying to an Access Control Resource itself.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource to which the given URL of a Policy should no longer apply.
 * @param policyUrl The URL of the Policy that should no longer apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given ACR Policy removed from it.
 * @since 1.6.0
 */
export declare function removeAcrPolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString | ThingPersisted): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop the URL of a given [[Policy]] from applying to the Access Control Resources of the
 * Resource's children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource to whose children's ACRs the given URL of a Policy should no longer apply.
 * @param policyUrl The URL of the Policy that should no longer apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given member ACR Policy removed from it.
 * @since 1.6.0
 */
export declare function removeMemberAcrPolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString | ThingPersisted): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to an Access Control Resource itself.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource to which no more Policies should apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to it.
 * @since 1.6.0
 */
export declare function removeAcrPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to the Access Control Resources of the Resource's
 * children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource that should no longer apply Policies to its children's ACRs.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to its children's ACRs.
 * @since 1.6.0
 */
export declare function removeMemberAcrPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a [[Policy]] to an Access Control Resource such that that [[Policy]] applies to that Resource.
 *
 * @param resourceWithAcr The Resource to which the ACR Policy should be added.
 * @param policyUrl URL of the Policy that should apply to the given Resource.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given Policy added to it.
 * @since 1.6.0
 */
export declare function addPolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a [[Policy]] to a Resource's Access Control Resource such that that
 * Policy applies to that Resource's children.
 *
 * @param resourceWithAcr The Resource to whose Access Control Resource the Policy should be added.
 * @param policyUrl URL of the Policy that should apply to the given Resource's children.
 * @returns A new Resource equal to the given Resource, but with the given Member Policy added to its Access Control Resource.
 * @since 1.6.0
 */
export declare function addMemberPolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to a Resource.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to it.
 * @returns URLs of the Policies that govern access to the given Resource.
 * @since 1.6.0
 */
export declare function getPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): UrlString[];
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to a Resource's children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to its children.
 * @returns URLs of the Policies that govern access to the given Resource's children.
 * @since 1.6.0
 */
export declare function getMemberPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): UrlString[];
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop the URL of a given [[Policy]] from applying to a Resource.
 *
 * @param resourceWithAcr The Resource, with its Access Control Resource, to which the given URL of a Policy should no longer apply.
 * @param policyUrl The URL of the Policy that should no longer apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given Policy removed from it.
 * @since 1.6.0
 */
export declare function removePolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString | ThingPersisted): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop the URL of a given [[Policy]] from applying to the Resource's children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource to whose children the given URL of a Policy should no longer apply.
 * @param policyUrl The URL of the Policy that should no longer apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given Member Policy removed from it.
 * @since 1.6.0
 */
export declare function removeMemberPolicyUrl<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt, policyUrl: Url | UrlString | ThingPersisted): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to a Resource.
 *
 * @param resourceWithAcr The Resource, with its Access Control Resource, to which no more Policies should apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to the Resource.
 * @since 1.6.0
 */
export declare function removePolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to the Resource's children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource that should no longer apply Policies to its children.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to the Resource's children.
 * @since 1.6.0
 */
export declare function removeMemberPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(resourceWithAcr: ResourceExt): ResourceExt;
