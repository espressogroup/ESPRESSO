import { internal_isValidUrl, deserializeBoolean, deserializeDatetime, deserializeDate, deserializeTime, deserializeDecimal, deserializeInteger, xmlSchemaTypes } from '../datatypes.mjs';
import { internal_throwIfNotThing } from './thing.internal.mjs';
import { ValidPropertyUrlExpectedError } from './thing.mjs';
import { internal_toIriString } from '../interfaces.internal.mjs';
import { isLocalNodeIri, getLocalNodeName, isBlankNodeId, getBlankNodeValue } from '../rdf.internal.mjs';
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
 * Returns the URLs of all Properties that the given [[Thing ]]has values for.b
 *
 * @param thing The [[Thing]] of which to get that Property URLs that have a value.
 * @returns The URLs of the Properties for which values are defined for the given Thing.
 * @hidden This is an advanced API that should not be needed for most Solid use cases. If you do find yourself needing this, please file a feature request sharing your use case.
 */
function getPropertyAll(thing) {
    return Object.keys(thing.predicates).filter((predicate) => getTerm(thing, predicate) !== null);
}
/**
 * Returns the URL value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type URL, returns null.
 * If the Property has multiple URL values, returns one of its URL values.
 *
 * @param thing The [[Thing]] to read a URL value from.
 * @param property The Property whose URL value to return.
 * @returns A URL value for the given Property if present, or null if the Property is not present or the value is not of type URL.
 */
