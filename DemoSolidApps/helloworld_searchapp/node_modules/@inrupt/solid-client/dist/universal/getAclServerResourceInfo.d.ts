import type { WithServerResourceInfo } from "../interfaces";
import type { DefaultOptions } from "../acp/type/DefaultOptions";
/**
 * Retrieve the Server Resource Info of Resource expressing access control over
 * another resource it is linked to. It applies in both ACP and WAC contexts:
 * the Access Control Resource is discovered consistently using a Link header
 * with `rel=acl`.
 *
 * @param {WithServerResourceInfo} resource The Resource for which ACL we want
 * to retrieve the Server Resource Info.
 * @param {DefaultOptions} options
 * @returns The Server Resource Info if available, null otherwise.
 * @since 1.19.0
 */
export declare function getAclServerResourceInfo(resource: WithServerResourceInfo, options?: DefaultOptions): Promise<WithServerResourceInfo | null>;
