import type { AccessModes, WebId } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * Get an overview of what access is defined for a given Agent.
 *
 * @param resourceWithAcr URL of the Resource you want to read the access for.
 * @param webId WebID of the Agent you want to get the access for.
 * @since 1.16.0
 */
export declare function getAgentAccess<T extends WithAccessibleAcr>(resourceWithAcr: T, webId: WebId): Promise<AccessModes>;
