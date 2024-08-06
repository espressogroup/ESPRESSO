import type { AccessModes } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
/**
 * Get an overview of what access is given to the public.
 *
 * @param resourceWithAcr URL of the Resource you want to read the access for.
 * @since 1.16.0
 */
export declare function getPublicAccess<T extends WithAccessibleAcr>(resourceWithAcr: T): Promise<AccessModes>;
