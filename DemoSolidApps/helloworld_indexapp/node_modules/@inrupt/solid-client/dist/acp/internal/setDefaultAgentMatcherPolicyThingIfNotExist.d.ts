import type { WithAccessibleAcr } from "../acp";
import type { AccessModes } from "../../interfaces";
import type { DefaultAccessControlName } from "./getDefaultAccessControlUrl";
/** @hidden */
export declare function setDefaultAgentMatcherPolicyThingIfNotExist<T extends WithAccessibleAcr>(resource: T, name: DefaultAccessControlName, mode: keyof AccessModes): T;
