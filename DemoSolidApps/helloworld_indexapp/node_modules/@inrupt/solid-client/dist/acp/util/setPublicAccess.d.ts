import type { AccessModes } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * Set access for the public.
 *
 * @param resourceWithAcr URL of the Resource you want to read the access for.
 * @param access Access Modes you want to set for the agent.
 * @since 1.16.0
 */
export declare function setPublicAccess<T extends WithAccessibleAcr>(resourceWithAcr: T, access: Partial<AccessModes>): Promise<T>;
