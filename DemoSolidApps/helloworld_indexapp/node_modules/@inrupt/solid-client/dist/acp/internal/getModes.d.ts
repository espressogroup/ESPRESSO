import type { AccessModes, ThingPersisted } from "../../interfaces";
import type { ACP } from "../constants";
/** @hidden */
export type ModeType = typeof ACP.allow | typeof ACP.deny;
/** @hidden */
export declare function getModes<T extends ThingPersisted>(policy: T, type: ModeType): AccessModes;
