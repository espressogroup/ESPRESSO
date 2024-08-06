import { internal_isValidUrl, normalizeLocale, xmlSchemaTypes, deserializeBoolean, deserializeDatetime, deserializeDate, deserializeTime, deserializeDecimal, deserializeInteger } from '../datatypes.mjs';
import { internal_throwIfNotThing } from './thing.internal.mjs';
import { ValidPropertyUrlExpectedError, isThing, ValidValueUrlExpectedError, asIri } from './thing.mjs';
import { internal_toIriString } from '../interfaces.internal.mjs';
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
function removeAll(thing, property) {
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const newPredicates = { ...thing.predicates };
    delete newPredicates[predicateIri];
    return freeze({
        ...thing,
        predicates: freeze(newPredicates),
    });
}
/**
 * Create a new Thing with the given URL removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a URL value from.
 * @param property Property for which to remove the given URL value.
 * @param value URL to remove from `thing` for the given `Property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
const removeUrl = (thing, property, value) => {
    var _a, _b, _c;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    if (!isThing(value) && !internal_isValidUrl(value)) {
        throw new ValidValueUrlExpectedError(value);
    }
    const iriToRemove = isThing(value)
        ? asIri(value)
        : internal_toIriString(value);
    const updatedNamedNodes = freeze((_c = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.namedNodes) === null || _b === void 0 ? void 0 : _b.filter((namedNode) => namedNode.toLowerCase() !== iriToRemove.toLowerCase())) !== null && _c !== void 0 ? _c : []);
    const updatedPredicate = freeze({
        ...thing.predicates[predicateIri],
        namedNodes: updatedNamedNodes,
    });
    const updatedPredicates = freeze({
        ...thing.predicates,
        [predicateIri]: updatedPredicate,
    });
    return freeze({
        ...thing,
        predicates: updatedPredicates,
    });
};
/** @hidden Alias of [[removeUrl]] for those who prefer IRI terminology. */
const removeIri = removeUrl;
/**
 * Create a new Thing with the given boolean removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a boolean value from.
 * @param property Property for which to remove the given boolean value.
 * @param value Boolean to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
const removeBoolean = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return removeLiteralMatching(thing, property, xmlSchemaTypes.boolean, (foundBoolean) => deserializeBoolean(foundBoolean) === value);
};
/**
 * Create a new Thing with the given datetime removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a datetime value from.
 * @param property Property for which to remove the given datetime value.
 * @param value Datetime to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
const removeDatetime = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return removeLiteralMatching(thing, property, xmlSchemaTypes.dateTime, (foundDatetime) => { var _a; return ((_a = deserializeDatetime(foundDatetime)) === null || _a === void 0 ? void 0 : _a.getTime()) === value.getTime(); });
};
/**
 * Create a new Thing with the given date removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a date value from.
 * @param property Property for which to remove the given date value.
 * @param value Date to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 * @since 1.10.0
 */
const removeDate = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return removeLiteralMatching(thing, property, xmlSchemaTypes.date, function (foundDate) {
        const deserializedDate = deserializeDate(foundDate);
        if (deserializedDate) {
            return (deserializedDate.getFullYear() === value.getFullYear() &&
                deserializedDate.getMonth() === value.getMonth() &&
                deserializedDate.getUTCDate() === value.getUTCDate());
        }
        return false;
    });
};
/**
 * Create a new Thing with the given datetime removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a datetime value from.
 * @param property Property for which to remove the given datetime value.
 * @param value Time to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 * @since 1.10.0
 */
const removeTime = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return removeLiteralMatching(thing, property, xmlSchemaTypes.time, function (foundTime) {
        const deserializedTime = deserializeTime(foundTime);
        if (deserializedTime) {
            return (deserializedTime.hour === value.hour &&
                deserializedTime.minute === value.minute &&
                deserializedTime.second === value.second &&
                deserializedTime.millisecond === value.millisecond &&
                deserializedTime.timezoneHourOffset === value.timezoneHourOffset &&
                deserializedTime.timezoneMinuteOffset === value.timezoneMinuteOffset);
        }
        return false;
    });
};
/**
 * Create a new Thing with the given decimal removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a decimal value from.
 * @param property Property for which to remove the given decimal value.
 * @param value Decimal to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
const removeDecimal = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return removeLiteralMatching(thing, property, xmlSchemaTypes.decimal, (foundDecimal) => deserializeDecimal(foundDecimal) === value);
};
/**
 * Create a new Thing with the given integer removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove an integer value from.
 * @param property Property for which to remove the given integer value.
 * @param value Integer to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
const removeInteger = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return removeLiteralMatching(thing, property, xmlSchemaTypes.integer, (foundInteger) => deserializeInteger(foundInteger) === value);
};
/**
 * Create a new Thing with the given English string removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a localised string value from.
 * @param property Property for which to remove the given localised string value.
 * @param value String to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 * @since 1.13.0
 */