function getUrl(thing, property) {
    var _a, _b, _c;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateUrl = internal_toIriString(property);
    const firstUrl = (_c = (_b = (_a = thing.predicates[predicateUrl]) === null || _a === void 0 ? void 0 : _a.namedNodes) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : null;
    if (firstUrl === null) {
        return null;
    }
    return isLocalNodeIri(firstUrl) ? `#${getLocalNodeName(firstUrl)}` : firstUrl;
}
/** @hidden Alias of [[getUrl]] for those who prefer IRI terminology. */
const getIri = getUrl;
/**
 * Returns the URL values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type URL, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the URL values from.
 * @param property The Property whose URL values to return.
 * @returns An array of URL values for the given Property.
 */
function getUrlAll(thing, property) {
    var _a, _b, _c;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateUrl = internal_toIriString(property);
    return ((_c = (_b = (_a = thing.predicates[predicateUrl]) === null || _a === void 0 ? void 0 : _a.namedNodes) === null || _b === void 0 ? void 0 : _b.map((iri) => isLocalNodeIri(iri) ? `#${getLocalNodeName(iri)}` : iri)) !== null && _c !== void 0 ? _c : []);
}
/** @hidden Alias of [[getUrlAll]] for those who prefer IRI terminology. */
const getIriAll = getUrlAll;
/**
 * Returns the boolean value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type boolean, returns null.
 * If the Property has multiple boolean values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a boolean value from.
 * @param property The Property whose boolean value to return.
 * @returns A boolean value for the given Property if present, or null if the Property is not present or the value is not of type boolean.
 */
function getBoolean(thing, property) {
    internal_throwIfNotThing(thing);
    const literalString = getLiteralOfType(thing, property, xmlSchemaTypes.boolean);
    if (literalString === null) {
        return null;
    }
    return deserializeBoolean(literalString);
}
/**
 * Returns the boolean values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type boolean, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the boolean values from.
 * @param property The Property whose boolean values to return.
 * @returns An array of boolean values for the given Property.
 */
function getBooleanAll(thing, property) {
    internal_throwIfNotThing(thing);
    const literalStrings = getLiteralAllOfType(thing, property, xmlSchemaTypes.boolean);
    return literalStrings
        .map(deserializeBoolean)
        .filter((possibleBoolean) => possibleBoolean !== null);
}
/**
 * Returns the datetime value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type datetime, returns null.
 * If the Property has multiple datetime values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a datetime value from.
 * @param property The Property whose datetime value to return.
 * @returns A datetime value for the given Property if present, or null if the Property is not present or the value is not of type datetime.
 */
function getDatetime(thing, property) {
    internal_throwIfNotThing(thing);
    const literalString = getLiteralOfType(thing, property, xmlSchemaTypes.dateTime);
    if (literalString === null) {
        return null;
    }
    return deserializeDatetime(literalString);
}
/**
 * Returns the datetime values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type datetime, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the datetime values from.
 * @param property The Property whose datetime values to return.
 * @returns An array of datetime values for the given Property.
 */
function getDatetimeAll(thing, property) {
    internal_throwIfNotThing(thing);
    const literalStrings = getLiteralAllOfType(thing, property, xmlSchemaTypes.dateTime);
    return literalStrings
        .map(deserializeDatetime)
        .filter((potentialDatetime) => potentialDatetime !== null);
}
/**
 * Returns the date value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type date, returns null.
 * If the Property has multiple date values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a date value from.
 * @param property The Property whose date value to return.
 * @returns A date value for the given Property if present, or null if the Property is not present or the value is not of type date.
 * @since 1.10.0
 */
function getDate(thing, property) {
    internal_throwIfNotThing(thing);
    const literalString = getLiteralOfType(thing, property, xmlSchemaTypes.date);
    if (literalString === null) {
        return null;
    }
    return deserializeDate(literalString);
}
/**
 * Returns the date values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type date, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the date values from.
 * @param property The Property whose date values to return.
 * @returns An array of date values for the given Property.
 * @since 1.10.0
 */
function getDateAll(thing, property) {
    internal_throwIfNotThing(thing);
    const literalStrings = getLiteralAllOfType(thing, property, xmlSchemaTypes.date);
    return literalStrings
        .map(deserializeDate)
        .filter((potentialDate) => potentialDate !== null);
}
/**
 * Returns the time value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type time, returns null.
 * If the Property has multiple time values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a time value from.
 * @param property The Property whose time value to return.
 * @returns A time value for the given Property if present, or null if the Property is not present or the value is not of type time.
 * @since 1.10.0
 */
function getTime(thing, property) {
    internal_throwIfNotThing(thing);
    const literalString = getLiteralOfType(thing, property, xmlSchemaTypes.time);
    if (literalString === null) {
        return null;
    }
    return deserializeTime(literalString);
}
/**
 * Returns the time values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type time, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the time values from.
 * @param property The Property whose time values to return.
 * @returns An array of time values for the given Property.
 * @since 1.10.0
 */
function getTimeAll(thing, property) {
    internal_throwIfNotThing(thing);
    const literalStrings = getLiteralAllOfType(thing, property, xmlSchemaTypes.time);
    return literalStrings
        .map(deserializeTime)
        .filter((potentialTime) => potentialTime !== null);
}
/**
 * Returns the decimal value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type decimal, returns null.
 * If the Property has multiple decimal values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a decimal value from.
 * @param property The Property whose decimal value to return.
 * @returns A decimal value for the given Property if present, or null if the Property is not present or the value is not of type decimal.
 */
function getDecimal(thing, property) {
    internal_throwIfNotThing(thing);
    const literalString = getLiteralOfType(thing, property, xmlSchemaTypes.decimal);
    if (literalString === null) {
        return null;
    }
    return deserializeDecimal(literalString);
}
/**
 * Returns the decimal values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type decimal, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the decimal values from.
 * @param property The Property whose decimal values to return.
 * @returns An array of decimal values for the given Property.
 */
function getDecimalAll(thing, property) {
    internal_throwIfNotThing(thing);
    const literalStrings = getLiteralAllOfType(thing, property, xmlSchemaTypes.decimal);
    return literalStrings
        .map((literalString) => deserializeDecimal(literalString))
        .filter((potentialDecimal) => potentialDecimal !== null);
}
/**
 * Returns the integer value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type integer, returns null.
 * If the Property has multiple integer values, returns one of its values.
 *
 * @param thing The [[Thing]] to read an integer value from.
 * @param property The Property whose integer value to return.
 * @returns A integer value for the given Property if present, or null if the Property is not present or the value is not of type datetime.
 */
function getInteger(thing, property) {
    internal_throwIfNotThing(thing);
    const literalString = getLiteralOfType(thing, property, xmlSchemaTypes.integer);
    if (literalString === null) {
        return null;
    }
    return deserializeInteger(literalString);
}
/**
 * Returns the integer values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type integer, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the integer values from.
 * @param property The Property whose integer values to return.
 * @returns An array of integer values for the given Property.
 */
function getIntegerAll(thing, property) {
    internal_throwIfNotThing(thing);
    const literalStrings = getLiteralAllOfType(thing, property, xmlSchemaTypes.integer);
    return literalStrings
        .map((literalString) => deserializeInteger(literalString))
        .filter((potentialInteger) => potentialInteger !== null);
}
/**
 * Returns the English (language tag "en") string value of the specified Property from a [[Thing]].
 * If the Property is not present as a string in English, returns null.
 * If the Property has multiple English string values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a localised string value from.
 * @param property The Property whose localised string value to return.
 * @returns An English string value for the given Property if present, or null otherwise.
 * @since 1.13.0
 */
function getStringEnglish(thing, property) {
    return getStringWithLocale(thing, property, "en");
}
/**
 * Returns the localized string value of the specified Property from a [[Thing]].
 * If the Property is not present as a string in the specified locale, returns null.
 * If the Property has multiple string values for the specified locale, returns one of its values.
 *
 * @param thing The [[Thing]] to read a localised string value from.
 * @param property The Property whose localised string value to return.
 * @param locale The desired locale for the string value.
 * @returns A localised string value for the given Property if present in the specified `locale`, or null otherwise.
 */
function getStringWithLocale(thing, property, locale) {
    var _a, _b;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const langStrings = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.langStrings) !== null && _b !== void 0 ? _b : {};
    const existingLocales = Object.keys(langStrings);
    const matchingLocale = existingLocales.find((existingLocale) => existingLocale.toLowerCase() === locale.toLowerCase() &&
        Array.isArray(langStrings[existingLocale]) &&
        langStrings[existingLocale].length > 0);
    return typeof matchingLocale === "string"
        ? langStrings[matchingLocale][0]
        : null;
}
/**
 * Returns the English (language tag "en") string values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not an English string, omits that value in the array.
 *
 * @param thing The [[Thing]] to read a localised string value from.
 * @param property The Property whose localised string value to return.
 * @returns An array of English string values for the given Property.
 */
