import { DataFactory } from 'n3';
import { isLocalNodeIri, getLocalNodeName } from './rdf.internal.mjs';
import { internal_toIriString } from './interfaces.internal.mjs';

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
 * IRIs of the XML Schema data types we support
 */
const xmlSchemaTypes = {
    boolean: "http://www.w3.org/2001/XMLSchema#boolean",
    dateTime: "http://www.w3.org/2001/XMLSchema#dateTime",
    date: "http://www.w3.org/2001/XMLSchema#date",
    time: "http://www.w3.org/2001/XMLSchema#time",
    decimal: "http://www.w3.org/2001/XMLSchema#decimal",
    integer: "http://www.w3.org/2001/XMLSchema#integer",
    string: "http://www.w3.org/2001/XMLSchema#string",
    langString: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
};
/**
 * @internal
 * @param value Value to serialise.
 * @returns String representation of `value`.
 * @see https://www.w3.org/TR/xmlschema-2/#boolean-lexical-representation
 */
function serializeBoolean(value) {
    return value ? "true" : "false";
}
/**
 * @internal
 * @param value Value to deserialise.
 * @returns Deserialized boolean, or null if the given value is not a valid serialised boolean.
 * @see https://www.w3.org/TR/xmlschema-2/#boolean-lexical-representation
 */
function deserializeBoolean(value) {
    if (value === "true" || value === "1") {
        return true;
    }
    if (value === "false" || value === "0") {
        return false;
    }
    return null;
}
/**
 * @internal
 * @param value Value to serialise.
 * @returns String representation of `value` in UTC.
 * @see https://www.w3.org/TR/xmlschema-2/#time-lexical-repr
 */
function serializeTime(value) {
    let millisecondString;
    let timezoneString;
    if (value.millisecond) {
        if (value.millisecond < 10) {
            millisecondString = `00${value.millisecond}`;
        }
        else if (value.millisecond < 100) {
            millisecondString = `0${value.millisecond}`;
        }
        else {
            millisecondString = value.millisecond;
        }
    }
    if (typeof value.timezoneHourOffset === "number") {
        const timezoneFormatted = Math.abs(value.timezoneHourOffset) < 10
            ? `0${Math.abs(value.timezoneHourOffset)}`
            : Math.abs(value.timezoneHourOffset);
        timezoneString =
            value.timezoneHourOffset >= 0
                ? `+${timezoneFormatted}`
                : `-${timezoneFormatted}`;
        if (value.timezoneMinuteOffset) {
            timezoneString = `${timezoneString}:${value.timezoneMinuteOffset < 10
                ? `0${value.timezoneMinuteOffset}`
                : value.timezoneMinuteOffset}`;
        }
        else {
            timezoneString += ":00";
        }
    }
    return `${value.hour < 10 ? `0${value.hour}` : value.hour}:${value.minute < 10 ? `0${value.minute}` : value.minute}:${value.second < 10 ? `0${value.second}` : value.second}${value.millisecond ? `.${millisecondString}` : ""}${timezoneString || ""}`;
}
/**
 * @internal
 * @param literalString Value to deserialise.
 * @returns Deserialized time, or null if the given value is not a valid serialised datetime.
 * @see https://www.w3.org/TR/xmlschema-2/#time-lexical-repr
 */
function deserializeTime(literalString) {
    // Time in the format described at
    // https://www.w3.org/TR/xmlschema-2/#time-lexical-repr
    // \d\d:\d\d:\d\d - Two digits for the hour, minute and second, respectively, separated by a `:`.
    //                  Example: "13:37:42".
    // (\.\d+)? - Optionally a `.` followed by one or more digits representing milliseconds.
    //            Example: ".1337".
    // (Z|(\+|-)\d\d:\d\d) - The letter Z indicating UTC, or a `+` or `-` followed by two digits for
    //                       the hour offset and two for the minute offset, separated by a `:`.
    //                       Example: "+13:37".
    const timeRegEx = /\d\d:\d\d:\d\d(\.\d+)?(Z|(\+|-)\d\d:\d\d)?/;
    if (!timeRegEx.test(literalString)) {
        return null;
    }
    const [timeString, timezoneString] = splitTimeFromTimezone(literalString);
    const [hourString, minuteString, timeRest] = timeString.split(":");
    let utcHours = Number.parseInt(hourString, 10);
    let utcMinutes = Number.parseInt(minuteString, 10);
    const [secondString, optionalMillisecondString] = timeRest.split(".");
    const utcSeconds = Number.parseInt(secondString, 10);
    const utcMilliseconds = optionalMillisecondString
        ? Number.parseInt(optionalMillisecondString, 10)
        : undefined;
    if (utcMinutes >= 60) {
        utcHours += 1;
        utcMinutes -= 60;
    }
    const deserializedTime = {
        hour: utcHours,
        minute: utcMinutes,
        second: utcSeconds,
    };
    if (typeof utcMilliseconds === "number") {
        deserializedTime.millisecond = utcMilliseconds;
    }
    if (typeof timezoneString === "string") {
        const [hourOffset, minuteOffset] = getTimezoneOffsets(timezoneString);
        if (typeof hourOffset !== "number" ||
            hourOffset > 24 ||
            typeof minuteOffset !== "number" ||
            minuteOffset > 59) {
            return null;
        }
        deserializedTime.timezoneHourOffset = hourOffset;
        deserializedTime.timezoneMinuteOffset = minuteOffset;
    }
    return deserializedTime;
}
/**
 * @internal
 * @param value Value to serialise.
 * @returns String representation of `value`.
 * @see https://www.w3.org/TR/xmlschema-2/#dateTime-lexical-representation
 */
