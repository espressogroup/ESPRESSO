import type { UrlString } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URL of all member access controls linked to the given resource's ACR.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs of access
 * controls inherited by its children.
 * @returns Access Control URL array
 * @since 1.6.0
 */
export declare function getMemberAccessControlUrlAll(resourceWithAcr: WithAccessibleAcr): UrlString[];