function getStringEnglishAll(thing, property) {
    return getStringWithLocaleAll(thing, property, "en");
}
/**
 * Returns the localized string values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not a string of the specified locale, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the localised string values from.
 * @param property The Property whose localised string values to return.
 * @param locale The desired locale for the string values.
 * @returns An array of localised string values for the given Property.
 */
function getStringWithLocaleAll(thing, property, locale) {
    var _a, _b;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const langStrings = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.langStrings) !== null && _b !== void 0 ? _b : {};
    const existingLocales = Object.keys(langStrings);
    const matchingLocale = existingLocales.find((existingLocale) => existingLocale.toLowerCase() === locale.toLowerCase() &&
        Array.isArray(langStrings[existingLocale]) &&
        langStrings[existingLocale].length > 0);
    return typeof matchingLocale === "string"
        ? [...langStrings[matchingLocale]]
        : [];
}
/**
 * Returns all localized string values mapped by the locales for the specified property from the
 * specified [[Thing]] (explicitly filters out non-language string literals).
 *
 * @param thing The [[Thing]] to read the localised string values from.
 * @param property The Property whose localised string values to return.
 * @returns A Map of objects, keyed on locale with the value an array of string values (for that locale).
 */
function getStringByLocaleAll(thing, property) {
    var _a, _b;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const stringsByLocale = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.langStrings) !== null && _b !== void 0 ? _b : {};
    return new Map(Object.entries(stringsByLocale).map(([locale, values]) => [
        locale,
        [...values],
    ]));
}
/**
 * Returns the string value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type string, returns null.
 * If the Property has multiple string values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a string value from.
 * @param property The Property whose string value to return.
 * @returns A string value for the given Property if present, or null if the Property is not present or the value is not of type string.
 */
