import type { ThingPersisted } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Insert the given [[ResourcePolicy]] into the given Resource's Acccess Control
 * Resource, replacing previous instances of that Policy.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @param policy The Policy to insert into the Resource's Access Control Resource.
 * @returns A new Resource equal to the given Resource, but with the given Policy in its Access Control Resource.
 * @since 1.18.0
 */
export declare function setResourcePolicy<T extends WithAccessibleAcr>(resourceWithAcr: T, policy: ThingPersisted): T;
