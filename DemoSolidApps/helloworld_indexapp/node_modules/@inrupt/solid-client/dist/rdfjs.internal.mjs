import { DataFactory } from 'n3';
export { DataFactory } from 'n3';
import { freeze, getBlankNodeId, isBlankNodeId, getBlankNodeValue } from './rdf.internal.mjs';
import { xmlSchemaTypes } from './datatypes.mjs';

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
function addRdfJsQuadToDataset(dataset, quad, quadParseOptions = {}) {
    var _a;
    const supportedGraphTypes = [
        "NamedNode",
        "DefaultGraph",
    ];
    if (!supportedGraphTypes.includes(quad.graph.termType)) {
        throw new Error(`Cannot parse Quads with nodes of type [${quad.graph.termType}] as their Graph node.`);
    }
    const graphId = quad.graph.termType === "DefaultGraph" ? "default" : quad.graph.value;
    const graph = (_a = dataset.graphs[graphId]) !== null && _a !== void 0 ? _a : {};
    return freeze({
        ...dataset,
        graphs: freeze({
            ...dataset.graphs,
            [graphId]: addRdfJsQuadToGraph(graph, quad, quadParseOptions),
        }),
    });
}
function addRdfJsQuadToGraph(graph, quad, quadParseOptions) {
    var _a;
    const supportedSubjectTypes = [
        "NamedNode",
        "BlankNode",
    ];
    if (!supportedSubjectTypes.includes(quad.subject.termType)) {
        throw new Error(`Cannot parse Quads with nodes of type [${quad.subject.termType}] as their Subject node.`);
    }
    const subjectIri = quad.subject.termType === "BlankNode"
        ? `_:${quad.subject.value}`
        : quad.subject.value;
    const subject = (_a = graph[subjectIri]) !== null && _a !== void 0 ? _a : {
        type: "Subject",
        url: subjectIri,
        predicates: {},
    };
    return freeze({
        ...graph,
        [subjectIri]: addRdfJsQuadToSubject(subject, quad, quadParseOptions),
    });
}
function addRdfJsQuadToSubject(subject, quad, quadParseOptions) {
    return freeze({
        ...subject,
        predicates: addRdfJsQuadToPredicates(subject.predicates, quad, quadParseOptions),
    });
}
function addRdfJsQuadToPredicates(predicates, quad, quadParseOptions) {
    var _a;
    const supportedPredicateTypes = [
        "NamedNode",
    ];
    if (!supportedPredicateTypes.includes(quad.predicate.termType)) {
        throw new Error(`Cannot parse Quads with nodes of type [${quad.predicate.termType}] as their Predicate node.`);
    }
    const predicateIri = quad.predicate.value;
    const objects = (_a = predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
    return freeze({
        ...predicates,
        [predicateIri]: addRdfJsQuadToObjects(objects, quad, quadParseOptions),
    });
}
function addRdfJsQuadToObjects(objects, quad, quadParseOptions) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (quad.object.termType === "NamedNode") {
        const namedNodes = freeze([
            ...((_a = objects.namedNodes) !== null && _a !== void 0 ? _a : []),
            quad.object.value,
        ]);
        return freeze({
            ...objects,
            namedNodes,
        });
    }
    if (quad.object.termType === "Literal") {
        if (quad.object.datatype.value === xmlSchemaTypes.langString) {
            const locale = quad.object.language.toLowerCase();
            const thisLocaleStrings = freeze([
                ...((_c = (_b = objects.langStrings) === null || _b === void 0 ? void 0 : _b[locale]) !== null && _c !== void 0 ? _c : []),
                quad.object.value,
            ]);
            const langStrings = freeze({
                ...((_d = objects.langStrings) !== null && _d !== void 0 ? _d : {}),
                [locale]: thisLocaleStrings,
            });
            return freeze({
                ...objects,
                langStrings,
            });
        }
        // If the Object is a non-langString Literal
        const thisTypeValues = freeze([
            ...((_f = (_e = objects.literals) === null || _e === void 0 ? void 0 : _e[quad.object.datatype.value]) !== null && _f !== void 0 ? _f : []),
            quad.object.value,
        ]);
        const literals = freeze({
            ...((_g = objects.literals) !== null && _g !== void 0 ? _g : {}),
            [quad.object.datatype.value]: thisTypeValues,
        });
        return freeze({
            ...objects,
            literals,
        });
    }
    if (quad.object.termType === "BlankNode") {
        const blankNodePredicates = getPredicatesForBlankNode(quad.object, quadParseOptions);
        const blankNodes = freeze([
            ...((_h = objects.blankNodes) !== null && _h !== void 0 ? _h : []),
            blankNodePredicates,
        ]);
        return freeze({
            ...objects,
            blankNodes,
        });
    }
    throw new Error(`Objects of type [${quad.object.termType}] are not supported.`);
}
function getPredicatesForBlankNode(node, quadParseOptions) {
    var _a, _b;
    const chainBlankNodes = (_a = quadParseOptions.chainBlankNodes) !== null && _a !== void 0 ? _a : [];
    if (chainBlankNodes.find((chainBlankNode) => chainBlankNode.equals(node)) ===
        undefined) {
        // If this Blank Node is not used to provide nested values for another Subject,
        // just return its identifier.
        // That identifier will also be listed among the Subjects in the Graph.
        return getBlankNodeId(node);
    }
    /* istanbul ignore next: If there are chain nodes, there will always be other Quads, so the `?? []` can't be reached: */
    const quads = (_b = quadParseOptions.otherQuads) !== null && _b !== void 0 ? _b : [];
    const quadsWithNodeAsSubject = quads.filter((quad) => quad.subject.equals(node));
    // First add the Quads with regular Objects
    const predicates = quadsWithNodeAsSubject
        .filter((quad) => !isBlankNode(quad.object))
        .reduce((predicatesAcc, quad) => {
        var _a;
        const supportedPredicateTypes = [
            "NamedNode",
        ];
        if (!supportedPredicateTypes.includes(quad.predicate.termType)) {
            throw new Error(`Cannot parse Quads with nodes of type [${quad.predicate.termType}] as their Predicate node.`);
        }
        const objects = (_a = predicatesAcc[quad.predicate.value]) !== null && _a !== void 0 ? _a : {};
        return freeze({
            ...predicatesAcc,
            [quad.predicate.value]: addRdfJsQuadToObjects(objects, quad, quadParseOptions),
        });
    }, {});
    // And then also add the Quads that have another Blank Node as the Object
    // in addition to the Blank Node `node` as the Subject:
    const blankNodeObjectQuads = quadsWithNodeAsSubject.filter((quad) => isBlankNode(quad.object));
    return blankNodeObjectQuads.reduce((predicatesAcc, quad) => {
        var _a, _b;
        const supportedPredicateTypes = [
            "NamedNode",
        ];
        if (!supportedPredicateTypes.includes(quad.predicate.termType)) {
            throw new Error(`Cannot parse Quads with nodes of type [${quad.predicate.termType}] as their Predicate node.`);
        }
        /* istanbul ignore next: The `?? {}` doesn't get hit; presumably it's initialised above. */
        const objects = (_a = predicatesAcc[quad.predicate.value]) !== null && _a !== void 0 ? _a : {};
        /* istanbul ignore next: The `?? []` doesn't get hit; presumably it's initialised above. */
        const blankNodes = (_b = objects.blankNodes) !== null && _b !== void 0 ? _b : [];
        return freeze({
            ...predicatesAcc,
            // The BlankNode assertions are valid because we filtered on BlankNodes above:
            [quad.predicate.value]: {
                ...objects,
                blankNodes: [
                    ...blankNodes,
                    getPredicatesForBlankNode(quad.object, quadParseOptions),
                ],
            },
        });
    }, predicates);
}
/**
 * Given an array of Quads, returns all Blank Nodes that are used in a single chain of Nodes.
 *
 * This allows you to obtain which Blank Nodes are involved in e.g. RDF lists.
 * This is useful because those can be represented as nested data that will have
 * a deterministic structure, whereas a representation of Blank Nodes that
 * create a cycle or are re-used will need ad-hoc, non-deterministic identifiers
 * to allow for representation without inifinite nesting.
 */