function getStringNoLocale(thing, property) {
    internal_throwIfNotThing(thing);
    const literalString = getLiteralOfType(thing, property, xmlSchemaTypes.string);
    return literalString;
}
/**
 * Returns the string values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type string, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the string values from.
 * @param property The Property whose string values to return.
 * @returns An array of string values for the given Property.
 */
function getStringNoLocaleAll(thing, property) {
    internal_throwIfNotThing(thing);
    const literalStrings = getLiteralAllOfType(thing, property, xmlSchemaTypes.string);
    return literalStrings;
}
/**
 * @param thing The [[Thing]] to read a NamedNode value from.
 * @param property The given Property for which you want the NamedNode value.
 * @returns A NamedNode value for the given Property, if present, or null otherwise.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#namednode-interface
 */
function getNamedNode(thing, property) {
    const iriString = getIri(thing, property);
    if (iriString === null) {
        return null;
    }
    return DataFactory.namedNode(iriString);
}
/**
 * @param thing The [[Thing]] to read the NamedNode values from.
 * @param property The given Property for which you want the NamedNode values.
 * @returns The NamedNode values for the given Property.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#namednode-interface
 */
function getNamedNodeAll(thing, property) {
    const iriStrings = getIriAll(thing, property);
    return iriStrings.map((iriString) => DataFactory.namedNode(iriString));
}
/**
 * @param thing The [[Thing]] to read a Literal value from.
 * @param property The given Property for which you want the Literal value.
 * @returns A Literal value for the given Property, if present, or null otherwise.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#literal-interface
 */
function getLiteral(thing, property) {
    var _a, _b, _c, _d;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const langStrings = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.langStrings) !== null && _b !== void 0 ? _b : {};
    const locales = Object.keys(langStrings);
    if (locales.length > 0) {
        const nonEmptyLocale = locales.find((locale) => Array.isArray(langStrings[locale]) && langStrings[locale].length > 0);
        if (typeof nonEmptyLocale === "string") {
            return DataFactory.literal(langStrings[nonEmptyLocale][0], nonEmptyLocale);
        }
    }
    const otherLiterals = (_d = (_c = thing.predicates[predicateIri]) === null || _c === void 0 ? void 0 : _c.literals) !== null && _d !== void 0 ? _d : {};
    const dataTypes = Object.keys(otherLiterals);
    if (dataTypes.length > 0) {
        const nonEmptyDataType = dataTypes.find((dataType) => Array.isArray(otherLiterals[dataType]) &&
            otherLiterals[dataType].length > 0);
        if (typeof nonEmptyDataType === "string") {
            return DataFactory.literal(otherLiterals[nonEmptyDataType][0], DataFactory.namedNode(nonEmptyDataType));
        }
    }
    return null;
}
/**
 * @param thing The [[Thing]] to read the Literal values from.
 * @param property The given Property for which you want the Literal values.
 * @returns The Literal values for the given Property.
 * @ignore This should not be needed due to the other get*All() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#literal-interface
 */
