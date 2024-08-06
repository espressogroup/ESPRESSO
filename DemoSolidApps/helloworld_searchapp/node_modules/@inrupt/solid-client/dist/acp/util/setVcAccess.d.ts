import type { WithAccessibleAcr } from "../acp";
import type { AccessModes } from "../../interfaces";
export declare const DEFAULT_VC_POLICY_NAME = "defaultVcPolicy";
export declare const DEFAULT_VC_MATCHER_NAME = "defaultVcMatcher";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Set the maximum access modes that are allowed for a VC holder for a given resource.
 * If the resource owner issued an Access Grant for the resource, the agent that
 * has been granted access will have at most the permissions set by this function.
 * The Access Grant may be more restrictive.
 *
 * Note that additional access may have been set if the ACR has been manipulated
 * not using this library, which is currently out of scope. In this case, the access
 * set by this function may not apply.
 *
 * @param resourceWithAcr The resource for which the access modes are being set for VC holders.
 * @param access The access modes to set. Setting a mode to `true` will enable it, to `false`
 * will disable it, and to `undefined` will leave it unchanged compared to what was previously
 * set.
 * @param options An option object to customize the function behavior:
 *  - inherit: if set to `true`, the access set to the target resource cascades
 *    to its contained resources.
 * @returns A copy of the resource and its attached ACR, updated to the new access modes.
 * @since 1.17.0
 */
export declare function setVcAccess(resourceWithAcr: WithAccessibleAcr, access: Partial<AccessModes>, options?: {
    inherit: boolean;
}): WithAccessibleAcr;
