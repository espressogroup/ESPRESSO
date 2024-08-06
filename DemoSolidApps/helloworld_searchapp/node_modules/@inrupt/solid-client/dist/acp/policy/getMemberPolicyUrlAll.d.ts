import type { UrlString } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URLs of policies applying to the given resource's children.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs policies
 * applying to its children.
 * @returns Policy URL array.
 * @since 1.16.1
 */
export declare function getMemberPolicyUrlAll<T extends WithAccessibleAcr>(resourceWithAcr: T): UrlString[];
