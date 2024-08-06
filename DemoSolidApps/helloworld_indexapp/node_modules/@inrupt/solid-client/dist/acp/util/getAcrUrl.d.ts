import type { UrlString, WithServerResourceInfo } from "../../interfaces";
import type { DefaultOptions } from "../type/DefaultOptions";
/**
 * Retrieve the URL of an Access Control Resource as per the ACP Draft
 * specification.
 *
 * @param resource The Resource for which to retrieve the URL of the Access
 * Control Resource if it is accessible.
 * @returns The URL of the ACR or null.
 */
export declare function getAcrUrl(resource: WithServerResourceInfo, options?: DefaultOptions): Promise<UrlString | null>;
