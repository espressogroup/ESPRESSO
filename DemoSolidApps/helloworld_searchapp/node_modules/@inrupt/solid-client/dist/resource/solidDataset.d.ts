import type { Quad } from "@rdfjs/types";
import type { UrlString, WithResourceInfo, Url, WithServerResourceInfo, SolidDataset, WithChangeLog } from "../interfaces";
/**
 * Initialise a new [[SolidDataset]] in memory.
 *
 * @returns An empty [[SolidDataset]].
 */
export declare function createSolidDataset(): SolidDataset;
/**
 * A Parser takes a string and generates {@link https://rdf.js.org/data-model-spec/|RDF/JS Quads}.
 *
 * By providing an object conforming to the `Parser` interface, you can handle
 * RDF serialisations other than `text/turtle`, which `@inrupt/solid-client`
 * supports by default. This can be useful to retrieve RDF data from sources
 * other than a Solid Pod.
 *
 * A Parser has the following properties:
 * - `onQuad`: Registers the callback with which parsed
 * {@link https://rdf.js.org/data-model-spec/|RDF/JS Quads} can be provided to
 * `@inrupt/solid-client`.
 * - `onError`: Registers the callback with which `@inrupt/solid-client` can be
 * notified of errors parsing the input.
 * - `onComplete`: Registers the callback with which `@inrupt/solid-client` can
 * be notified that parsing is complete.
 * - `parse`: Accepts the serialised input string and an object containing the
 * input Resource's metadata.
 * The input metadata can be read using functions like [[getSourceUrl]] and
 * [[getContentType]].
 *
 * For example, the following defines a parser that reads an RDFa serialisation
 * using the
 * [rdfa-streaming-parser](https://www.npmjs.com/package/rdfa-streaming-parser)
 * library:
 *
 * ```javascript
 * import { RdfaParser } from "rdfa-streaming-parser";
 *
 * // ...
 *
 * const getRdfaParser = () => {
 *   const onQuadCallbacks = [];
 *   const onCompleteCallbacks = [];
 *   const onErrorCallbacks = [];
 *
 *   return {
 *     onQuad: (callback) => onQuadCallbacks.push(callback),
 *     onError: (callback) => onErrorCallbacks.push(callback),
 *     onComplete: (callback) => onCompleteCallbacks.push(callback),
 *     parse: async (source, resourceInfo) => {
 *       const parser = new RdfaParser({
 *         baseIRI: getSourceUrl(resourceInfo),
 *         contentType: getContentType(resourceInfo) ?? "text/html",
 *       });
 *       parser.on("data", (quad) => {
 *         onQuadCallbacks.forEach((callback) => callback(quad));
 *       });
 *       parser.on("error", (error) => {
 *         onErrorCallbacks.forEach((callback) => callback(error));
 *       });
 *       parser.write(source);
 *       parser.end();
 *       onCompleteCallbacks.forEach((callback) => callback());
 *     },
 *   };
 * };
 * ```
 */
export type Parser = {
    onQuad: (onQuadCallback: (quad: Quad) => void) => void;
    onError: (onErrorCallback: (error: unknown) => void) => void;
    onComplete: (onCompleteCallback: () => void) => void;
    parse: (source: string, resourceInfo: WithServerResourceInfo) => void;
};
type ContentType = string;
/**
 * Custom parsers to load [[SolidDataset]]s serialised in different RDF formats.
 *
 * Provide your own parsers by providing an object on the `parsers` property
 * with the supported content type as the key, and the parser as a value.
 * For documentation on how to provide a parser, see [[Parser]].
 */
export type ParseOptions = {
    parsers: Record<ContentType, Parser>;
};
/**
 * @hidden This interface is not exposed yet until we've tried it out in practice.
 */
