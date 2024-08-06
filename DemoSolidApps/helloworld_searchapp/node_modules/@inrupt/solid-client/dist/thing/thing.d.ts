import type { UrlString, Url, Thing, ThingLocal, ThingPersisted, SolidDataset, WithChangeLog } from "../interfaces";
import { SolidClientError } from "../interfaces";
import type { LocalNodeIri } from "../rdf.internal";
/**
 * @hidden Scopes are not yet consistently used in Solid and hence not properly implemented in this library yet (the add*() and set*() functions do not respect it yet), so we're not exposing these to developers at this point in time.
 */
export interface GetThingOptions {
    /**
     * Which Named Graph to extract the Thing from.
     *
     * If not specified, the Thing will include Quads from all Named Graphs in the given
     * [[SolidDataset]].
     * */
    scope?: Url | UrlString;
}
export declare function getThing(solidDataset: SolidDataset, thingUrl: UrlString | Url, options?: GetThingOptions): ThingPersisted | null;
export declare function getThing(solidDataset: SolidDataset, thingUrl: LocalNodeIri, options?: GetThingOptions): ThingLocal | null;
export declare function getThing(solidDataset: SolidDataset, thingUrl: UrlString | Url | LocalNodeIri, options?: GetThingOptions): Thing | null;
/**
 * Get all [[Thing]]s in a [[SolidDataset]].
 *
 * @param solidDataset The [[SolidDataset]] to extract the [[Thing]]s from.
 * @param options Not yet implemented.
 */
export declare function getThingAll(solidDataset: SolidDataset, options?: GetThingOptions & {
    /**
     * Can Things local to the current dataset, and having no IRI, be returned ?
     */
    acceptBlankNodes?: boolean;
}): Thing[];
/**
 * Insert a [[Thing]] into a [[SolidDataset]], replacing previous instances of that Thing.
 *
 * @param solidDataset The SolidDataset to insert a Thing into.
 * @param thing The Thing to insert into the given SolidDataset.
 * @returns A new SolidDataset equal to the given SolidDataset, but with the given Thing.
 */
export declare function setThing<Dataset extends SolidDataset>(solidDataset: Dataset, thing: Thing): Dataset & WithChangeLog;
/**
 * Remove a Thing from a SolidDataset.
 *
 * @param solidDataset The SolidDataset to remove a Thing from.
 * @param thing The Thing to remove from `solidDataset`.
 * @returns A new [[SolidDataset]] equal to the input SolidDataset, excluding the given Thing.
 */
export declare function removeThing<Dataset extends SolidDataset>(solidDataset: Dataset, thing: UrlString | Url | Thing): Dataset & WithChangeLog;
/** Pass these options to [[createThing]] to initialise a new [[Thing]] whose URL will be determined when it is saved. */
export type CreateThingLocalOptions = {
    /**
     * The name that should be used for this [[Thing]] when constructing its URL.
     *
     * If not provided, a random one will be generated.
     */
    name?: string;
};
/** Pass these options to [[createThing]] to initialise a new [[Thing]] whose URL is already known. */
export type CreateThingPersistedOptions = {
    /**
     * The URL of the newly created [[Thing]].
     */
    url: UrlString;
};
/** The options you pass to [[createThing]].
 * - To specify the URL for the initialised Thing, pass [[CreateThingPersistedOptions]].
 * - To have the URL determined during the save, pass [[CreateThingLocalOptions]].
 */
export type CreateThingOptions = CreateThingLocalOptions | CreateThingPersistedOptions;
/**
 * Initialise a new [[Thing]] in memory with a given URL.
 *
 * @param options See [[CreateThingPersistedOptions]] for how to specify the new [[Thing]]'s URL.
 */
export declare function createThing(options: CreateThingPersistedOptions): ThingPersisted;
/**
 * Initialise a new [[Thing]] in memory.
 *
 * @param options Optional parameters that affect the final URL of this [[Thing]] when saved.
 */
export declare function createThing(options?: CreateThingLocalOptions): ThingLocal;
export declare function createThing(options?: CreateThingOptions): Thing;
/**
 * @param input An value that might be a [[Thing]].
 * @returns Whether `input` is a Thing.
 * @since 0.2.0
 */
export declare function isThing<X>(input: X | Thing): input is Thing;
type IsNotThingLocal<T extends Thing> = T extends ThingLocal ? never : T;
/**
 * Get the URL to a given [[Thing]].
 *
 * @param thing The [[Thing]] you want to obtain the URL from.
 * @param baseUrl If `thing` is not persisted yet, the base URL that should be used to construct this [[Thing]]'s URL.
 */
export declare function asUrl(thing: ThingLocal, baseUrl: UrlString): UrlString;
export declare function asUrl<T extends ThingPersisted>(thing: T & IsNotThingLocal<T>): UrlString;
export declare function asUrl(thing: Thing, baseUrl: UrlString): UrlString;
/** @hidden Alias of [[asUrl]] for those who prefer IRI terminology. */
export declare const asIri: typeof asUrl;
/**
 * Gets a human-readable representation of the given Thing to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param thing The Thing to get a human-readable representation of.
 * @since 0.3.0
 */
export declare function thingAsMarkdown(thing: Thing): string;
/**
 * @param thing The [[Thing]] of which a URL might or might not be known.
 * @return `true` if `thing` has no known URL yet.
 * @since 1.7.0
 */
export declare function isThingLocal(thing: ThingPersisted | ThingLocal): thing is ThingLocal;
/**
 * This error is thrown when a function expected to receive a [[Thing]] but received something else.
 * @since 1.2.0
 */
export declare class ThingExpectedError extends SolidClientError {
    readonly receivedValue: unknown;
    constructor(receivedValue: unknown);
}
/**
 * This error is thrown when a function expected to receive a valid URL to identify a property but received something else.
 */
export declare class ValidPropertyUrlExpectedError extends SolidClientError {
    readonly receivedProperty: unknown;
    constructor(receivedValue: unknown);
}
/**
 * This error is thrown when a function expected to receive a valid URL value but received something else.
 */
export declare class ValidValueUrlExpectedError extends SolidClientError {
    readonly receivedValue: unknown;
    constructor(receivedValue: unknown);
}
/**
 * This error is thrown when a function expected to receive a valid URL to identify a [[Thing]] but received something else.
 */
export declare class ValidThingUrlExpectedError extends SolidClientError {
    readonly receivedValue: unknown;
    constructor(receivedValue: unknown);
}
export {};
