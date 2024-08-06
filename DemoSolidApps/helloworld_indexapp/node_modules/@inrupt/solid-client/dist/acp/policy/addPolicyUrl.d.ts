import type { Url, UrlString } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Add a policy applying to the given resource.
 *
 * @param resourceWithAcr The resource for which to add the URL of a policy
 * applying to it.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
export declare function addPolicyUrl<T extends WithAccessibleAcr>(resourceWithAcr: T, policyUrl: Url | UrlString): T;
