import type { WithServerResourceInfo } from "../interfaces";
/**
 * @param linkedAccessResource A Resource exposed via the Link header of another Resource with rel="acl".
 * @returns Whether that Resource is an ACP ACR or not (in which case it's likely a WAC ACL).
 */
export declare function isAcr(linkedAccessResource: WithServerResourceInfo): boolean;
