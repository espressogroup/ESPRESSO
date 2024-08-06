import type { SolidDataset, UrlString, WithResourceInfo } from "../../interfaces";
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 */
export interface AccessControlResource extends SolidDataset, WithResourceInfo {
    accessTo: UrlString;
}
