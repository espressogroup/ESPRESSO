import { v4 } from 'uuid';
import { internal_isValidUrl, resolveLocalIri, isNamedNode } from '../datatypes.mjs';
import { hasServerResourceInfo, SolidClientError } from '../interfaces.mjs';
import { subjectToRdfJsQuads } from '../rdfjs.internal.mjs';
import { getSourceUrl } from '../resource/resource.mjs';
import { internal_addAdditionsToChangeLog, internal_addDeletionsToChangeLog, internal_getReadableValue } from './thing.internal.mjs';
import { isLocalNodeIri, getLocalNodeName, isBlankNodeId, freeze, getLocalNodeIri } from '../rdf.internal.mjs';
import { internal_toIriString } from '../interfaces.internal.mjs';
import { getTermAll } from './get.mjs';
import { DataFactory } from 'n3';

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
 * Extract Quads with a given Subject from a [[SolidDataset]] into a [[Thing]].
 *
 * @param solidDataset The [[SolidDataset]] to extract the [[Thing]] from.
 * @param thingUrl The URL of the desired [[Thing]].
 * @param options Not yet implemented.
 */
function getThing(solidDataset, thingUrl, options = {}) {
    var _a;
    if (!internal_isValidUrl(thingUrl)) {
        throw new ValidThingUrlExpectedError(thingUrl);
    }
    const graph = typeof options.scope !== "undefined"
        ? internal_toIriString(options.scope)
        : "default";
    const thingsByIri = (_a = solidDataset.graphs[graph]) !== null && _a !== void 0 ? _a : {};
    const thingIri = internal_toIriString(thingUrl);
    const resolvedThingIri = isLocalNodeIri(thingIri) && hasServerResourceInfo(solidDataset)
        ? resolveLocalIri(getLocalNodeName(thingIri), getSourceUrl(solidDataset))
        : thingIri;
    const thing = thingsByIri[resolvedThingIri];
    if (typeof thing === "undefined") {
        return null;
    }
    return thing;
}
/**
 * Get all [[Thing]]s in a [[SolidDataset]].
 *
 * @param solidDataset The [[SolidDataset]] to extract the [[Thing]]s from.
 * @param options Not yet implemented.
 */
function getThingAll(solidDataset, options = { acceptBlankNodes: false }) {
    var _a;
    const graph = typeof options.scope !== "undefined"
        ? internal_toIriString(options.scope)
        : "default";
    const thingsByIri = (_a = solidDataset.graphs[graph]) !== null && _a !== void 0 ? _a : {};
    return Object.values(thingsByIri).filter((thing) => !isBlankNodeId(thing.url) || options.acceptBlankNodes);
}
/**
 * Insert a [[Thing]] into a [[SolidDataset]], replacing previous instances of that Thing.
 *
 * @param solidDataset The SolidDataset to insert a Thing into.
 * @param thing The Thing to insert into the given SolidDataset.
 * @returns A new SolidDataset equal to the given SolidDataset, but with the given Thing.
 */
function setThing(solidDataset, thing) {
    var _a;
    const thingIri = isThingLocal(thing) && hasServerResourceInfo(solidDataset)
        ? resolveLocalIri(getLocalNodeName(thing.url), getSourceUrl(solidDataset))
        : thing.url;
    const defaultGraph = solidDataset.graphs.default;
    const updatedDefaultGraph = freeze({
        ...defaultGraph,
        [thingIri]: freeze({ ...thing, url: thingIri }),
    });
    const updatedGraphs = freeze({
        ...solidDataset.graphs,
        default: updatedDefaultGraph,
    });
    const subjectNode = DataFactory.namedNode(thingIri);
    const deletedThingPredicates = (_a = solidDataset.graphs.default[thingIri]) === null || _a === void 0 ? void 0 : _a.predicates;
    const deletions = typeof deletedThingPredicates !== "undefined"
        ? subjectToRdfJsQuads(deletedThingPredicates, subjectNode, DataFactory.defaultGraph())
        : [];
    const additions = subjectToRdfJsQuads(thing.predicates, subjectNode, DataFactory.defaultGraph());
    return internal_addAdditionsToChangeLog(internal_addDeletionsToChangeLog(freeze({
        ...solidDataset,
        graphs: updatedGraphs,
    }), deletions), additions);
}
/**
 * Remove a Thing from a SolidDataset.
 *
 * @param solidDataset The SolidDataset to remove a Thing from.
 * @param thing The Thing to remove from `solidDataset`.
 * @returns A new [[SolidDataset]] equal to the input SolidDataset, excluding the given Thing.
 */
