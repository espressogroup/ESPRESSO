import type { Quad, Quad_Object } from "@rdfjs/types";
import type { Thing, SolidDataset, WithChangeLog } from "../interfaces";
/** @hidden For internal use only. */
export declare function internal_getReadableValue(value: Quad_Object): string;
/**
 * @hidden
 */
export declare function internal_throwIfNotThing(thing: Thing): void;
/**
 * @hidden
 * @param solidDataset
 */
export declare function internal_addAdditionsToChangeLog<Dataset extends SolidDataset>(solidDataset: Dataset, additions: Quad[]): Dataset & WithChangeLog;
/**
 * @hidden
 * @param solidDataset
 */
export declare function internal_addDeletionsToChangeLog<Dataset extends SolidDataset>(solidDataset: Dataset, deletions: Quad[]): Dataset & WithChangeLog;
/**
 * Enforces the presence of a Changelog for a given dataset. If a changelog is
 * already present, it is unchanged. Otherwise, an empty changelog is created.
 * @hidden
 * @param solidDataset
 */
export declare function internal_withChangeLog<Dataset extends SolidDataset>(solidDataset: Dataset): Dataset & WithChangeLog;
