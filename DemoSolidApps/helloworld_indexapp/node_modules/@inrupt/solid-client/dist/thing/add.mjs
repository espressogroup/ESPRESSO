import { internal_throwIfNotThing } from './thing.internal.mjs';
import { internal_isValidUrl, isNamedNode, serializeDatetime, serializeDate, serializeTime, serializeDecimal, serializeInteger, normalizeLocale, xmlSchemaTypes, serializeBoolean } from '../datatypes.mjs';
import { ValidPropertyUrlExpectedError, isThing, ValidValueUrlExpectedError, isThingLocal, asIri } from './thing.mjs';
import { internal_toIriString } from '../interfaces.internal.mjs';
import { freeze, getBlankNodeId } from '../rdf.internal.mjs';

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
 * Create a new Thing with a URL added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setUrl]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a URL value to.
 * @param property Property for which to add the given URL value.
 * @param url URL to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
const addUrl = (thing, property, url) => {
    var _a, _b;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    if (!isThing(url) && !internal_isValidUrl(url)) {
        throw new ValidValueUrlExpectedError(url);
    }
    const predicateIri = internal_toIriString(property);
    const existingPredicate = (_a = thing.predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
    const existingNamedNodes = (_b = existingPredicate.namedNodes) !== null && _b !== void 0 ? _b : [];
    let iriToAdd;
    if (isNamedNode(url)) {
        iriToAdd = url.value;
    }
    else if (typeof url === "string") {
        iriToAdd = url;
    }
    else if (isThingLocal(url)) {
        iriToAdd = url.url;
    }
    else {
        iriToAdd = asIri(url);
    }
    const updatedNamedNodes = freeze(existingNamedNodes.concat(internal_toIriString(iriToAdd)));
    const updatedPredicate = freeze({
        ...existingPredicate,
        namedNodes: updatedNamedNodes,
    });
    const updatedPredicates = freeze({
        ...thing.predicates,
        [predicateIri]: updatedPredicate,
    });
    const updatedThing = freeze({
        ...thing,
        predicates: updatedPredicates,
    });
    return updatedThing;
};
/** @hidden Alias for [[addUrl]] for those who prefer IRI terminology. */
const addIri = addUrl;
/**
 * Create a new Thing with a boolean added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setBoolean]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a boolean value to.
 * @param property Property for which to add the given boolean value.
 * @param value Boolean to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
const addBoolean = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addLiteralOfType(thing, property, serializeBoolean(value), xmlSchemaTypes.boolean);
};
/**
 * Create a new Thing with a datetime added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setDatetime]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a datetime value to.
 * @param property Property for which to add the given datetime value.
 * @param value Datetime to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
const addDatetime = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addLiteralOfType(thing, property, serializeDatetime(value), xmlSchemaTypes.dateTime);
};
/**
 * Create a new Thing with a date added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setDate]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a date value to.
 * @param property Property for which to add the given date value.
 * @param value Date to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 * @since 1.10.0
 */
const addDate = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addLiteralOfType(thing, property, serializeDate(value), xmlSchemaTypes.date);
};
/**
 * Create a new Thing with a time added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setDatetime]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a datetime value to.
 * @param property Property for which to add the given datetime value.
 * @param value time to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 * @since 1.10.0
 */
const addTime = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addLiteralOfType(thing, property, serializeTime(value), xmlSchemaTypes.time);
};
/**
 * Create a new Thing with a decimal added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setDecimal]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a decimal value to.
 * @param property Property for which to add the given decimal value.
 * @param value Decimal to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
const addDecimal = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addLiteralOfType(thing, property, serializeDecimal(value), xmlSchemaTypes.decimal);
};
/**
 * Create a new Thing with an integer added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setInteger]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add an integer value to.
 * @param property Property for which to add the given integer value.
 * @param value Integer to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
const addInteger = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addLiteralOfType(thing, property, serializeInteger(value), xmlSchemaTypes.integer);
};
/**
 * Create a new Thing with an English string added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setStringEnglish]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a localised string value to.
 * @param property Property for which to add the given string value.
 * @param value String to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 * @since 1.13.0
 */