function removeThing(solidDataset, thing) {
    var _a;
    let thingIri;
    if (isNamedNode(thing)) {
        thingIri = thing.value;
    }
    else if (typeof thing === "string") {
        thingIri =
            isLocalNodeIri(thing) && hasServerResourceInfo(solidDataset)
                ? resolveLocalIri(getLocalNodeName(thing), getSourceUrl(solidDataset))
                : thing;
    }
    else if (isThingLocal(thing)) {
        thingIri = thing.url;
    }
    else {
        thingIri = asIri(thing);
    }
    const defaultGraph = solidDataset.graphs.default;
    const updatedDefaultGraph = { ...defaultGraph };
    delete updatedDefaultGraph[thingIri];
    const updatedGraphs = freeze({
        ...solidDataset.graphs,
        default: freeze(updatedDefaultGraph),
    });
    const subjectNode = DataFactory.namedNode(thingIri);
    const deletedThingPredicates = (_a = solidDataset.graphs.default[thingIri]) === null || _a === void 0 ? void 0 : _a.predicates;
    const deletions = typeof deletedThingPredicates !== "undefined"
        ? subjectToRdfJsQuads(deletedThingPredicates, subjectNode, DataFactory.defaultGraph())
        : [];
    return internal_addDeletionsToChangeLog(freeze({
        ...solidDataset,
        graphs: updatedGraphs,
    }), deletions);
}
function createThing(options = {}) {
    var _a;
    if (typeof options.url !== "undefined") {
        const { url } = options;
        if (!internal_isValidUrl(url)) {
            throw new ValidThingUrlExpectedError(url);
        }
        const thing = freeze({
            type: "Subject",
            predicates: freeze({}),
            url,
        });
        return thing;
    }
    const name = (_a = options.name) !== null && _a !== void 0 ? _a : generateName();
    const localNodeIri = getLocalNodeIri(name);
    const thing = freeze({
        type: "Subject",
        predicates: freeze({}),
        url: localNodeIri,
    });
    return thing;
}
/**
 * @param input An value that might be a [[Thing]].
 * @returns Whether `input` is a Thing.
 * @since 0.2.0
 */
function isThing(input) {
    return (typeof input === "object" &&
        input !== null &&
        typeof input.type === "string" &&
        input.type === "Subject");
}
function asUrl(thing, baseUrl) {
    if (isThingLocal(thing)) {
        if (typeof baseUrl === "undefined") {
            throw new Error("The URL of a Thing that has not been persisted cannot be determined without a base URL.");
        }
        return resolveLocalIri(getLocalNodeName(thing.url), baseUrl);
    }
    return thing.url;
}
/** @hidden Alias of [[asUrl]] for those who prefer IRI terminology. */
const asIri = asUrl;
/**
 * Gets a human-readable representation of the given Thing to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param thing The Thing to get a human-readable representation of.
 * @since 0.3.0
 */
function thingAsMarkdown(thing) {
    let thingAsMarkdown = "";
    if (isThingLocal(thing)) {
        thingAsMarkdown += `## Thing (no URL yet — identifier: \`#${getLocalNodeName(thing.url)}\`)\n`;
    }
    else {
        thingAsMarkdown += `## Thing: ${thing.url}\n`;
    }
    const predicateIris = Object.keys(thing.predicates);
    if (predicateIris.length === 0) {
        thingAsMarkdown += "\n<empty>\n";
    }
    else {
        for (const predicate of predicateIris) {
            thingAsMarkdown += `\nProperty: ${predicate}\n`;
            const values = getTermAll(thing, predicate);
            thingAsMarkdown += values.reduce((acc, value) => {
                return `${acc}- ${internal_getReadableValue(value)}\n`;
            }, "");
        }
    }
    return thingAsMarkdown;
}
/**
 * @param thing The [[Thing]] of which a URL might or might not be known.
 * @return `true` if `thing` has no known URL yet.
 * @since 1.7.0
 */
function isThingLocal(thing) {
    return isLocalNodeIri(thing.url);
}
/**
 * This error is thrown when a function expected to receive a [[Thing]] but received something else.
 * @since 1.2.0
 */
class ThingExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const message = `Expected a Thing, but received: [${receivedValue}].`;
        super(message);
        this.receivedValue = receivedValue;
    }
}
/**
 * This error is thrown when a function expected to receive a valid URL to identify a property but received something else.
 */
class ValidPropertyUrlExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const value = isNamedNode(receivedValue)
            ? receivedValue.value
            : receivedValue;
        const message = `Expected a valid URL to identify a property, but received: [${value}].`;
        super(message);
        this.receivedProperty = value;
    }
}
/**
 * This error is thrown when a function expected to receive a valid URL value but received something else.
 */
class ValidValueUrlExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const value = isNamedNode(receivedValue)
            ? receivedValue.value
            : receivedValue;
        const message = `Expected a valid URL value, but received: [${value}].`;
        super(message);
        this.receivedValue = value;
    }
}
/**
 * This error is thrown when a function expected to receive a valid URL to identify a [[Thing]] but received something else.
 */
class ValidThingUrlExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const value = isNamedNode(receivedValue)
            ? receivedValue.value
            : receivedValue;
        const message = `Expected a valid URL to identify a Thing, but received: [${value}].`;
        super(message);
        this.receivedValue = value;
    }
}
/**
 * Generate a string that can be used as the unique identifier for a Thing
 *
 * This function works by starting with a date string (so that Things can be
 * sorted chronologically), followed by a random number generated by taking a
 * random number between 0 and 1, and cutting off the `0.`.
 *
 * @internal
 * @returns An string that's likely to be unique
 */
const generateName = () => {
    return v4();
};

export { ThingExpectedError, ValidPropertyUrlExpectedError, ValidThingUrlExpectedError, ValidValueUrlExpectedError, asIri, asUrl, createThing, getThing, getThingAll, isThing, isThingLocal, removeThing, setThing, thingAsMarkdown };