export declare function responseToSolidDataset(response: Response, parseOptions?: Partial<ParseOptions>): Promise<SolidDataset & WithServerResourceInfo>;
/**
 * Fetch a SolidDataset from the given URL. Currently requires the SolidDataset to be available as [Turtle](https://www.w3.org/TR/turtle/).
 *
 * Note that the URL of a container ends with a [trailing slash "/"](https://solidproject.org/TR/protocol#uri).
 * If it is missing, some libraries will add it automatically, which may result in additional round-trips, possibly including
 * authentication errors ([more information](https://github.com/inrupt/solid-client-js/issues/1216#issuecomment-904703695)).
 *
 * @param url URL to fetch a [[SolidDataset]] from.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Promise resolving to a [[SolidDataset]] containing the data at the given Resource, or rejecting if fetching it failed.
 */
export declare function getSolidDataset(url: UrlString | Url, options?: Partial<{
    fetch: typeof fetch;
} & ParseOptions>): Promise<SolidDataset & WithServerResourceInfo>;
/**
 * Given a SolidDataset, store it in a Solid Pod (overwriting the existing data at the given URL).
 *
 * A SolidDataset keeps track of the data changes compared to the data in the Pod; i.e.,
 * the changelog tracks both the old value and new values of the property being modified. This
 * function applies the changes to the current SolidDataset. If the old value specified in the
 * changelog does not correspond to the value currently in the Pod, this function will throw an
 * error (common issues are listed in [the documentation](https://docs.inrupt.com/developer-tools/javascript/client-libraries/reference/error-codes/)).
 *
 * The SolidDataset returned by this function will contain the data sent to the Pod, and a ChangeLog
 * up-to-date with the saved data. Note that if the data on the server was modified in between the
 * first fetch and saving it, the updated data will not be reflected in the returned SolidDataset.
 * To make sure you have the latest data, call [[getSolidDataset]] again after saving the data.
 *
 * The Solid server will create any intermediary Containers that do not exist yet, so they do not
 * need to be created in advance. For example, if the target URL is
 * https://example.pod/container/resource and https://example.pod/container/ does not exist yet,
 * it will exist after this function resolves successfully.
 *
 * @param url URL to save `solidDataset` to.
 * @param solidDataset The [[SolidDataset]] to save.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 *  `options.prefixes`: A prefix map to customize the serialization. Only applied on resource creation if the serialization allows it.
 * @returns A Promise resolving to a [[SolidDataset]] containing the stored data, or rejecting if saving it failed.
 */
export declare function saveSolidDatasetAt<Dataset extends SolidDataset>(url: UrlString | Url, solidDataset: Dataset, options?: Partial<{
    fetch?: typeof fetch;
} & {
    prefixes: Record<string, string>;
}>): Promise<Dataset & WithServerResourceInfo & WithChangeLog>;
/**
 * Deletes the SolidDataset at a given URL.
 *
 * If operating on a container, the container must be empty otherwise a 409 CONFLICT will be raised.
 *
 * @param solidDataset The URL of the SolidDataset to delete or the SolidDataset itself (if it has ResourceInfo).
 * @since 0.6.0
 */
export declare function deleteSolidDataset(solidDataset: Url | UrlString | WithResourceInfo, options?: {
    fetch?: typeof fetch;
}): Promise<void>;
/**
 * Create a Container at the given URL. Some content may optionally be specified,
 * e.g. to add metadata describing the container.
 *
 * Throws an error if creating the Container failed, e.g. because the current user does not have
 * permissions to, or because the Container already exists.
 *
 * Note that a Solid server will automatically create the necessary Containers when storing a
 * Resource; i.e. there is no need to call this function if it is immediately followed by
 * [[saveSolidDatasetAt]] or [[overwriteFile]].
 *
 * @param url URL of the empty Container that is to be created.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @param solidDataset Optional parameter - if provided we use this dataset as the body of the HTT request, meaning it's data is included in the Container resource.
 * @since 0.2.0
 */