function getChainBlankNodes(quads) {
    // All Blank Nodes that occur in Subject position:
    const blankNodeSubjects = quads
        .map((quad) => quad.subject)
        .filter(isBlankNode);
    // All Blank Nodes that occur in Object position:
    const blankNodeObjects = quads.map((quad) => quad.object).filter(isBlankNode);
    // Makes sure that all given Nodes are the same,
    // which will be used to verify that a set of Quads all have the same Subject:
    function everyNodeTheSame(nodes) {
        // This could potentially be made more performant by mapping every term
        // to their value and using native JS comparisons, assuming every node is
        // either a Blank or a Named Node.
        return nodes.every((otherNode) => nodes.every((anotherNode) => otherNode.equals(anotherNode)));
    }
    // Get all Blank Nodes that are part of a cycle in the graph:
    const cycleBlankNodes = [];
    blankNodeObjects.forEach((blankNodeObject) => {
        cycleBlankNodes.push(...getCycleBlankNodes(blankNodeObject, quads));
    });
    // Get Blank Nodes that are used to provide nested values for a single Subject,
    // which we'll represent as nested values as well
    // (this allows us to avoid generating a non-deterministic, ad-hoc identifier
    // for those Blank Nodes).
    // We'll do this by taking all Blank Nodes in the given Quads...
    const chainBlankNodes = blankNodeSubjects
        .concat(blankNodeObjects)
        .filter((blankNode) => {
        // ....removing those Blank Nodes that are part of a cycle...
        if (cycleBlankNodes.some((cycleBlankNode) => cycleBlankNode.equals(blankNode))) {
            return false;
        }
        // ...and then returning only those Blank Nodes that only occur in the
        // Object position for a single Subject, i.e. that are part of a single
        // chain:
        const subjectsWithThisNodeAsObject = quads
            .filter((quad) => quad.object.equals(blankNode))
            .map((quad) => quad.subject);
        return (subjectsWithThisNodeAsObject.length > 0 &&
            everyNodeTheSame(subjectsWithThisNodeAsObject));
    });
    return chainBlankNodes;
}
function toRdfJsQuads(dataset, options = {}) {
    var _a;
    const quads = [];
    const dataFactory = (_a = options.dataFactory) !== null && _a !== void 0 ? _a : DataFactory;
    Object.keys(dataset.graphs).forEach((graphIri) => {
        const graph = dataset.graphs[graphIri];
        const graphNode = graphIri === "default"
            ? dataFactory.defaultGraph()
            : dataFactory.namedNode(graphIri);
        Object.keys(graph).forEach((subjectIri) => {
            const { predicates } = graph[subjectIri];
            const subjectNode = isBlankNodeId(subjectIri)
                ? dataFactory.blankNode(getBlankNodeValue(subjectIri))
                : dataFactory.namedNode(subjectIri);
            quads.push(...subjectToRdfJsQuads(predicates, subjectNode, graphNode, options));
        });
    });
    return quads;
}
function subjectToRdfJsQuads(predicates, subjectNode, graphNode, options = {}) {
    var _a;
    const quads = [];
    const dataFactory = (_a = options.dataFactory) !== null && _a !== void 0 ? _a : DataFactory;
    Object.keys(predicates).forEach((predicateIri) => {
        var _a, _b, _c, _d;
        const predicateNode = dataFactory.namedNode(predicateIri);
        const langStrings = (_a = predicates[predicateIri].langStrings) !== null && _a !== void 0 ? _a : {};
        const namedNodes = (_b = predicates[predicateIri].namedNodes) !== null && _b !== void 0 ? _b : [];
        const literals = (_c = predicates[predicateIri].literals) !== null && _c !== void 0 ? _c : {};
        const blankNodes = (_d = predicates[predicateIri].blankNodes) !== null && _d !== void 0 ? _d : [];
        const literalTypes = Object.keys(literals);
        literalTypes.forEach((typeIri) => {
            const typeNode = dataFactory.namedNode(typeIri);
            const literalValues = literals[typeIri];
            literalValues.forEach((value) => {
                const literalNode = dataFactory.literal(value, typeNode);
                quads.push(dataFactory.quad(subjectNode, predicateNode, literalNode, graphNode));
            });
        });
        const locales = Object.keys(langStrings);
        locales.forEach((locale) => {
            const localeValues = langStrings[locale];
            localeValues.forEach((value) => {
                const langStringNode = dataFactory.literal(value, locale);
                quads.push(dataFactory.quad(subjectNode, predicateNode, langStringNode, graphNode));
            });
        });
        namedNodes.forEach((namedNodeIri) => {
            const node = dataFactory.namedNode(namedNodeIri);
            quads.push(dataFactory.quad(subjectNode, predicateNode, node, graphNode));
        });
        blankNodes.forEach((blankNodeIdOrPredicates) => {
            if (isBlankNodeId(blankNodeIdOrPredicates)) {
                const blankNode = dataFactory.blankNode(getBlankNodeValue(blankNodeIdOrPredicates));
                quads.push(dataFactory.quad(subjectNode, predicateNode, blankNode, graphNode));
            }
            else {
                const node = dataFactory.blankNode();
                const blankNodeObjectQuad = dataFactory.quad(subjectNode, predicateNode, node, graphNode);
                const blankNodeSubjectQuads = subjectToRdfJsQuads(blankNodeIdOrPredicates, node, graphNode);
                quads.push(blankNodeObjectQuad);
                quads.push(...blankNodeSubjectQuads);
            }
        });
    });
    return quads;
}
/**
 * A recursive function that finds all Blank Nodes in an array of Quads that create a cycle in the graph.
 *
 * This function will traverse the graph starting from `currentNode`, keeping
 * track of all the Blank Nodes it encounters twice while doing so, and
 * returning those.
 */
