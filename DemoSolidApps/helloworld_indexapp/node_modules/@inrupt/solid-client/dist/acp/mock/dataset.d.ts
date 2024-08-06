import type { SolidDataset } from "../../interfaces";
/** @hidden */
export type SubjectPredicateObjectTuple = [string, [string, string[]][]];
/** @hidden */
export declare function addSubject(dataset: SolidDataset, subject: SubjectPredicateObjectTuple): SolidDataset;
/** @hidden */
export declare function addSubjects(dataset: SolidDataset, subjects: SubjectPredicateObjectTuple[]): SolidDataset;
/** @hidden */
export declare function createDatasetFromSubjects(data: SubjectPredicateObjectTuple[]): SolidDataset;
