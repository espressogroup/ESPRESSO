import type { UrlString } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URLs of policies applying to the ACRs of the given resource's
 * children.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs of policies
 * applying to its children's access control resources.
 * @returns Policy URL array.
 * @since 1.16.1
 */
export declare function getMemberAcrPolicyUrlAll<T extends WithAccessibleAcr>(resourceWithAcr: T): UrlString[];