function getCycleBlankNodes(currentNode, quads, traversedBlankNodes = []) {
    // If we've encountered `currentNode` before, all the Blank Nodes we've
    // encountered so far are part of a cycle. Return those.
    if (traversedBlankNodes.find((traversedBlankNode) => traversedBlankNode.equals(currentNode)) !== undefined) {
        return traversedBlankNodes;
    }
    // Find all Blank Nodes that are connected to `currentNode`:
    const blankNodeObjects = quads
        .filter((quad) => quad.subject.equals(currentNode) && isBlankNode(quad.object))
        .map((quad) => quad.object);
    // If no Blank Nodes are connected to `currentNode`, and `currentNode` is not
    // part of a cycle, we're done; the currently traversed Nodes do not form a
    // cycle:
    if (blankNodeObjects.length === 0) {
        return [];
    }
    // Store that we've traversed `currentNode`, then move on to all the Blank
    // Nodes connected to it, which will then take up the role of `currentNode`:
    const nextTraversedNodes = [...traversedBlankNodes, currentNode];
    const cycleBlankNodeArrays = blankNodeObjects.map((nextNode) => getCycleBlankNodes(nextNode, quads, nextTraversedNodes));
    // Collect all the cycle Blank Nodes found in those traverals,
    // then return them:
    const allCycleBlankNodes = [];
    for (const cycleBlankNodes of cycleBlankNodeArrays) {
        allCycleBlankNodes.push(...cycleBlankNodes);
    }
    return allCycleBlankNodes;
}
function isBlankNode(term) {
    return term.termType === "BlankNode";
}

export { addRdfJsQuadToDataset, getChainBlankNodes, subjectToRdfJsQuads, toRdfJsQuads };