function serializeDatetime(value) {
    // Although the XML Schema DateTime is not _exactly_ an ISO 8601 string
    // (see https://www.w3.org/TR/xmlschema-2/#deviantformats),
    // the deviations only affect the parsing, not the serialisation.
    // Therefore, we can just use .toISOString():
    return value.toISOString();
}
/**
 * @internal
 * @param value Value to deserialise.
 * @returns Deserialized datetime, or null if the given value is not a valid serialised datetime.
 * @see https://www.w3.org/TR/xmlschema-2/#dateTime-lexical-representation
 */
function deserializeDatetime(literalString) {
    // DateTime in the format described at
    // https://www.w3.org/TR/xmlschema-2/#dateTime-lexical-representation
    // (without constraints on the value).
    // -? - An optional leading `-`.
    // \d{4,}- - Four or more digits followed by a `-` representing the year. Example: "3000-".
    // \d\d-\d\d - Two digits representing the month and two representing the day of the month,
    //             separated by a `-`. Example: "11-03".
    // T - The letter T, separating the date from the time.
    // \d\d:\d\d:\d\d - Two digits for the hour, minute and second, respectively, separated by a `:`.
    //                  Example: "13:37:42".
    // (\.\d+)? - Optionally a `.` followed by one or more digits representing milliseconds.
    //            Example: ".1337".
    // (Z|(\+|-)\d\d:\d\d) - The letter Z indicating UTC, or a `+` or `-` followed by two digits for
    //                       the hour offset and two for the minute offset, separated by a `:`.
    //                       Example: "+13:37".
    const datetimeRegEx = /-?\d{4,}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(Z|(\+|-)\d\d:\d\d)?/;
    if (!datetimeRegEx.test(literalString)) {
        return null;
    }
    const [signedDateString, rest] = literalString.split("T");
    // The date string can optionally be prefixed with `-`,
    // in which case the year is negative:
    const [yearMultiplier, dateString] = signedDateString.charAt(0) === "-"
        ? [-1, signedDateString.substring(1)]
        : [1, signedDateString];
    const [yearString, monthString, dayString] = dateString.split("-");
    const utcFullYear = Number.parseInt(yearString, 10) * yearMultiplier;
    const utcMonth = Number.parseInt(monthString, 10) - 1;
    const utcDate = Number.parseInt(dayString, 10);
    const [timeString, timezoneString] = splitTimeFromTimezone(rest);
    const [hourOffset, minuteOffset] = typeof timezoneString === "string"
        ? getTimezoneOffsets(timezoneString)
        : [0, 0];
    const [hourString, minuteString, timeRest] = timeString.split(":");
    const utcHours = Number.parseInt(hourString, 10) + hourOffset;
    const utcMinutes = Number.parseInt(minuteString, 10) + minuteOffset;
    const [secondString, optionalMillisecondString] = timeRest.split(".");
    const utcSeconds = Number.parseInt(secondString, 10);
    const utcMilliseconds = optionalMillisecondString
        ? Number.parseInt(optionalMillisecondString, 10)
        : 0;
    const date = new Date(Date.UTC(utcFullYear, utcMonth, utcDate, utcHours, utcMinutes, utcSeconds, utcMilliseconds));
    // For the year, values from 0 to 99 map to the years 1900 to 1999. Since the serialisation
    // always writes out the years fully, we should correct this to actually map to the years 0 to 99.
    // See
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#Individual_date_and_time_component_values
    if (utcFullYear >= 0 && utcFullYear < 100) {
        // Note that we base it on the calculated year, rather than the year that was actually read.
        // This is because the year might actually differ from the value listed in the serialisation,
        // i.e. when moving the timezone offset to UTC pushes it into a different year:
        date.setUTCFullYear(date.getUTCFullYear() - 1900);
    }
    return date;
}
/**
 * @internal
 * @param value Value to serialise.
 * @returns String representation of `value`.
 * @see https://www.w3.org/TR/xmlschema-2/#date-lexical-representation
 */
