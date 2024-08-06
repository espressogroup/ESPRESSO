import type { WithServerResourceInfo } from "../../interfaces";
import type { DefaultOptions } from "../type/DefaultOptions";
import type { WithAccessibleAcr } from "../acp";
/**
 * Retrieve the Access Control Resource of a Resource as per the ACP Draft
 * specification.
 *
 * @param resource The Resource for which to retrieve the URL of the Access
 * Control Resource if it is accessible.
 * @param options Default Options such as a fetch function.
 * @returns The URL of the ACR or null.
 */
export declare function getResourceAcr<T extends WithServerResourceInfo>(resource: T, options?: DefaultOptions): Promise<(T & WithAccessibleAcr) | null>;
