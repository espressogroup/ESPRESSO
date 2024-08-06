import type { WithAccessibleAcr } from "../acp";
import type { DefaultAccessControlName } from "./getDefaultAccessControlUrl";
/** @hidden */
export declare function setDefaultAccessControlThingIfNotExist<T extends WithAccessibleAcr>(resource: T, name: DefaultAccessControlName): T;
