import type { UrlString } from "../../interfaces";
import type { WithAccessibleAcr } from "../acp";
import type { ACP } from "../constants";
/** @hidden */
type PolicyType = typeof ACP.apply | typeof ACP.access;
/** @hidden */
export declare function getPolicyUrls(resource: WithAccessibleAcr, accessControlUrls: UrlString[], type: PolicyType): string[];
export {};