export declare function createContainerAt(url: UrlString | Url, options?: {
    fetch?: typeof fetch;
    initialContent?: SolidDataset;
}): Promise<SolidDataset & WithServerResourceInfo>;
type SaveInContainerOptions = {
    fetch?: typeof fetch;
    slugSuggestion?: string;
};
/**
 * Given a SolidDataset, store it in a Solid Pod in a new Resource inside a Container.
 *
 * The Container at the given URL should already exist; if it does not, you can initialise it first
 * using [[createContainerAt]], or directly save the SolidDataset at the desired location using
 * [[saveSolidDatasetAt]].
 *
 * This function is primarily useful if the current user does not have access to change existing files in
 * a Container, but is allowed to add new files; in other words, they have Append, but not Write
 * access to a Container. This is useful in situations where someone wants to allow others to,
 * for example, send notifications to their Pod, but not to view or delete existing notifications.
 * You can pass a suggestion for the new Resource's name, but the server may decide to give it
 * another name — for example, if a Resource with that name already exists inside the given
 * Container.
 * If the user does have access to write directly to a given location, [[saveSolidDatasetAt]]
 * will do the job just fine, and does not require the parent Container to exist in advance.
 *
 * @param containerUrl URL of the Container in which to create a new Resource.
 * @param solidDataset The [[SolidDataset]] to save to a new Resource in the given Container.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A Promise resolving to a [[SolidDataset]] containing the saved data. The Promise rejects if the save failed.
 */
export declare function saveSolidDatasetInContainer(containerUrl: UrlString | Url, solidDataset: SolidDataset, options?: SaveInContainerOptions): Promise<SolidDataset & WithResourceInfo>;
/**
 * Create an empty Container inside the Container at the given URL.
 *
 * Throws an error if creating the Container failed, e.g. because the current user does not have
 * permissions to.
 *
 * The Container in which to create the new Container should itself already exist.
 *
 * This function is primarily useful if the current user does not have access to change existing files in
 * a Container, but is allowed to add new files; in other words, they have Append, but not Write
 * access to a Container. This is useful in situations where someone wants to allow others to,
 * for example, send notifications to their Pod, but not to view or delete existing notifications.
 * You can pass a suggestion for the new Resource's name, but the server may decide to give it
 * another name — for example, if a Resource with that name already exists inside the given
 * Container.
 * If the user does have access to write directly to a given location, [[createContainerAt]]
 * will do the job just fine, and does not require the parent Container to exist in advance.
 *
 * @param containerUrl URL of the Container in which the empty Container is to
 * be created.
 * @param options Optional parameter `options.fetch`: An alternative `fetch`
 * function to make the HTTP request, compatible with the browser-native [fetch
 * API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).`options.slugSuggestion`
 * accepts a string for your new Container's name.
 * @returns A promise that resolves to a SolidDataset with ResourceInfo if
 * successful, and that rejects otherwise.
 * @since 0.2.0
 */
export declare function createContainerInContainer(containerUrl: UrlString | Url, options?: SaveInContainerOptions): Promise<SolidDataset & WithResourceInfo>;
/**
 * Deletes the Container at a given URL.
 *
 * @param container The URL of the Container to delete or the Container Dataset itself (if it has ResourceInfo).
 * @since 0.6.0
 */
export declare function deleteContainer(container: Url | UrlString | WithResourceInfo, options?: {
    fetch?: typeof fetch;
}): Promise<void>;
/**
 * Given a [[SolidDataset]] representing a Container (see [[isContainer]]), fetch the URLs of all
 * contained resources that respect [slash semantics](https://solidproject.org/TR/protocol#uri-slash-semantics)
 * (see {@link validateContainedResourceAll}).
 * If the solidDataset given is not a container, or is missing resourceInfo, throw an error.
 *
 * @param solidDataset The container from which to fetch all contained Resource URLs.
 * @returns A list of URLs, each of which points to a contained Resource of the given SolidDataset.
 * @since 1.3.0
 */
