import type { AccessModes, WebId } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * Set access for a given Agent.
 *
 * @param resourceWithAcr URL of the Resource you want to set the access for.
 * @param webId WebID of the Agent you want to set the access for.
 * @param access Access Modes you want to set for the agent.
 * @since 1.16.0
 */
export declare function setAgentAccess<T extends WithAccessibleAcr>(resourceWithAcr: T, webId: WebId, access: Partial<AccessModes>): Promise<T>;
