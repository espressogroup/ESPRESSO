import type { AccessModes, ThingPersisted } from "../../interfaces";
import type { ModeType } from "./getModes";
/** @hidden */
export declare function setModes<T extends ThingPersisted>(policy: T, modes: AccessModes, type: ModeType): T;
