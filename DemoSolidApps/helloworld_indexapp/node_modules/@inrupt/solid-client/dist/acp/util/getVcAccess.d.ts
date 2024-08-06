import type { WithAccessibleAcr } from "../acp";
import type { AccessModes } from "../../interfaces";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the maximum access modes that are allowed for a VC holder for a given resource.
 * If the resource owner issued an Access Grant for the resource, the agent that
 * has been granted access will have at most the permissions returned by this function.
 * The Access Grant may be more restrictive.
 *
 * Note that only the modes set using [[setVcAccess]] will be returned by this function.
 * Additional access may have been set if the ACR has been manipulated not using this
 * library, which is currently out of scope.
 *
 * @param resourceWithAcr The resource for which the VC access modes are looked up.
 * @returns The access modes available to a VC holder.
 * @since 1.17.0
 */
export declare function getVcAccess(resourceWithAcr: WithAccessibleAcr): AccessModes;