function getLiteralAll(thing, property) {
    var _a, _b, _c, _d;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    let literals = [];
    const langStrings = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.langStrings) !== null && _b !== void 0 ? _b : {};
    const locales = Object.keys(langStrings);
    for (const locale of locales) {
        const stringsInLocale = langStrings[locale];
        const localeLiterals = stringsInLocale.map((langString) => DataFactory.literal(langString, locale));
        literals = literals.concat(localeLiterals);
    }
    const otherLiterals = (_d = (_c = thing.predicates[predicateIri]) === null || _c === void 0 ? void 0 : _c.literals) !== null && _d !== void 0 ? _d : {};
    const dataTypes = Object.keys(otherLiterals);
    for (const dataType of dataTypes) {
        const values = otherLiterals[dataType];
        const typeNode = DataFactory.namedNode(dataType);
        const dataTypeLiterals = values.map((value) => DataFactory.literal(value, typeNode));
        literals = literals.concat(dataTypeLiterals);
    }
    return literals;
}
/**
 * @param thing The [[Thing]] to read a raw RDF/JS value from.
 * @param property The given Property for which you want the raw value.
 * @returns A Term for the given Property, if present, or null otherwise.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/
 * @since 0.3.0
 */
function getTerm(thing, property) {
    var _a, _b;
    internal_throwIfNotThing(thing);
    const namedNode = getNamedNode(thing, property);
    if (namedNode !== null) {
        return namedNode;
    }
    const literal = getLiteral(thing, property);
    if (literal !== null) {
        return literal;
    }
    const predicateIri = internal_toIriString(property);
    const blankNodes = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.blankNodes) !== null && _b !== void 0 ? _b : [];
    if (blankNodes.length > 0) {
        const blankNodeValue = isBlankNodeId(blankNodes[0])
            ? getBlankNodeValue(blankNodes[0])
            : undefined;
        return DataFactory.blankNode(blankNodeValue);
    }
    return null;
}
/**
 * @param thing The [[Thing]] to read the raw RDF/JS values from.
 * @param property The given Property for which you want the raw values.
 * @returns The Terms for the given Property.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/
 * @since 0.3.0
 */
function getTermAll(thing, property) {
    var _a, _b;
    internal_throwIfNotThing(thing);
    const namedNodes = getNamedNodeAll(thing, property);
    const literals = getLiteralAll(thing, property);
    const predicateIri = internal_toIriString(property);
    const blankNodeValues = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.blankNodes) !== null && _b !== void 0 ? _b : [];
    const blankNodes = blankNodeValues.map((rawBlankNode) => {
        const blankNodeName = isBlankNodeId(rawBlankNode)
            ? getBlankNodeValue(rawBlankNode)
            : undefined;
        return DataFactory.blankNode(blankNodeName);
    });
    const terms = namedNodes
        .concat(literals)
        .concat(blankNodes);
    return terms;
}
/**
 * @param thing The [Thing]] to read a Literal of the given type from.
 * @param property The given Property for which you want the Literal value.
 * @param literalType Set type of the Literal data.
 * @returns The stringified value for the given Property and type, if present, or null otherwise.
 */
function getLiteralOfType(thing, property, literalType) {
    var _a, _b, _c, _d;
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    return (_d = (_c = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.literals) === null || _b === void 0 ? void 0 : _b[literalType]) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : null;
}
/**
 * @param thing The [Thing]] to read the Literals of the given type from.
 * @param property The given Property for which you want the Literal values.
 * @param literalType Set type of the Literal data.
 * @returns The stringified values for the given Property and type.
 */
function getLiteralAllOfType(thing, property, literalType) {
    var _a, _b, _c;
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const literalsOfType = (_c = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.literals) === null || _b === void 0 ? void 0 : _b[literalType]) !== null && _c !== void 0 ? _c : [];
    return [...literalsOfType];
}

export { getBoolean, getBooleanAll, getDate, getDateAll, getDatetime, getDatetimeAll, getDecimal, getDecimalAll, getInteger, getIntegerAll, getIri, getIriAll, getLiteral, getLiteralAll, getNamedNode, getNamedNodeAll, getPropertyAll, getStringByLocaleAll, getStringEnglish, getStringEnglishAll, getStringNoLocale, getStringNoLocaleAll, getStringWithLocale, getStringWithLocaleAll, getTerm, getTermAll, getTime, getTimeAll, getUrl, getUrlAll };