function serializeDate(value) {
    const year = value.getFullYear();
    const month = value.getMonth() + 1;
    const day = value.getDate();
    const [, timezone] = splitTimeFromTimezone(value.toISOString());
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}${timezone}`;
}
/**
 * @internal
 * @param value Value to deserialise.
 * @returns Deserialized datetime, or null if the given value is not a valid serialised datetime.
 * @see https://www.w3.org/TR/xmlschema-2/#date-lexical-representation
 */
function deserializeDate(literalString) {
    // Date in the format described at
    // https://www.w3.org/TR/xmlschema-2/#date-lexical-representation
    // (without constraints on the value).
    // -? - An optional leading `-`.
    // \d{4,}- - Four or more digits followed by a `-` representing the year. Example: "3000-".
    // \d\d-\d\d - Two digits representing the month and two representing the day of the month,
    //             separated by a `-`. Example: "11-03".
    // (Z|(\+|-)\d\d:\d\d) - Optionally, the letter Z indicating UTC, or a `+` or `-` followed by two digits for
    //                       the hour offset and two for the minute offset, separated by a `:`.
    //                       Example: "+13:37".
    const dateRegEx = /-?\d{4,}-\d\d-\d\d(Z|(\+|-)\d\d:\d\d)?/;
    if (!dateRegEx.test(literalString)) {
        return null;
    }
    const signedDateString = literalString;
    // The date string can optionally be prefixed with `-`,
    // in which case the year is negative:
    const [yearMultiplier, dateString] = signedDateString.charAt(0) === "-"
        ? [-1, signedDateString.substring(1)]
        : [1, signedDateString];
    const [yearString, monthString, dayAndTimezoneString] = dateString.split("-");
    const dayString = dayAndTimezoneString.length > 2
        ? dayAndTimezoneString.substring(0, 2)
        : dayAndTimezoneString;
    const utcFullYear = Number.parseInt(yearString, 10) * yearMultiplier;
    const utcMonth = Number.parseInt(monthString, 10) - 1;
    const utcDate = Number.parseInt(dayString, 10);
    const hour = 12;
    // setting at 12:00 avoids all timezones
    const date = new Date(Date.UTC(utcFullYear, utcMonth, utcDate, hour));
    // For the year, values from 0 to 99 map to the years 1900 to 1999. Since the serialisation
    // always writes out the years fully, we should correct this to actually map to the years 0 to 99.
    // See
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#Individual_date_and_time_component_values
    if (utcFullYear >= 0 && utcFullYear < 100) {
        date.setUTCFullYear(date.getUTCFullYear() - 1900);
    }
    return date;
}
/**
 * @param timeString An XML Schema time string.
 * @returns A tuple [timeString, timezoneString].
 * @see https://www.w3.org/TR/xmlschema-2/#time-lexical-repr
 */
function splitTimeFromTimezone(timeString) {
    if (timeString.endsWith("Z")) {
        return [timeString.substring(0, timeString.length - 1), "Z"];
    }
    const splitOnPlus = timeString.split("+");
    const splitOnMinus = timeString.split("-");
    if (splitOnPlus.length === 1 && splitOnMinus.length === 1) {
        return [splitOnPlus[0], undefined];
    }
    return splitOnPlus.length > splitOnMinus.length
        ? [splitOnPlus[0], `+${splitOnPlus[1]}`]
        : [splitOnMinus[0], `-${splitOnMinus[1]}`];
}
/**
 * @param timezoneString Lexical representation of a time zone in XML Schema.
 * @returns A tuple of the hour and minute offset of the time zone.
 * @see https://www.w3.org/TR/xmlschema-2/#dateTime-timezones
 */
function getTimezoneOffsets(timezoneString) {
    if (timezoneString === "Z") {
        return [0, 0];
    }
    const multiplier = timezoneString.charAt(0) === "+" ? 1 : -1;
    const [hourString, minuteString] = timezoneString.substring(1).split(":");
    const hours = Number.parseInt(hourString, 10);
    const minutes = Number.parseInt(minuteString, 10);
    return [hours * multiplier, minutes * multiplier];
}
/**
 * @internal
 * @param value Value to serialise.
 * @returns String representation of `value`.
 * @see https://www.w3.org/TR/xmlschema-2/#decimal-lexical-representation
 */
function serializeDecimal(value) {
    return value.toString();
}
/**
 * @internal
 * @param value Value to deserialise.
 * @returns Deserialized decimal, or null if the given value is not a valid serialised decimal.
 * @see https://www.w3.org/TR/xmlschema-2/#decimal-lexical-representation
 */
function deserializeDecimal(literalString) {
    const deserialized = Number.parseFloat(literalString);
    if (Number.isNaN(deserialized)) {
        return null;
    }
    return deserialized;
}
/**
 * @internal
 * @param value Value to serialise.
 * @returns String representation of `value`.
 */
function serializeInteger(value) {
    return value.toString();
}
/**
 * @internal
 * @param value Value to deserialise.
 * @returns Deserialized integer, or null if the given value is not a valid serialised integer.
 */
function deserializeInteger(literalString) {
    const deserialized = Number.parseInt(literalString, 10);
    if (Number.isNaN(deserialized)) {
        return null;
    }
    return deserialized;
}
/**
 * @internal
 * @param locale Locale to transform into a consistent format.
 */
function normalizeLocale(locale) {
    return locale.toLowerCase();
}
/**
 * @internal Library users shouldn't need to be exposed to raw NamedNodes.
 * @param value The value that might or might not be a Named Node.
 * @returns Whether `value` is a Named Node.
 */
function isNamedNode(value) {
    return isTerm(value) && value.termType === "NamedNode";
}
/**
 * @internal Library users shouldn't need to be exposed to raw Literals.
 * @param value The value that might or might not be a Literal.
 * @returns Whether `value` is a Literal.
 */
function isLiteral(value) {
    return isTerm(value) && value.termType === "Literal";
}
/**
 * @internal Library users shouldn't need to be exposed to raw Terms.
 * @param value The value that might or might not be a Term.
 * @returns Whether `value` is a Term.
 */
function isTerm(value) {
    return (value !== null &&
        typeof value === "object" &&
        typeof value.termType === "string" &&
        typeof value.value === "string" &&
        typeof value.equals === "function");
}
/**
 * @internal Library users shouldn't need to be exposed to LocalNodes.
 * @param value The value that might or might not be a Node with no known IRI yet.
 * @returns Whether `value` is a Node with no known IRI yet.
 */
function isLocalNode(value) {
    return isNamedNode(value) && isLocalNodeIri(value.value);
}
/**
 * Ensure that a given value is a valid URL.
 *
 * @internal Library users shouldn't need to be exposed to raw URLs.
 * @param iri The value of which to verify that it is a valid URL.
 */
function internal_isValidUrl(iri) {
    const iriString = internal_toIriString(iri);
    // If the runtime environment supports URL, instantiate one.
    // If the given IRI is not a valid URL, it will throw an error.
    // See: https://developer.mozilla.org/en-US/docs/Web/API/URL
    /* istanbul ignore if [URL is available in our testing environment, so we cannot test the alternative] */
    if (typeof URL !== "function") {
        // If we can't validate the URL, do not throw an error:
        return true;
    }
    try {
        // eslint-disable-next-line no-new
        new URL(iriString);
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * @internal Utility method; library users should not need to interact with LocalNodes directly.
 * @param localNode The LocalNode to resolve to a NamedNode.
 * @param resourceIri The Resource in which the Node will be saved.
 */
function resolveIriForLocalNode(localNode, resourceIri) {
    return DataFactory.namedNode(resolveLocalIri(getLocalNodeName(localNode.value), resourceIri));
}
/**
 * @internal API for internal use only.
 * @param name The name identifying a Thing.
 * @param resourceIri The Resource in which the Thing can be found.
 */
function resolveLocalIri(name, resourceIri) {
    /* istanbul ignore if [The URL interface is available in the testing environment, so we cannot test this] */
    if (typeof URL !== "function") {
        throw new Error("The URL interface is not available, so an IRI cannot be determined.");
    }
    const thingIri = new URL(resourceIri);
    thingIri.hash = name;
    return thingIri.href;
}

export { deserializeBoolean, deserializeDate, deserializeDatetime, deserializeDecimal, deserializeInteger, deserializeTime, internal_isValidUrl, isLiteral, isLocalNode, isNamedNode, isTerm, normalizeLocale, resolveIriForLocalNode, resolveLocalIri, serializeBoolean, serializeDate, serializeDatetime, serializeDecimal, serializeInteger, serializeTime, xmlSchemaTypes };
