import type { WithAccessibleAcr } from "../acp";
import type { AccessModes } from "../../interfaces";
import type { DefaultAccessControlName } from "./getDefaultAccessControlUrl";
/** @hidden */
export declare function getDefaultAgentMatcherPolicyUrl(resource: WithAccessibleAcr, name: DefaultAccessControlName, mode: keyof AccessModes): string;
