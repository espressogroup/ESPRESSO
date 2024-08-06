import type { AccessModes, UrlString, WebId } from "../interfaces";
import type { DefaultOptions } from "../acp/type/DefaultOptions";
/**
 * Get an overview of what access is defined for a given Agent.
 *
 * This function works with Solid Pods that implement either the Web Access
 * Control spec or the Access Control Policies proposal, with some caveats:
 *
 * - If access to the given Resource has been set using anything other than the
 *   functions in this module, it is possible that it has been set in a way that
 *   prevents this function from reliably reading access.
 * - It will only return access specified explicitly for the given Agent within
 *   the ACL linked to the resource. If additional restrictions or external
 *   resources are used, those will not be reflected in the return value of this
 *   function.
 * - It will only return access specified explicitly for the given Resource.
 *   In other words, if the Resource is a Container, the returned Access may not
 *   apply to contained Resources.
 * - If the current user does not have permission to view access for the given
 *   Resource, this function will resolve to `null`.
 *
 * @param resourceUrl URL of the Resource you want to read the access for.
 * @param webId WebID of the Agent you want to get the access for.
 * @param options Default Options such as a fetch function.
 * @since 1.19.0
 */
export declare function getAgentAccess(resourceUrl: UrlString, webId: WebId, options?: DefaultOptions): Promise<AccessModes | null>;
