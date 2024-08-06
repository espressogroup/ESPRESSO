import type { Quad_Object, NamedNode, Literal } from "@rdfjs/types";
import type { Thing, Url, UrlString } from "../interfaces";
import type { Time } from "../datatypes";
/**
 * Returns the URLs of all Properties that the given [[Thing ]]has values for.b
 *
 * @param thing The [[Thing]] of which to get that Property URLs that have a value.
 * @returns The URLs of the Properties for which values are defined for the given Thing.
 * @hidden This is an advanced API that should not be needed for most Solid use cases. If you do find yourself needing this, please file a feature request sharing your use case.
 */
export declare function getPropertyAll(thing: Thing): UrlString[];
/**
 * Returns the URL value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type URL, returns null.
 * If the Property has multiple URL values, returns one of its URL values.
 *
 * @param thing The [[Thing]] to read a URL value from.
 * @param property The Property whose URL value to return.
 * @returns A URL value for the given Property if present, or null if the Property is not present or the value is not of type URL.
 */
export declare function getUrl(thing: Thing, property: Url | UrlString): UrlString | null;
/** @hidden Alias of [[getUrl]] for those who prefer IRI terminology. */
export declare const getIri: typeof getUrl;
/**
 * Returns the URL values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type URL, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the URL values from.
 * @param property The Property whose URL values to return.
 * @returns An array of URL values for the given Property.
 */
export declare function getUrlAll(thing: Thing, property: Url | UrlString): UrlString[];
/** @hidden Alias of [[getUrlAll]] for those who prefer IRI terminology. */
export declare const getIriAll: typeof getUrlAll;
/**
 * Returns the boolean value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type boolean, returns null.
 * If the Property has multiple boolean values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a boolean value from.
 * @param property The Property whose boolean value to return.
 * @returns A boolean value for the given Property if present, or null if the Property is not present or the value is not of type boolean.
 */
export declare function getBoolean(thing: Thing, property: Url | UrlString): boolean | null;
/**
 * Returns the boolean values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type boolean, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the boolean values from.
 * @param property The Property whose boolean values to return.
 * @returns An array of boolean values for the given Property.
 */
export declare function getBooleanAll(thing: Thing, property: Url | UrlString): boolean[];
/**
 * Returns the datetime value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type datetime, returns null.
 * If the Property has multiple datetime values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a datetime value from.
 * @param property The Property whose datetime value to return.
 * @returns A datetime value for the given Property if present, or null if the Property is not present or the value is not of type datetime.
 */
export declare function getDatetime(thing: Thing, property: Url | UrlString): Date | null;
/**
 * Returns the datetime values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type datetime, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the datetime values from.
 * @param property The Property whose datetime values to return.
 * @returns An array of datetime values for the given Property.
 */
export declare function getDatetimeAll(thing: Thing, property: Url | UrlString): Date[];
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
export declare function getDate(thing: Thing, property: Url | UrlString): Date | null;
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
export declare function getDateAll(thing: Thing, property: Url | UrlString): Date[];
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
export declare function getTime(thing: Thing, property: Url | UrlString): Time | null;
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
export declare function getTimeAll(thing: Thing, property: Url | UrlString): Time[];
/**
 * Returns the decimal value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type decimal, returns null.
 * If the Property has multiple decimal values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a decimal value from.
 * @param property The Property whose decimal value to return.
 * @returns A decimal value for the given Property if present, or null if the Property is not present or the value is not of type decimal.
 */
export declare function getDecimal(thing: Thing, property: Url | UrlString): number | null;
/**
 * Returns the decimal values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type decimal, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the decimal values from.
 * @param property The Property whose decimal values to return.
 * @returns An array of decimal values for the given Property.
 */
export declare function getDecimalAll(thing: Thing, property: Url | UrlString): number[];
/**
 * Returns the integer value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type integer, returns null.
 * If the Property has multiple integer values, returns one of its values.
 *
 * @param thing The [[Thing]] to read an integer value from.
 * @param property The Property whose integer value to return.
 * @returns A integer value for the given Property if present, or null if the Property is not present or the value is not of type datetime.
 */
