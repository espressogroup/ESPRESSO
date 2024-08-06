import { rdfJsDataset } from './rdf.internal.mjs';
import { getChainBlankNodes, addRdfJsQuadToDataset, toRdfJsQuads } from './rdfjs.internal.mjs';

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * Convert an RDF/JS Dataset into a [[SolidDataset]]
 *
 * Parse an RDF/JS
 * {@link https://rdf.js.org/dataset-spec/#datasetcore-interface DatasetCore},
 * into a [[SolidDataset]]. Note that, when saving the returned SolidDataset to
 * a Solid Pod, only Quads in the Default Graph will be stored.
 *
 * @param rdfJsDataset The source RDF/JS Dataset.
 * @returns A [[SolidDataset]] containing the same data as the given RDF/JS Dataset.
 * @since 1.9.0
 */
function fromRdfJsDataset(rdfJsDataset) {
    const dataset = {
        graphs: { default: {} },
        type: "Dataset",
    };
    const quads = Array.from(rdfJsDataset);
    const chainBlankNodes = getChainBlankNodes(quads);
    // Quads with chain Blank Nodes as their Subject will be parsed when those
    // Blank Nodes are referred to in an Object. See `addRdfJsQuadToObjects`.
    const quadsWithoutChainBlankNodeSubjects = quads.filter((quad) => chainBlankNodes.every((chainBlankNode) => !chainBlankNode.equals(quad.subject)));
    return quadsWithoutChainBlankNodeSubjects.reduce((datasetAcc, quad) => addRdfJsQuadToDataset(datasetAcc, quad, {
        otherQuads: quads,
        chainBlankNodes,
    }), dataset);
}
/**
 * Convert a [[SolidDataset]] into an RDF/JS Dataset
 *
 * Export a [[SolidDataset]] into an RDF/JS
 * {@link https://rdf.js.org/dataset-spec/#datasetcore-interface DatasetCore}.
 *
 * @param set A [[SolidDataset]] to export into an RDF/JS Dataset.
 * @param options Optional parameter that allows you to pass in your own RDF/JS DataFactory or DatasetCoreFactory.
 * @returns An RDF/JS Dataset containing the data from the given SolidDataset.
 * @since 1.9.0
 */
function toRdfJsDataset(set, options = {}) {
    var _a, _b;
    const datasetFactory = (_b = (_a = options.datasetFactory) === null || _a === void 0 ? void 0 : _a.dataset) !== null && _b !== void 0 ? _b : rdfJsDataset;
    return datasetFactory(toRdfJsQuads(set, options));
}

export { fromRdfJsDataset, toRdfJsDataset };
