import type { Literal, NamedNode, Quad_Object } from "@rdfjs/types";
import type { Thing, Url, UrlString } from "../interfaces";
import type { Time } from "../datatypes";
/**
 * Create a new Thing with existing values replaced by the given URL for the given Property.
 *
 * To preserve existing values, see [[addUrl]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set a URL value on.
 * @param property Property for which to set the given URL value.
 * @param url URL to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare const setUrl: SetOfType<Url | UrlString | Thing>;
/** @hidden Alias of [[setUrl]] for those who prefer IRI terminology. */
export declare const setIri: SetOfType<string | Url | Readonly<{
    type: "Subject";
    url: string;
    predicates: Readonly<Record<string, Readonly<Partial<{
        literals: Readonly<Record<string, readonly string[]>>;
        langStrings: Readonly<Record<string, readonly string[]>>;
        namedNodes: readonly string[];
        blankNodes: readonly (`_:${string}` | Readonly<Record<string, Readonly<Partial<any>>>>)[];
    }>>>>;
}>>;
/**
 * Create a new Thing with existing values replaced by the given boolean for the given Property.
 *
 * To preserve existing values, see [[addBoolean]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set a boolean value on.
 * @param property Property for which to set the given boolean value.
 * @param value Boolean to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare const setBoolean: SetOfType<boolean>;
/**
 * Create a new Thing with existing values replaced by the given datetime for the given Property.
 *
 * To preserve existing values, see [[addDatetime]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set an datetime value on.
 * @param property Property for which to set the given datetime value.
 * @param value Datetime to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare const setDatetime: SetOfType<Date>;
/**
 * Create a new Thing with existing values replaced by the given date for the given Property.
 *
 * To preserve existing values, see [[addDate]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set an date value on.
 * @param property Property for which to set the given date value.
 * @param value Date to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 * @since 1.10.0
 */
export declare const setDate: SetOfType<Date>;
/**
 * Create a new Thing with existing values replaced by the given time for the given Property.
 *
 * To preserve existing values, see [[addTime]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set an time value on.
 * @param property Property for which to set the given time value.
 * @param value time to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 * @since 1.10.0
 */
export declare const setTime: SetOfType<Time>;
/**
 * Create a new Thing with existing values replaced by the given decimal for the given Property.
 *
 * To preserve existing values, see [[addDecimal]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set a decimal value on.
 * @param property Property for which to set the given decimal value.
 * @param value Decimal to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare const setDecimal: SetOfType<number>;
/**
 * Create a new Thing with existing values replaced by the given integer for the given Property.
 *
 * To preserve existing values, see [[addInteger]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set an integer value on.
 * @param property Property for which to set the given integer value.
 * @param value Integer to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare const setInteger: SetOfType<number>;
/**
 * Create a new Thing with existing values replaced by the given English string for the given
 * Property.
 *
 * To preserve existing values, see [[addStringEnglish]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set a localised string value on.
 * @param property Property for which to set the given localised string value.
 * @param value Localised string to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 * @since 1.13.0
 */
export declare function setStringEnglish<T extends Thing>(thing: T, property: Url | UrlString, value: string): T;
/**
 * Create a new Thing with existing values replaced by the given localised string for the given Property.
 *
 * To preserve existing values, see [[addStringWithLocale]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set a localised string value on.
 * @param property Property for which to set the given localised string value.
 * @param value Localised string to set on `thing` for the given `property`.
 * @param locale Locale of the added string.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare function setStringWithLocale<T extends Thing>(thing: T, property: Url | UrlString, value: string, locale: string): T;
/**
 * Create a new Thing with existing values replaced by the given unlocalised string for the given Property.
 *
 * To preserve existing values, see [[addStringNoLocale]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set an unlocalised string value on.
 * @param property Property for which to set the given unlocalised string value.
 * @param value Unlocalised string to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare const setStringNoLocale: SetOfType<string>;
/**
 * Create a new Thing with existing values replaced by the given Named Node for the given Property.
 *
 * This replaces existing values for the given Property. To preserve them, see [[addNamedNode]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @ignore This should not be needed due to the other set*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing The [[Thing]] to set a NamedNode on.
 * @param property Property for which to set the value.
 * @param value The NamedNode to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare function setNamedNode<T extends Thing>(thing: T, property: Url | UrlString, value: NamedNode): T;
/**
 * Create a new Thing with existing values replaced by the given Literal for the given Property.
 *
 * This replaces existing values for the given Property. To preserve them, see [[addLiteral]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @ignore This should not be needed due to the other set*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing The [[Thing]] to set a Literal on.
 * @param property Property for which to set the value.
 * @param value The Literal to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export declare function setLiteral<T extends Thing>(thing: T, property: Url | UrlString, value: Literal): T;
/**
 * Creates a new Thing with existing values replaced by the given Term for the given Property.
 *
 * This replaces existing values for the given Property. To preserve them, see [[addTerm]].
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @ignore This should not be needed due to the other set*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing The [[Thing]] to set a Term on.
 * @param property Property for which to set the value.
 * @param value The raw RDF/JS value to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 * @since 0.3.0
 */
export declare function setTerm<T extends Thing>(thing: T, property: Url | UrlString, value: Quad_Object): T;
/**
 * Create a new Thing with existing values replaced by the given value for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing Thing to set a value on.
 * @param property Property for which to set the given value.
 * @param value Value to set on `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with existing values replaced by the given value for the given Property.
 */
export type SetOfType<Type> = <T extends Thing>(thing: T, property: Url | UrlString, value: Type) => T;