export declare function getInteger(thing: Thing, property: Url | UrlString): number | null;
/**
 * Returns the integer values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type integer, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the integer values from.
 * @param property The Property whose integer values to return.
 * @returns An array of integer values for the given Property.
 */
export declare function getIntegerAll(thing: Thing, property: Url | UrlString): number[];
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
export declare function getStringEnglish(thing: Thing, property: Url | UrlString): string | null;
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
export declare function getStringWithLocale(thing: Thing, property: Url | UrlString, locale: string): string | null;
/**
 * Returns the English (language tag "en") string values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not an English string, omits that value in the array.
 *
 * @param thing The [[Thing]] to read a localised string value from.
 * @param property The Property whose localised string value to return.
 * @returns An array of English string values for the given Property.
 */
export declare function getStringEnglishAll(thing: Thing, property: Url | UrlString): string[];
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
export declare function getStringWithLocaleAll(thing: Thing, property: Url | UrlString, locale: string): string[];
/**
 * Returns all localized string values mapped by the locales for the specified property from the
 * specified [[Thing]] (explicitly filters out non-language string literals).
 *
 * @param thing The [[Thing]] to read the localised string values from.
 * @param property The Property whose localised string values to return.
 * @returns A Map of objects, keyed on locale with the value an array of string values (for that locale).
 */
export declare function getStringByLocaleAll(thing: Thing, property: Url | UrlString): Map<string, string[]>;
/**
 * Returns the string value of the specified Property from a [[Thing]].
 * If the Property is not present or its value is not of type string, returns null.
 * If the Property has multiple string values, returns one of its values.
 *
 * @param thing The [[Thing]] to read a string value from.
 * @param property The Property whose string value to return.
 * @returns A string value for the given Property if present, or null if the Property is not present or the value is not of type string.
 */
export declare function getStringNoLocale(thing: Thing, property: Url | UrlString): string | null;
/**
 * Returns the string values of the specified Property from a [[Thing]].
 * If the Property is not present, returns an empty array.
 * If the Property's value is not of type string, omits that value in the array.
 *
 * @param thing The [[Thing]] to read the string values from.
 * @param property The Property whose string values to return.
 * @returns An array of string values for the given Property.
 */
export declare function getStringNoLocaleAll(thing: Thing, property: Url | UrlString): string[];
/**
 * @param thing The [[Thing]] to read a NamedNode value from.
 * @param property The given Property for which you want the NamedNode value.
 * @returns A NamedNode value for the given Property, if present, or null otherwise.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#namednode-interface
 */
export declare function getNamedNode(thing: Thing, property: Url | UrlString): NamedNode | null;
/**
 * @param thing The [[Thing]] to read the NamedNode values from.
 * @param property The given Property for which you want the NamedNode values.
 * @returns The NamedNode values for the given Property.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#namednode-interface
 */
export declare function getNamedNodeAll(thing: Thing, property: Url | UrlString): NamedNode[];
/**
 * @param thing The [[Thing]] to read a Literal value from.
 * @param property The given Property for which you want the Literal value.
 * @returns A Literal value for the given Property, if present, or null otherwise.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#literal-interface
 */
export declare function getLiteral(thing: Thing, property: Url | UrlString): Literal | null;
/**
 * @param thing The [[Thing]] to read the Literal values from.
 * @param property The given Property for which you want the Literal values.
 * @returns The Literal values for the given Property.
 * @ignore This should not be needed due to the other get*All() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/#literal-interface
 */
export declare function getLiteralAll(thing: Thing, property: Url | UrlString): Literal[];
/**
 * @param thing The [[Thing]] to read a raw RDF/JS value from.
 * @param property The given Property for which you want the raw value.
 * @returns A Term for the given Property, if present, or null otherwise.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/
 * @since 0.3.0
 */
export declare function getTerm(thing: Thing, property: Url | UrlString): Quad_Object | null;
/**
 * @param thing The [[Thing]] to read the raw RDF/JS values from.
 * @param property The given Property for which you want the raw values.
 * @returns The Terms for the given Property.
 * @ignore This should not be needed due to the other get*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @see https://rdf.js.org/data-model-spec/
 * @since 0.3.0
 */
export declare function getTermAll(thing: Thing, property: Url | UrlString): Quad_Object[];
