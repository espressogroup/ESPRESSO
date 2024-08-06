import type { AccessModes, ThingPersisted } from "../../interfaces";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Policies allow or deny access modes over resources and their associated
 * access control resource.
 *
 * @param policy The Policy on which to set the modes to allow.
 * @param modes Modes to allow for this Policy.
 * @since 1.16.1
 */
export declare function setDenyModes<T extends ThingPersisted>(policy: T, modes: AccessModes): T;
