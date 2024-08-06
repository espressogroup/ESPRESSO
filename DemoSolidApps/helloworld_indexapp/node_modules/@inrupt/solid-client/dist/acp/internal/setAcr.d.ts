import type { WithAccessibleAcr } from "../acp";
import type { AccessControlResource } from "../type/AccessControlResource";
/**
 * @hidden
 *
 * Internal function that attaches an ACR to a Resource. Prefer using this than
 * setting the internal values manually (easier to refactor when changing the internals).
 */
export declare function setAcr<T extends WithAccessibleAcr>(resource: T, acr: AccessControlResource): T;
