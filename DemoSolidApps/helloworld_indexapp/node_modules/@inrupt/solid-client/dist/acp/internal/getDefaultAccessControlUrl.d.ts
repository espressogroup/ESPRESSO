import type { WithAccessibleAcr } from "../acp";
/** @hidden */
export type DefaultAccessControlName = typeof DEFAULT_ACCESS_CONTROL | typeof DEFAULT_ACR_ACCESS_CONTROL | typeof DEFAULT_MEMBER_ACCESS_CONTROL | typeof DEFAULT_MEMBER_ACR_ACCESS_CONTROL;
/** @hidden */
export declare const DEFAULT_ACCESS_CONTROL = "defaultAccessControl";
/** @hidden */
export declare const DEFAULT_ACR_ACCESS_CONTROL = "defaultAcrAccessControl";
/** @hidden */
export declare const DEFAULT_MEMBER_ACCESS_CONTROL = "defaultMemberAccessControl";
/** @hidden */
export declare const DEFAULT_MEMBER_ACR_ACCESS_CONTROL = "defaultMemberAcrAccessControl";
/** @hidden */
export declare function getDefaultAccessControlUrl(resource: WithAccessibleAcr, name: DefaultAccessControlName): string;