export declare function getContainedResourceUrlAll(solidDataset: SolidDataset & WithResourceInfo): UrlString[];
/**
 * Given a {@link SolidDataset} representing a [Container](https://solidproject.org/TR/protocol#resource-containment)
 * (see {@link isContainer}), verify that all its containment claims are valid. Containment of a resource is valid if
 * it respects [slash semantics](https://solidproject.org/TR/protocol#uri-slash-semantics).
 *
 * For the example, given a container at https://example.org/container/:
 *  - The following resources are valid:
 *    - https://example.org/container/resource
 *    - https://example.org/container/subcontainer/
 *  - The following resources are invalid:
 *    - https://example.org/container/resource/invalid (not a direct child resource)
 *    - https://example.org/container2 (not a child resource)
 *    - https://domain2.example.org/container/resource (not a direct child resource)
 *
 * If a component claim is invalid, {@link validateContainedResourceAll} returns the invalid component's URL
 * as part of its return object.
 *
 * Note: It is recommended that this function always be used before calling
 * {@link getContainedResourceUrlAll} since {@link getContainedResourceUrlAll} does not
 * return Resources for which containment is invalid. Using the function in conjunction
 * with {@link getContainedResourceUrlAll} allows for the detection of unexpected behaviour from servers,
 * including malicious containment triples that could appear. Because ESS conforms to the Solid Protocol,
 * i.e., respects slash semantics for its containment triples, validateContainedResourceAll returns true for
 * containers fetched from ESS.
 *
 * @param solidDataset The container from which containment claims are validated.
 * @returns A validation report, including the offending contained resources URL if any.
 * @since unreleased
 */
export declare function validateContainedResourceAll(solidDataset: SolidDataset & WithResourceInfo): {
    isValid: boolean;
    invalidContainedResources: string[];
};
/**
 * Gets a human-readable representation of the given SolidDataset to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param solidDataset The [[SolidDataset]] to get a human-readable representation of.
 * @since 0.3.0
 */
export declare function solidDatasetAsMarkdown(solidDataset: SolidDataset): string;
/**
 * Gets a human-readable representation of the local changes to a Resource to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param solidDataset The Resource of which to get a human-readable representation of the changes applied to it locally.
 * @since 0.3.0
 */
export declare function changeLogAsMarkdown(solidDataset: SolidDataset & WithChangeLog): string;
/**
 * @hidden
 *
 * Fetch a SolidDataset containing information about the capabilities of the
 * storage server that hosts the given resource URL. For more information,
 * please see the [ESS
 * Documentation](https://docs.inrupt.com/ess/latest/services/discovery-endpoint/#well-known-solid).
 *
 * **Note:** The data contained in this dataset has changed between ESS 1.1 and
 * ESS 2.0, as such you will need to check for multiple predicates to support
 * both versions.
 *
 * ```typescript
 * const wellKnown = await getWellKnownSolid(resource);
 *
 * // The wellKnown dataset uses a blank node for the subject all of it’s predicates,
 * // such that we need to call getThingAll with acceptBlankNodes set to true to
 * // retrieve back predicates contained within the dataset
 * const wellKnownSubjects = getThingAll(wellKnown, {
 *   acceptBlankNodes: true,
 * });
 * const wellKnownSubject = wellKnownSubjects[0];
 *
 * // Retrieve a value from the wellKnown dataset:
 * let notificationGateway = getIri(
 *   wellKnownSubject,
 *   "http://www.w3.org/ns/solid/terms#notificationGateway"
 * );
 * ```
 *
 *
 * @param url URL of a Resource.
 * @param options Optional parameter `options.fetch`: An alternative `fetch`
 * function to make the HTTP request, compatible with the browser-native [fetch
 * API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Promise resolving to a [[SolidDataset]] containing the data at
 * '.well-known/solid' for the given Resource, or rejecting if fetching it
 * failed.
 * @since 1.12.0
 */
export declare function getWellKnownSolid(url: UrlString | Url, options?: Partial<{
    fetch?: typeof fetch;
} & ParseOptions>): Promise<SolidDataset & WithServerResourceInfo>;
export {};
