import type * as RdfJs from "@rdfjs/types";
import type { IriString } from "./interfaces";
import type { XmlSchemaTypeIri } from "./datatypes";
export declare const rdfJsDataset: RdfJs.DatasetCoreFactory<RdfJs.Quad>["dataset"];
export declare const localNodeSkolemPrefix: "https://inrupt.com/.well-known/sdk-local-node/";
export type LocalNodeIri = `${typeof localNodeSkolemPrefix}${string}`;
export type LocalNodeName = string;
type DataTypeIriString = XmlSchemaTypeIri | IriString;
type LocaleString = string;
export type BlankNodeId = `_:${string}`;
export type Objects = Readonly<Partial<{
    literals: Readonly<Record<DataTypeIriString, readonly string[]>>;
    langStrings: Readonly<Record<LocaleString, readonly string[]>>;
    namedNodes: ReadonlyArray<LocalNodeIri | IriString>;
    blankNodes: ReadonlyArray<Predicates | BlankNodeId>;
}>>;
export type Predicates = Readonly<Record<IriString, Objects>>;
export type Subject = Readonly<{
    type: "Subject";
    url: BlankNodeId | LocalNodeIri | IriString;
    predicates: Predicates;
}>;
export type Graph = Readonly<Record<BlankNodeId | LocalNodeIri | IriString, Subject>>;
export type ImmutableDataset = Readonly<{
    type: "Dataset";
    graphs: Readonly<Record<IriString, Graph> & {
        default: Graph;
    }>;
}>;
/**
 * Runtime freezing might be too much overhead;
 * if so, this function allows us to replace it by a function
 * that merely marks its input as Readonly<> for static analysis.
 */
export declare const freeze: {
    <T extends Function>(f: T): T;
    <T_1 extends {
        [idx: string]: object | U | null | undefined;
    }, U extends string | number | bigint | boolean | symbol>(o: T_1): Readonly<T_1>;
    <T_2>(o: T_2): Readonly<T_2>;
};
export declare function isLocalNodeIri(iri: LocalNodeIri | IriString): iri is LocalNodeIri;
export declare function getLocalNodeName(localNodeIri: LocalNodeIri): string;
export declare function getLocalNodeIri(localNodeName: string): LocalNodeIri;
export declare function isBlankNodeId<T>(value: T | BlankNodeId): value is BlankNodeId;
export declare function getBlankNodeValue(blankNodeId: BlankNodeId): string;
export declare function getBlankNodeId(blankNode: RdfJs.BlankNode): BlankNodeId;
export {};
