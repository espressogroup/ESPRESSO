import type { Url, UrlString, ThingPersisted } from "../interfaces";
/**
 * Function for use in unit tests to mock a [[Thing]] with a given URL.
 *
 * Warning: do not use this function in actual production code.
 * This function initialises a new empty Thing and sets its URL to a given URL.
 * This is useful to mock a Thing in tests of code that call e.g.
 * [[asUrl]].
 *
 * @param url The URL that the mocked Thing pretends identifies it.
 * @returns A new Thing, pretending to be identified by the given URL.
 * @since 0.2.0
 */
export declare function mockThingFrom(url: Url | UrlString): ThingPersisted;
