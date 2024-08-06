import { DataFactory } from "n3";
import type * as RdfJs from "@rdfjs/types";
import type { ImmutableDataset, Predicates } from "./rdf.internal";
import type { ToRdfJsOptions } from "./rdfjs";
export { DataFactory };
type QuadParseOptions = Partial<{
    otherQuads: RdfJs.Quad[];
    chainBlankNodes: RdfJs.BlankNode[];
}>;
export declare function addRdfJsQuadToDataset(dataset: ImmutableDataset, quad: RdfJs.Quad, quadParseOptions?: QuadParseOptions): ImmutableDataset;
/**
 * Given an array of Quads, returns all Blank Nodes that are used in a single chain of Nodes.
 *
 * This allows you to obtain which Blank Nodes are involved in e.g. RDF lists.
 * This is useful because those can be represented as nested data that will have
 * a deterministic structure, whereas a representation of Blank Nodes that
 * create a cycle or are re-used will need ad-hoc, non-deterministic identifiers
 * to allow for representation without inifinite nesting.
 */
export declare function getChainBlankNodes(quads: RdfJs.Quad[]): RdfJs.BlankNode[];
export declare function toRdfJsQuads(dataset: ImmutableDataset, options?: ToRdfJsOptions): RdfJs.Quad[];
export declare function subjectToRdfJsQuads(predicates: Predicates, subjectNode: RdfJs.NamedNode | RdfJs.BlankNode, graphNode: RdfJs.NamedNode | RdfJs.DefaultGraph, options?: ToRdfJsOptions): RdfJs.Quad[];
