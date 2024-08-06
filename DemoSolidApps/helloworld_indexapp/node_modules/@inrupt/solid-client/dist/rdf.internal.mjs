import { Store } from 'n3';

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
const rdfJsDataset = (quads) => new Store(quads);
const localNodeSkolemPrefix = "https://inrupt.com/.well-known/sdk-local-node/";
/**
 * Runtime freezing might be too much overhead;
 * if so, this function allows us to replace it by a function
 * that merely marks its input as Readonly<> for static analysis.
 */
const { freeze } = Object;
function isLocalNodeIri(iri) {
    return (iri.substring(0, localNodeSkolemPrefix.length) === localNodeSkolemPrefix);
}
function getLocalNodeName(localNodeIri) {
    return localNodeIri.substring(localNodeSkolemPrefix.length);
}
function getLocalNodeIri(localNodeName) {
    return `${localNodeSkolemPrefix}${localNodeName}`;
}
function isBlankNodeId(value) {
    return typeof value === "string" && value.substring(0, 2) === "_:";
}
function getBlankNodeValue(blankNodeId) {
    return blankNodeId.substring(2);
}
function getBlankNodeId(blankNode) {
    return `_:${blankNode.value}`;
}

export { freeze, getBlankNodeId, getBlankNodeValue, getLocalNodeIri, getLocalNodeName, isBlankNodeId, isLocalNodeIri, localNodeSkolemPrefix, rdfJsDataset };
