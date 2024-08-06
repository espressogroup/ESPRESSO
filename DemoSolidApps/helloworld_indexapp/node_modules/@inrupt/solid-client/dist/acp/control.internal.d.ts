import type { ThingPersisted, Url, UrlString } from "../interfaces";
import { createThing, getThing, getThingAll } from "../thing/thing";
import type { WithAccessibleAcr, WithAcp } from "./acp";
import type { AccessControlResource, Control } from "./control";
/** @hidden */
export declare function internal_getAcr(resource: WithAccessibleAcr): AccessControlResource;
/** @hidden */
export declare function internal_setAcr<ResourceExt extends WithAcp>(resource: ResourceExt, acr: AccessControlResource): ResourceExt & WithAccessibleAcr;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new [[Control]].
 * @hidden Developers don't need to care about initialising Controls - they can just add Policies directly.
 * @deprecated
 */
export declare function internal_createControl(options?: Parameters<typeof createThing>[0]): Control;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Find an [[Control]] with a given URL in a given Resource with an Access Control Resource.
 *
 * @returns The requested Access Control, or `null` if it could not be found.
 * @hidden Developers don't need to care about initialising Controls - they can just add Policies directly.
 * @deprecated
 */
export declare function internal_getControl(withAccessControlResource: WithAccessibleAcr, url: Parameters<typeof getThing>[1], options?: Parameters<typeof getThing>[2]): Control | null;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[Control]]s in the Access Control Resource of a given Resource.
 * @hidden Developers don't need to care about initialising Controls - they can just add Policies directly.
 * @deprecated
 */
export declare function internal_getControlAll(withAccessControlResource: WithAccessibleAcr, options?: Parameters<typeof getThingAll>[1]): Control[];
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert an [[Control]] into the [[AccessControlResource]] of a Resource, replacing previous
 * instances of that Access Control.
 *
 * @param withAccessControlResource A Resource with the Access Control Resource into which to insert an Access Control.
 * @param control The Control to insert into the Access Control Resource.
 * @returns The given Resource with a new Access Control Resource equal to the original Access Control Resource, but with the given Access Control.
 * @hidden Developers don't need to care about initialising Controls - they can just add Policies directly.
 * @deprecated
 */
export declare function internal_setControl<ResourceExt extends WithAccessibleAcr>(withAccessControlResource: ResourceExt, control: Control): ResourceExt;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a [[Policy]] to an [[Control]] such that that Policy applies to the Resource to which
 * the [[Control]] is linked.
 *
 * @param accessControl The [[Control]] to which the Policy should be added.
 * @param policyUrl URL of the Policy that should apply to the Resource to which the [[Control]] is linked.
 * @returns A new [[Control]] equal to the given [[Control]], but with the given policy added to it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_addPolicyUrl(accessControl: Control, policyUrl: Url | UrlString | ThingPersisted): Control;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all Policies that apply to the Resource to which the given [[Control]] is linked, and
 * which can be removed by anyone with Write access to the Access Control Resource that contains the
 * [[Control]].
 *
 * @param accessControl The [[Control]] of which to get the Policies.
 * @returns The Policies that are listed in this [[Control]] as applying to the Resource it is linked to, and as removable by anyone with Write access to the Access Control Resource.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_getPolicyUrlAll(accessControl: Control): UrlString[];
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove a given Policy that applies to the Resource to which the given [[Control]] is linked,
 * and which can be removed by anyone with Write access to the Access Control Resource that contains
 * the Access Control.
 *
 * @param accessControl The [[Control]] of which to remove the Policies.
 * @param policyUrl URL of the Policy that should no longer apply to the Resource to which the [[Control]] is linked.
 * @returns A new [[Control]] equal to the given [[Control]], but with the given Policy removed from it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_removePolicyUrl(accessControl: Control, policyUrl: Url | UrlString | ThingPersisted): Control;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove all Policies that apply to the Resource to which the given [[Control]] is linked, and
 * which can be removed by anyone with Write access to the Access Control Resource that contains the
 * [[Control]].
 *
 * @param accessControl The [[Control]] of which to remove the Policies.
 * @returns A new [[Control]] equal to the given [[Control]], but with all Policies removed from it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_removePolicyUrlAll(accessControl: Control): Control;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a [[Policy]] to an [[Control]] such that that Policy applies to the children of the
 * Resource to which the [[Control]] is linked.
 *
 * @param accessControl The [[Control]] to which the Policy should be added.
 * @param policyUrl URL of the Policy that should apply to the children of the Resource to which the [[Control]] is linked.
 * @returns A new [[Control]] equal to the given [[Control]], but with the given policy added to it as a Member Policy.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_addMemberPolicyUrl(accessControl: Control, policyUrl: Url | UrlString | ThingPersisted): Control;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all Policies that apply to the children of the Resource to which the given [[Control]] is
 * linked, and which can be removed by anyone with Write access to the Access Control Resource that
 * contains the [[Control]].
 *
 * @param accessControl The [[Control]] of which to get the Policies.
 * @returns The Policies that are listed in this [[Control]] as applying to the children of the Resource it is linked to, and as removable by anyone with Write access to the Access Control Resource.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_getMemberPolicyUrlAll(accessControl: Control): UrlString[];
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove a given Policy that applies to the children of the Resource to which the given Access
 * Control is linked, and which can be removed by anyone with Write access to the Access Control
 * Resource that contains the Access Control.
 *
 * @param accessControl The [[Control]] of which to remove the Member Policy.
 * @param policyUrl URL of the Member Policy that should no longer apply to the Resource to which the [[Control]] is linked.
 * @returns A new [[Control]] equal to the given [[Control]], but with the given Member Policy removed from it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_removeMemberPolicyUrl(accessControl: Control, policyUrl: Url | UrlString | ThingPersisted): Control;
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove all Policies that apply to the children of the Resource to which the given Access Control
 * is linked, and which can be removed by anyone with Write access to the Access Control Resource
 * that contains the Access Control.
 *
 * @param accessControl The [[Control]] of which to remove the Member Policies.
 * @returns A new [[Control]] equal to the given [[Control]], but with all Member Policies removed from it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
export declare function internal_removeMemberPolicyUrlAll(accessControl: Control): Control;
export declare function internal_getInitialisedControl(resourceWithAcr: WithAccessibleAcr): Control;
