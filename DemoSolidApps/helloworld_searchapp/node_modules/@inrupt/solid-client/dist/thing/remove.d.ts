import type { Literal, NamedNode } from "@rdfjs/types";
import type { Url, UrlString, Thing, ThingPersisted } from "../interfaces";
import type { Time } from "../datatypes";
/**
 * Create a new Thing with all values removed for the given Property.
 *
 * The original `thing` is not modified; this function returns a cloned Thing with updated values.
 *
 * @param thing [[Thing]] to remove values from.
 * @param property Property for which to remove all values from the Thing.
 * @returns A new Thing equal to the input Thing with all values removed for the given Property.
 */
export declare function removeAll<T extends Thing>(thing: T, property: Url | UrlString): T;
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
export declare const removeUrl: RemoveOfType<Url | UrlString | ThingPersisted>;
/** @hidden Alias of [[removeUrl]] for those who prefer IRI terminology. */
export declare const removeIri: RemoveOfType<string | Url | ThingPersisted>;
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
export declare const removeBoolean: RemoveOfType<boolean>;
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
export declare const removeDatetime: RemoveOfType<Date>;
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
export declare const removeDate: RemoveOfType<Date>;
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
export declare const removeTime: RemoveOfType<Time>;
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
export declare const removeDecimal: RemoveOfType<number>;
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
export declare const removeInteger: RemoveOfType<number>;
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
export declare function removeStringEnglish<T extends Thing>(thing: T, property: Url | UrlString, value: string): T;
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
export declare function removeStringWithLocale<T extends Thing>(thing: T, property: Url | UrlString, value: string, locale: string): T;
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
export declare const removeStringNoLocale: RemoveOfType<string>;
/**
 * @ignore This should not be needed due to the other remove*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing Thing to remove a NamedNode value from.
 * @param property Property for which to remove the given NamedNode value.
 * @param value NamedNode to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
export declare function removeNamedNode<T extends Thing>(thing: T, property: Url | UrlString, value: NamedNode): T;
/**
 * @ignore This should not be needed due to the other remove*() functions. If you do find yourself needing it, please file a feature request for your use case.
 * @param thing Thing to remove a Literal value from.
 * @param property Property for which to remove the given Literal value.
 * @param value Literal to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
export declare function removeLiteral<T extends Thing>(thing: T, property: Url | UrlString, value: Literal): T;
/**
 * @param thing Thing to remove a value from.
 * @param property Property for which to remove the given value.
 * @param value Value to remove from `thing` for the given `property`.
 * @returns A new Thing equal to the input Thing with the given value removed for the given Property.
 */
export type RemoveOfType<Type> = <T extends Thing>(thing: T, property: Url | UrlString, value: Type) => T;
