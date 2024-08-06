import { isNamedNode, isLiteral, xmlSchemaTypes, deserializeInteger, deserializeDecimal, deserializeDatetime, deserializeBoolean } from '../datatypes.mjs';
import { hasChangelog } from '../interfaces.mjs';
import { isThing, ThingExpectedError } from './thing.mjs';
import { freeze } from '../rdf.internal.mjs';

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
/** @hidden For internal use only. */
function internal_getReadableValue(value) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (isNamedNode(value)) {
        return `<${value.value}> (URL)`;
    }
    if (isLiteral(value)) {
        /* istanbul ignore if: thingAsMarkdown always instantiates a NamedNode, so we can't hit this code path in tests. */
        if (!isNamedNode(value.datatype)) {
            return `[${value.value}] (RDF/JS Literal of unknown type)`;
        }
        let val;
        switch (value.datatype.value) {
            case xmlSchemaTypes.boolean:
                val =
                    (_b = (_a = deserializeBoolean(value.value)) === null || _a === void 0 ? void 0 : _a.valueOf()) !== null && _b !== void 0 ? _b : `Invalid data: \`${value.value}\``;
                return `${val} (boolean)`;
            case xmlSchemaTypes.dateTime:
                val =
                    (_d = (_c = deserializeDatetime(value.value)) === null || _c === void 0 ? void 0 : _c.toUTCString()) !== null && _d !== void 0 ? _d : `Invalid data: \`${value.value}\``;
                return `${val} (datetime)`;
            case xmlSchemaTypes.decimal:
                val =
                    (_f = (_e = deserializeDecimal(value.value)) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : `Invalid data: \`${value.value}\``;
                return `${val} (decimal)`;
            case xmlSchemaTypes.integer:
                val =
                    (_h = (_g = deserializeInteger(value.value)) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : `Invalid data: \`${value.value}\``;
                return `${val} (integer)`;
            case xmlSchemaTypes.langString:
                return `"${value.value}" (${value.language} string)`;
            case xmlSchemaTypes.string:
                return `"${value.value}" (string)`;
            default:
                return `[${value.value}] (RDF/JS Literal of type: \`${value.datatype.value}\`)`;
        }
    }
    /* istanbul ignore else: thingAsMarkdown doesn't generate other Nodes, so we can't hit this path in tests. */
    if (value.termType === "BlankNode") {
        return `[${value.value}] (RDF/JS BlankNode)`;
    }
    /* istanbul ignore next: thingAsMarkdown doesn't generate Quad Nodes, so we can't hit this path in tests. */
    if (value.termType === "Quad") {
        return `??? (nested RDF* Quad)`;
    }
    /* istanbul ignore else: The if statements are exhaustive; if not, TypeScript will complain. */
    /* istanbul ignore next: thingAsMarkdown doesn't generate Variable Nodes, so we can't hit this path in tests. */
    if (value.termType === "Variable") {
        return `?${value.value} (RDF/JS Variable)`;
    }
    /* istanbul ignore next: The if statements are exhaustive; if not, TypeScript will complain. */
    return value;
}
/**
 * @hidden
 */
function internal_throwIfNotThing(thing) {
    if (!isThing(thing)) {
        throw new ThingExpectedError(thing);
    }
}
/**
 * @hidden
 * @param solidDataset
 */
function internal_addAdditionsToChangeLog(solidDataset, additions) {
    const changeLog = hasChangelog(solidDataset)
        ? solidDataset.internal_changeLog
        : /* istanbul ignore next: This function always gets called after addDeletionsToChangeLog, so the ChangeLog always already exists in tests: */
            { additions: [], deletions: [] };
    const [newAdditions, newDeletions] = additions
        .filter((addition) => !containsBlankNode(addition))
        .reduce(([additionsAcc, deletionsAcc], addition) => {
        const existingDeletion = deletionsAcc.find((deletion) => deletion.equals(addition));
        if (typeof existingDeletion !== "undefined") {
            return [
                additionsAcc,
                deletionsAcc.filter((deletion) => !deletion.equals(addition)),
            ];
        }
        return [additionsAcc.concat(addition), deletionsAcc];
    }, [changeLog.additions, changeLog.deletions]);
    return freeze({
        ...solidDataset,
        internal_changeLog: {
            additions: newAdditions,
            deletions: newDeletions,
        },
    });
}
/**
 * @hidden
 * @param solidDataset
 */
function internal_addDeletionsToChangeLog(solidDataset, deletions) {
    const changeLog = hasChangelog(solidDataset)
        ? solidDataset.internal_changeLog
        : { additions: [], deletions: [] };
    const [newAdditions, newDeletions] = deletions
        .filter((deletion) => !containsBlankNode(deletion))
        .reduce(([additionsAcc, deletionsAcc], deletion) => {
        const existingAddition = additionsAcc.find((addition) => addition.equals(deletion));
        if (typeof existingAddition !== "undefined") {
            return [
                additionsAcc.filter((addition) => !addition.equals(deletion)),
                deletionsAcc,
            ];
        }
        return [additionsAcc, deletionsAcc.concat(deletion)];
    }, [changeLog.additions, changeLog.deletions]);
    return freeze({
        ...solidDataset,
        internal_changeLog: {
            additions: newAdditions,
            deletions: newDeletions,
        },
    });
}
/**
 * Enforces the presence of a Changelog for a given dataset. If a changelog is
 * already present, it is unchanged. Otherwise, an empty changelog is created.
 * @hidden
 * @param solidDataset
 */
function internal_withChangeLog(solidDataset) {
    const newSolidDataset = hasChangelog(solidDataset)
        ? solidDataset
        : freeze({
            ...solidDataset,
            internal_changeLog: { additions: [], deletions: [] },
        });
    return newSolidDataset;
}
/**
 * We don't currently support reading and writing Blank Nodes, so this function can be used to skip those Quads.
 *
 * This is needed because we cannot reconcile Blank Nodes in additions and
 * deletions. Down the road, we should do a diff before saving a SolidDataset
 * against a saved copy of the originally-fetched one, based on our own data
 * structures, which should make it easier to reconcile.
 */
function containsBlankNode(quad) {
    return (quad.subject.termType === "BlankNode" ||
        quad.object.termType === "BlankNode");
}

export { internal_addAdditionsToChangeLog, internal_addDeletionsToChangeLog, internal_getReadableValue, internal_throwIfNotThing, internal_withChangeLog };