function removeStringEnglish(thing, property, value) {
    return removeStringWithLocale(thing, property, value, "en");
}
/**
 * Create a new Thing with the given localised string removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove a localised string value from.
 * @param property Property for which to remove the given localised string value.
 * @param value String to remove from `thing` for the given `property`.
 * @param locale Locale of the string to remove.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
function removeStringWithLocale(thing, property, value, locale) {
    var _a, _b;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const existingLangStrings = (_b = (_a = thing.predicates[predicateIri]) === null || _a === void 0 ? void 0 : _a.langStrings) !== null && _b !== void 0 ? _b : {};
    const matchingLocale = Object.keys(existingLangStrings).find((existingLocale) => normalizeLocale(existingLocale) === normalizeLocale(locale) &&
        Array.isArray(existingLangStrings[existingLocale]) &&
        existingLangStrings[existingLocale].length > 0);
    if (typeof matchingLocale !== "string") {
        // Nothing to remove.
        return thing;
    }
    const existingStringsInLocale = existingLangStrings[matchingLocale];
    const updatedStringsInLocale = freeze(existingStringsInLocale.filter((existingString) => existingString !== value));
    const updatedLangStrings = freeze({
        ...existingLangStrings,
        [matchingLocale]: updatedStringsInLocale,
    });
    const updatedPredicate = freeze({
        ...thing.predicates[predicateIri],
        langStrings: updatedLangStrings,
    });
    const updatedPredicates = freeze({
        ...thing.predicates,
        [predicateIri]: updatedPredicate,
    });
    return freeze({
        ...thing,
        predicates: updatedPredicates,
    });
}
/**
 * Create a new Thing with the given unlocalised string removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to remove an unlocalised string value from.
 * @param property Property for which to remove the given string value.
 * @param value String to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
const removeStringNoLocale = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return removeLiteralMatching(thing, property, xmlSchemaTypes.string, (foundString) => foundString === value);
};
/**
 * @ignore This should not be needed due to the other remove*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing Thing to remove a NamedNode value from.
 * @param property Property for which to remove the given NamedNode value.
 * @param value NamedNode to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
function removeNamedNode(thing, property, value) {
    return removeUrl(thing, property, value.value);
}
/**
 * @ignore This should not be needed due to the other remove*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing Thing to remove a Literal value from.
 * @param property Property for which to remove the given Literal value.
 * @param value Literal to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
function removeLiteral(thing, property, value) {
    var _a, _b, _c;
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const typeIri = value.datatype.value;
    if (typeIri === xmlSchemaTypes.langString) {
        return removeStringWithLocale(thing, property, value.value, value.language);
    }
    const predicateIri = internal_toIriString(property);
    const existingPredicateValues = (_a = thing.predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
    const existingLiterals = (_b = existingPredicateValues.literals) !== null && _b !== void 0 ? _b : {};
    const existingValuesOfType = (_c = existingLiterals[typeIri]) !== null && _c !== void 0 ? _c : [];
    const updatedValues = freeze(existingValuesOfType.filter((existingValue) => existingValue !== value.value));
    const updatedLiterals = freeze({
        ...existingLiterals,
        [typeIri]: updatedValues,
    });
    const updatedPredicate = freeze({
        ...existingPredicateValues,
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
/**
 * @param thing Thing to remove a Literal value from.
 * @param property Property for which to remove the given Literal value.
 * @param type Data type that the Literal should be stored as.
 * @param matcher Function that returns true if the given value is an equivalent serialisation of the value to remove. For example, when removing a `false` boolean, the matcher should return true for both "0" and "false".
 */
function removeLiteralMatching(thing, property, type, matcher) {
    var _a, _b, _c;
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    const predicateIri = internal_toIriString(property);
    const existingPredicateValues = (_a = thing.predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
    const existingLiterals = (_b = existingPredicateValues.literals) !== null && _b !== void 0 ? _b : {};
    const existingValuesOfType = (_c = existingLiterals[type]) !== null && _c !== void 0 ? _c : [];
    const updatedValues = freeze(existingValuesOfType.filter((existingValue) => !matcher(existingValue)));
    const updatedLiterals = freeze({
        ...existingLiterals,
        [type]: updatedValues,
    });
    const updatedPredicate = freeze({
        ...existingPredicateValues,
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

export { removeAll, removeBoolean, removeDate, removeDatetime, removeDecimal, removeInteger, removeIri, removeLiteral, removeNamedNode, removeStringEnglish, removeStringNoLocale, removeStringWithLocale, removeTime, removeUrl };
