import type { Url, UrlString } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Remove a policy applying to the ACRs of the given resource's children.
 *
 * @param resourceWithAcr The resource for which to remove the URL of a policy
 * applying to its children's access control resources.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
export declare function removeMemberAcrPolicyUrl<T extends WithAccessibleAcr>(resourceWithAcr: T, policyUrl: Url | UrlString): T;