function addStringEnglish(thing, property, value) {
    return addStringWithLocale(thing, property, value, "en");
}
/**
 * Create a new Thing with a localised string added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setStringWithLocale]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add a localised string value to.
 * @param property Property for which to add the given string value.
 * @param value String to add to `thing` for the given `property`.
 * @param locale Locale of the added string.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
function addStringWithLocale(thing, property, value, locale) {
    var _a, _b, _c;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const normalizedLocale = normalizeLocale(locale);
    const existingPredicate = (_a = thing.predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
    const existingLangStrings = (_b = existingPredicate.langStrings) !== null && _b !== void 0 ? _b : {};
    const existingStringsInLocale = (_c = existingLangStrings[normalizedLocale]) !== null && _c !== void 0 ? _c : [];
    const updatedStringsInLocale = freeze(existingStringsInLocale.concat(value));
    const updatedLangStrings = freeze({
        ...existingLangStrings,
        [normalizedLocale]: updatedStringsInLocale,
    });
    const updatedPredicate = freeze({
        ...existingPredicate,
        langStrings: updatedLangStrings,
    });
    const updatedPredicates = freeze({
        ...thing.predicates,
        [predicateIri]: updatedPredicate,
    });
    const updatedThing = freeze({
        ...thing,
        predicates: updatedPredicates,
    });
    return updatedThing;
}
/**
 * Create a new Thing with an unlocalised string added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setStringNoLocale]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to add an unlocalised string value to.
 * @param property Property for which to add the given string value.
 * @param value String to add to `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
const addStringNoLocale = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addLiteralOfType(thing, property, value, xmlSchemaTypes.string);
};
/**
 * Create a new Thing with a Named Node added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setNamedNode]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @ignore This should not be needed due to the other add*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing The [[Thing]] to add a Named Node to.
 * @param property Property for which to add a value.
 * @param value The Named Node to add.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
function addNamedNode(thing, property, value) {
    return addUrl(thing, property, value.value);
}
/**
 * Create a new Thing with a Literal added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setLiteral]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @ignore This should not be needed due to the other add*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing The [[Thing]] to add a Literal to.
 * @param property Property for which to add a value.
 * @param value The Literal to add.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 */
function addLiteral(thing, property, value) {
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const typeIri = value.datatype.value;
    if (typeIri === xmlSchemaTypes.langString) {
        return addStringWithLocale(thing, property, value.value, value.language);
    }
    return addLiteralOfType(thing, property, value.value, value.datatype.value);
}
/**
 * Creates a new Thing with a Term added for a Property.
 *
 * This preserves existing values for the given Property. To replace them, see [[setTerm]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @ignore This should not be needed due to the other add*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing The [[Thing]] to add a Term to.
 * @param property Property for which to add a value.
 * @param value The Term to add.
 * @returns A new Thing equal to the input Thing with the given value added for the given Property.
 * @since 0.3.0
 */
function addTerm(thing, property, value) {
    var _a, _b;
    if (value.termType === "NamedNode") {
        return addNamedNode(thing, property, value);
    }
    if (value.termType === "Literal") {
        return addLiteral(thing, property, value);
    }
    if (value.termType === "BlankNode") {
        internal_throwIfNotThing(thing);
        if (!internal_isValidUrl(property)) {
            throw new ValidPropertyUrlExpectedError(property);
        }
        const predicateIri = internal_toIriString(property);
        const existingPredicate = (_a = thing.predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
        const existingBlankNodes = (_b = existingPredicate.blankNodes) !== null && _b !== void 0 ? _b : [];
        const updatedBlankNodes = freeze(existingBlankNodes.concat(getBlankNodeId(value)));
        const updatedPredicate = freeze({
            ...existingPredicate,
            blankNodes: updatedBlankNodes,
        });
        const updatedPredicates = freeze({
            ...thing.predicates,
            [predicateIri]: updatedPredicate,
        });
        const updatedThing = freeze({
            ...thing,
            predicates: updatedPredicates,
        });
        return updatedThing;
    }
    throw new Error(`Term type [${value.termType}] is not supported by @inrupt/solid-client.`);
}
function addLiteralOfType(thing, property, value, type) {
    var _a, _b, _c;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const existingPredicate = (_a = thing.predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
    const existingLiterals = (_b = existingPredicate.literals) !== null && _b !== void 0 ? _b : {};
    const existingValuesOfType = (_c = existingLiterals[type]) !== null && _c !== void 0 ? _c : [];
    const updatedValuesOfType = freeze(existingValuesOfType.concat(value));
    const updatedLiterals = freeze({
        ...existingLiterals,
        [type]: updatedValuesOfType,
    });
    const updatedPredicate = freeze({
        ...existingPredicate,
        literals: updatedLiterals,
    });
    const updatedPredicates = freeze({
        ...thing.predicates,
        [predicateIri]: updatedPredicate,
    });
    const updatedThing = freeze({
        ...thing,
        predicates: updatedPredicates,
    });
    return updatedThing;
}

export { addBoolean, addDate, addDatetime, addDecimal, addInteger, addIri, addLiteral, addNamedNode, addStringEnglish, addStringNoLocale, addStringWithLocale, addTerm, addTime, addUrl };
