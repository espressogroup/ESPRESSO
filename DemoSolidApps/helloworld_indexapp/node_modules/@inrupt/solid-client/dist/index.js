'use strict';

var jsonldStreamingParser = require('jsonld-streaming-parser');
var jsonldContextParser = require('jsonld-context-parser');
var LinkHeader = require('http-link-header');
var n3 = require('n3');
var uuid = require('uuid');

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
 * Verify whether a given SolidDataset includes metadata about where it was sent to.
 *
 * @param dataset A [[SolidDataset]] that may have metadata attached about the Resource it was retrieved from.
 * @returns True if `dataset` includes metadata about the Resource it was sent to, false if not.
 * @since 0.2.0
 */
function hasResourceInfo(resource) {
    const potentialResourceInfo = resource;
    return (typeof potentialResourceInfo === "object" &&
        typeof potentialResourceInfo.internal_resourceInfo === "object");
}
/**
 * Verify whether a given SolidDataset includes metadata about where it was retrieved from.
 *
 * @param dataset A [[SolidDataset]] that may have metadata attached about the Resource it was retrieved from.
 * @returns True if `dataset` includes metadata about the Resource it was retrieved from, false if not.
 * @since 0.6.0
 */
function hasServerResourceInfo(resource) {
    const potentialResourceInfo = resource;
    return (typeof potentialResourceInfo === "object" &&
        typeof potentialResourceInfo.internal_resourceInfo === "object" &&
        typeof potentialResourceInfo.internal_resourceInfo.linkedResources ===
            "object");
}
/** @internal */
function hasChangelog(dataset) {
    const potentialChangeLog = dataset;
    return (typeof potentialChangeLog.internal_changeLog === "object" &&
        Array.isArray(potentialChangeLog.internal_changeLog.additions) &&
        Array.isArray(potentialChangeLog.internal_changeLog.deletions));
}
/**
 * Errors thrown by solid-client extend this class, and can thereby be distinguished from errors
 * thrown in lower-level libraries.
 * @since 1.2.0
 */
class SolidClientError extends Error {
}

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
/** @internal */
function internal_toIriString(iri) {
    return typeof iri === "string" ? iri : iri.value;
}
/**
 * @hidden
 * @param inputUrl The URL to normalize
 * @param options If trailingSlash is set, a trailing slash will be respectively added/removed.
 * The input URL trailing slash is left unchanged if trailingSlash is undefined.
 * @returns the normalized URL, without relative components, slash sequences, and proper trailing slash.
 */
function normalizeUrl(inputUrl, options = {}) {
    // Normalize relative components.
    const normalizedUrl = new URL(inputUrl);
    // Collapse slash sequences.
    normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/\/+/g, "/");
    // Enforce a trailing slash is present/absent.
    if (options.trailingSlash === false &&
        normalizedUrl.pathname.slice(-1) === "/") {
        normalizedUrl.pathname = normalizedUrl.pathname.slice(0, normalizedUrl.pathname.length - 1);
    }
    if (options.trailingSlash === true &&
        normalizedUrl.pathname.slice(-1) !== "/") {
        normalizedUrl.pathname = `${normalizedUrl.pathname}/`;
    }
    return normalizedUrl.href;
}

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
 * @internal
 */
function internal_parseResourceInfo(response) {
    var _a, _b, _c, _d, _e;
    const contentTypeParts = (_b = (_a = response.headers.get("Content-Type")) === null || _a === void 0 ? void 0 : _a.split(";")) !== null && _b !== void 0 ? _b : [];
    // If the server offers a Turtle or JSON-LD serialisation on its own accord,
    // that tells us whether it is RDF data that the server can understand
    // (and hence can be updated with a PATCH request with SPARQL INSERT and DELETE statements),
    // in which case our SolidDataset-related functions should handle it.
    // For more context, see https://github.com/inrupt/solid-client-js/pull/214.
    const isSolidDataset = contentTypeParts.length > 0 &&
        ["text/turtle", "application/ld+json"].includes(contentTypeParts[0]);
    const resourceInfo = {
        sourceIri: response.url,
        isRawData: !isSolidDataset,
        contentLocation: (_c = response.headers.get("Content-Location")) !== null && _c !== void 0 ? _c : undefined,
        contentType: (_d = response.headers.get("Content-Type")) !== null && _d !== void 0 ? _d : undefined,
        linkedResources: {},
        location: (_e = response.headers.get("Location")) !== null && _e !== void 0 ? _e : undefined,
    };
    const linkHeader = response.headers.get("Link");
    if (linkHeader) {
        const parsedLinks = LinkHeader.parse(linkHeader);
        // Set ACL link
        const aclLinks = parsedLinks.get("rel", "acl");
        if (aclLinks.length === 1) {
            resourceInfo.aclUrl = new URL(aclLinks[0].uri, resourceInfo.sourceIri).href;
        }
        // Parse all link headers and expose them in a standard way
        // (this can replace the parsing of the ACL link above):
        resourceInfo.linkedResources = parsedLinks.refs.reduce((rels, ref) => {
            var _a;
            var _b;
            (_a = rels[_b = ref.rel]) !== null && _a !== void 0 ? _a : (rels[_b] = []);
            rels[ref.rel].push(new URL(ref.uri, resourceInfo.sourceIri).href);
            return rels;
        }, resourceInfo.linkedResources);
    }
    const wacAllowHeader = response.headers.get("WAC-Allow");
    if (wacAllowHeader) {
        resourceInfo.permissions = parseWacAllowHeader(wacAllowHeader);
    }
    return resourceInfo;
}
/**
 * Parse a WAC-Allow header into user and public access booleans.
 *
 * @param wacAllowHeader A WAC-Allow header in the format `user="read append write control",public="read"`
 * @see https://github.com/solid/solid-spec/blob/cb1373a369398d561b909009bd0e5a8c3fec953b/api-rest.md#wac-allow-headers
 */
function parseWacAllowHeader(wacAllowHeader) {
    function parsePermissionStatement(permissionStatement) {
        const permissions = permissionStatement.split(" ");
        const writePermission = permissions.includes("write");
        return writePermission
            ? {
                read: permissions.includes("read"),
                append: true,
                write: true,
                control: permissions.includes("control"),
            }
            : {
                read: permissions.includes("read"),
                append: permissions.includes("append"),
                write: false,
                control: permissions.includes("control"),
            };
    }
    function getStatementFor(header, scope) {
        const relevantEntries = header
            .split(",")
            .map((rawEntry) => rawEntry.split("="))
            .filter((parts) => parts.length === 2 && parts[0].trim() === scope);
        // There should only be one statement with the given scope:
        if (relevantEntries.length !== 1) {
            return "";
        }
        const relevantStatement = relevantEntries[0][1].trim();
        // The given statement should be wrapped in double quotes to be valid:
        if (relevantStatement.charAt(0) !== '"' ||
            relevantStatement.charAt(relevantStatement.length - 1) !== '"') {
            return "";
        }
        // Return the statment without the wrapping quotes, e.g.: read append write control
        return relevantStatement.substring(1, relevantStatement.length - 1);
    }
    return {
        user: parsePermissionStatement(getStatementFor(wacAllowHeader, "user")),
        public: parsePermissionStatement(getStatementFor(wacAllowHeader, "public")),
    };
}
/** @hidden Used to instantiate a separate instance from input parameters */
function internal_cloneResource(resource) {
    let clonedResource;
    if (typeof resource.slice === "function") {
        // If given Resource is a File:
        clonedResource = Object.assign(resource.slice(), { ...resource });
    }
    else {
        // If it is just a plain object containing metadata:
        clonedResource = { ...resource };
    }
    return clonedResource;
}
/** @internal */
function internal_isUnsuccessfulResponse(response) {
    return !response.ok;
}
function internal_isAuthenticationFailureResponse(response) {
    return response.status === 401 || response.status === 403;
}

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
// TODO: These should be replaced by auto-generated constants,
//       if we can ensure that unused constants will be excluded from bundles.
/** @hidden */
const acl = {
    Authorization: "http://www.w3.org/ns/auth/acl#Authorization",
    AuthenticatedAgent: "http://www.w3.org/ns/auth/acl#AuthenticatedAgent",
    accessTo: "http://www.w3.org/ns/auth/acl#accessTo",
    agent: "http://www.w3.org/ns/auth/acl#agent",
    agentGroup: "http://www.w3.org/ns/auth/acl#agentGroup",
    agentClass: "http://www.w3.org/ns/auth/acl#agentClass",
    default: "http://www.w3.org/ns/auth/acl#default",
    defaultForNew: "http://www.w3.org/ns/auth/acl#defaultForNew",
    mode: "http://www.w3.org/ns/auth/acl#mode",
    origin: "http://www.w3.org/ns/auth/acl#origin",
};
/** @hidden */
const rdf = {
    type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
};
/** @hidden */
const rdfs = {
    seeAlso: "http://www.w3.org/2000/01/rdf-schema#seeAlso",
};
/** @hidden */
const ldp = {
    BasicContainer: "http://www.w3.org/ns/ldp#BasicContainer",
    Container: "http://www.w3.org/ns/ldp#Container",
    Resource: "http://www.w3.org/ns/ldp#Resource",
    contains: "http://www.w3.org/ns/ldp#contains",
};
/** @hidden */
const foaf = {
    Agent: "http://xmlns.com/foaf/0.1/Agent",
    primaryTopic: "http://xmlns.com/foaf/0.1/primaryTopic",
    isPrimaryTopicOf: "http://xmlns.com/foaf/0.1/isPrimaryTopicOf",
};
/** @hidden */
const acp = {
    AccessControlResource: "http://www.w3.org/ns/solid/acp#AccessControlResource",
    Policy: "http://www.w3.org/ns/solid/acp#Policy",
    AccessControl: "http://www.w3.org/ns/solid/acp#AccessControl",
    Read: "http://www.w3.org/ns/solid/acp#Read",
    Append: "http://www.w3.org/ns/solid/acp#Append",
    Write: "http://www.w3.org/ns/solid/acp#Write",
    /** @deprecated Removed from the ACP proposal, to be replaced by Matchers. */
    Rule: "http://www.w3.org/ns/solid/acp#Rule",
    Matcher: "http://www.w3.org/ns/solid/acp#Matcher",
    accessControl: "http://www.w3.org/ns/solid/acp#accessControl",
    memberAccessControl: "http://www.w3.org/ns/solid/acp#memberAccessControl",
    apply: "http://www.w3.org/ns/solid/acp#apply",
    /** @deprecated Removed from the ACP proposal, to be replaced by memberAccessControls. */
    applyMembers: "http://www.w3.org/ns/solid/acp#applyMembers",
    allow: "http://www.w3.org/ns/solid/acp#allow",
    deny: "http://www.w3.org/ns/solid/acp#deny",
    allOf: "http://www.w3.org/ns/solid/acp#allOf",
    anyOf: "http://www.w3.org/ns/solid/acp#anyOf",
    noneOf: "http://www.w3.org/ns/solid/acp#noneOf",
    access: "http://www.w3.org/ns/solid/acp#access",
    /** @deprecated Removed from the ACP proposal, to be replaced by memberAccessControls. */
    accessMembers: "http://www.w3.org/ns/solid/acp#accessMembers",
    agent: "http://www.w3.org/ns/solid/acp#agent",
    group: "http://www.w3.org/ns/solid/acp#group",
    client: "http://www.w3.org/ns/solid/acp#client",
    PublicAgent: "http://www.w3.org/ns/solid/acp#PublicAgent",
    AuthenticatedAgent: "http://www.w3.org/ns/solid/acp#AuthenticatedAgent",
    CreatorAgent: "http://www.w3.org/ns/solid/acp#CreatorAgent",
};
/** @hidden */
const solid = {
    PublicOidcClient: "http://www.w3.org/ns/solid/terms#PublicOidcClient",
};
/** @hidden */
const security = {
    publicKey: "https://w3id.org/security#publicKey",
};
/** @hidden */
const pim = {
    storage: "http://www.w3.org/ns/pim/space#storage",
};

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
 * Retrieve the information about a resource (e.g. access permissions) without
 * fetching the resource itself.
 *
 * @param url URL to fetch Resource metadata from.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters).
 * @returns Promise resolving to the metadata describing the given Resource, or rejecting if fetching it failed.
 * @since 0.4.0
 */
async function getResourceInfo(url, options) {
    var _a, _b;
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(normalizeUrl(url), {
        method: "HEAD",
    });
    return responseToResourceInfo(response, {
        ignoreAuthenticationErrors: (_b = options === null || options === void 0 ? void 0 : options.ignoreAuthenticationErrors) !== null && _b !== void 0 ? _b : false,
    });
}
/**
 * Parse Solid metadata from a Response obtained by fetching a Resource from a Solid Pod,
 *
 * @param response A Fetch API Response. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Response MDN}.
 * @returns Resource metadata readable by functions such as [[getSourceUrl]].
 * @hidden This interface is not exposed yet until we've tried it out in practice.
 */
function responseToResourceInfo(response, options = { ignoreAuthenticationErrors: false }) {
    if (internal_isUnsuccessfulResponse(response) &&
        (!internal_isAuthenticationFailureResponse(response) ||
            !options.ignoreAuthenticationErrors)) {
        throw new FetchError(`Fetching the metadata of the Resource at [${response.url}] failed: [${response.status}] [${response.statusText}].`, response);
    }
    const resourceInfo = internal_parseResourceInfo(response);
    return { internal_resourceInfo: resourceInfo };
}
/**
 * @param resource Resource for which to check whether it is a Container.
 * @returns Whether `resource` is a Container.
 */
function isContainer(resource) {
    const containerUrl = hasResourceInfo(resource)
        ? getSourceUrl(resource)
        : internal_toIriString(resource);
    return containerUrl.endsWith("/");
}
/**
 * This function will tell you whether a given Resource contains raw data, or a SolidDataset.
 *
 * @param resource Resource for which to check whether it contains raw data.
 * @return Whether `resource` contains raw data.
 */
function isRawData(resource) {
    return resource.internal_resourceInfo.isRawData;
}
/**
 * @param resource Resource for which to determine the Content Type.
 * @returns The Content Type, if known, or null if not known.
 */
function getContentType$1(resource) {
    var _a;
    return (_a = resource.internal_resourceInfo.contentType) !== null && _a !== void 0 ? _a : null;
}
function getSourceUrl(resource) {
    if (hasResourceInfo(resource)) {
        return resource.internal_resourceInfo.sourceIri;
    }
    return null;
}
/** @hidden Alias of getSourceUrl for those who prefer to use IRI terminology. */
const getSourceIri = getSourceUrl;
/**
 * Given a Resource that exposes information about the owner of the Pod it is in, returns the WebID of that owner.
 *
 * Data about the owner of the Pod is exposed when the following conditions hold:
 * - The Pod server supports exposing the Pod owner
 * - The current user is allowed to see who the Pod owner is.
 *
 * If one or more of those conditions are false, this function will return `null`.
 *
 * @param resource A Resource that contains information about the owner of the Pod it is in.
 * @returns The WebID of the owner of the Pod the Resource is in, if provided, or `null` if not.
 * @since 0.6.0
 */
function getPodOwner(resource) {
    var _a;
    if (!hasServerResourceInfo(resource)) {
        return null;
    }
    const podOwners = (_a = getLinkedResourceUrlAll(resource)["http://www.w3.org/ns/solid/terms#podOwner"]) !== null && _a !== void 0 ? _a : [];
    return podOwners.length === 1 ? podOwners[0] : null;
}
/**
 * Given a WebID and a Resource that exposes information about the owner of the Pod it is in, returns whether the given WebID is the owner of the Pod.
 *
 * Data about the owner of the Pod is exposed when the following conditions hold:
 * - The Pod server supports exposing the Pod owner
 * - The current user is allowed to see who the Pod owner is.
 *
 * If one or more of those conditions are false, this function will return `null`.
 *
 * @param webId The WebID of which to check whether it is the Pod Owner's.
 * @param resource A Resource that contains information about the owner of the Pod it is in.
 * @returns Whether the given WebID is the Pod Owner's, if the Pod Owner is exposed, or `null` if it is not exposed.
 * @since 0.6.0
 */
function isPodOwner(webId, resource) {
    const podOwner = getPodOwner(resource);
    if (typeof podOwner !== "string") {
        return null;
    }
    return podOwner === webId;
}
/**
 * Get the URLs of Resources linked to the given Resource.
 *
 * Solid servers can link Resources to each other. For example, in servers
 * implementing Web Access Control, Resources can have an Access Control List
 * Resource linked to it via the `acl` relation.
 *
 * @param resource A Resource fetched from a Solid Pod.
 * @returns The URLs of Resources linked to the given Resource, indexed by the key that links them.
 * @since 1.7.0
 */
function getLinkedResourceUrlAll(resource) {
    return resource.internal_resourceInfo.linkedResources;
}
/**
 * Get what access the current user has to the given Resource.
 *
 * This function can tell you what access the current user has for the given
 * Resource, allowing you to e.g. determine that changes to it will be rejected
 * before attempting to do so.
 * Additionally, for servers adhering to the Web Access Control specification,
 * it will tell you what access unauthenticated users have to the given Resource.
 *
 * @param resource A Resource fetched from a Solid Pod.
 * @returns What access the current user and, if supported by the server, unauthenticated users have to the given Resource.
 * @since 1.7.0
 */
function getEffectiveAccess(resource) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (typeof resource.internal_resourceInfo.permissions === "object") {
        return {
            user: {
                read: resource.internal_resourceInfo.permissions.user.read,
                append: resource.internal_resourceInfo.permissions.user.append,
                write: resource.internal_resourceInfo.permissions.user.write,
            },
            public: {
                read: resource.internal_resourceInfo.permissions.public.read,
                append: resource.internal_resourceInfo.permissions.public.append,
                write: resource.internal_resourceInfo.permissions.public.write,
            },
        };
    }
    const linkedResourceUrls = getLinkedResourceUrlAll(resource);
    return {
        user: {
            read: (_b = (_a = linkedResourceUrls[acp.allow]) === null || _a === void 0 ? void 0 : _a.includes(acp.Read)) !== null && _b !== void 0 ? _b : false,
            append: (_e = (((_c = linkedResourceUrls[acp.allow]) === null || _c === void 0 ? void 0 : _c.includes(acp.Append)) ||
                ((_d = linkedResourceUrls[acp.allow]) === null || _d === void 0 ? void 0 : _d.includes(acp.Write)))) !== null && _e !== void 0 ? _e : false,
            write: (_g = (_f = linkedResourceUrls[acp.allow]) === null || _f === void 0 ? void 0 : _f.includes(acp.Write)) !== null && _g !== void 0 ? _g : false,
        },
    };
}
/**
 * Extends the regular JavaScript error object with access to the status code and status message.
 * @since 1.2.0
 */
class FetchError extends SolidClientError {
    get statusCode() {
        return this.response.status;
    }
    get statusText() {
        return this.response.statusText;
    }
    constructor(message, errorResponse) {
        super(message);
        this.response = errorResponse;
    }
}

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
 * ```{note} This function is still experimental and subject to change, even
 * in a non-major release.
 * ```
 * This returns a parser that transforms a JSON-LD string into a set of RDFJS quads.
 *
 * @returns A Parser object.
 * @since 1.15.0
 */
const getJsonLdParser$1 = () => {
    const onQuadCallbacks = [];
    const onCompleteCallbacks = [];
    const onErrorCallbacks = [];
    return {
        onQuad: (callback) => {
            onQuadCallbacks.push(callback);
        },
        onError: (callback) => {
            onErrorCallbacks.push(callback);
        },
        onComplete: (callback) => {
            onCompleteCallbacks.push(callback);
        },
        // The following returns a Promise that can be awaited, which is undocumented
        // behavior that doesn't match the type signature. It prevents a potentially
        // breaking change, and will be updated on the next major release.
        parse: (source, resourceInfo) => new Promise((res) => {
            const parser = new jsonldStreamingParser.JsonLdParser({
                baseIRI: getSourceUrl(resourceInfo),
                documentLoader: new jsonldContextParser.FetchDocumentLoader((...args) => fetch(...args)),
            });
            let endCalled = false;
            function end() {
                if (!endCalled) {
                    endCalled = true;
                    onCompleteCallbacks.forEach((callback) => callback());
                    res();
                }
            }
            parser.on("end", end);
            parser.on("error", (err) => {
                onErrorCallbacks.forEach((callback) => callback(err));
                end();
            });
            onQuadCallbacks.forEach((callback) => parser.on("data", callback));
            parser.write(source);
            parser.end();
        }),
    };
};

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
const rdfJsDataset = (quads) => new n3.Store(quads);
const localNodeSkolemPrefix = "https://inrupt.com/.well-known/sdk-local-node/";
/**
 * Runtime freezing might be too much overhead;
 * if so, this function allows us to replace it by a function
 * that merely marks its input as Readonly<> for static analysis.
 */
const { freeze } = Object;
function isLocalNodeIri(iri) {
    return (iri.substring(0, localNodeSkolemPrefix.length) === localNodeSkolemPrefix);
}
function getLocalNodeName(localNodeIri) {
    return localNodeIri.substring(localNodeSkolemPrefix.length);
}
function getLocalNodeIri(localNodeName) {
    return `${localNodeSkolemPrefix}${localNodeName}`;
}
function isBlankNodeId(value) {
    return typeof value === "string" && value.substring(0, 2) === "_:";
}
function getBlankNodeValue(blankNodeId) {
    return blankNodeId.substring(2);
}
function getBlankNodeId(blankNode) {
    return `_:${blankNode.value}`;
}

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
    return n3.DataFactory.namedNode(resolveLocalIri(getLocalNodeName(localNode.value), resourceIri));
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
function addRdfJsQuadToDataset(dataset, quad, quadParseOptions = {}) {
    var _a;
    const supportedGraphTypes = [
        "NamedNode",
        "DefaultGraph",
    ];
    if (!supportedGraphTypes.includes(quad.graph.termType)) {
        throw new Error(`Cannot parse Quads with nodes of type [${quad.graph.termType}] as their Graph node.`);
    }
    const graphId = quad.graph.termType === "DefaultGraph" ? "default" : quad.graph.value;
    const graph = (_a = dataset.graphs[graphId]) !== null && _a !== void 0 ? _a : {};
    return freeze({
        ...dataset,
        graphs: freeze({
            ...dataset.graphs,
            [graphId]: addRdfJsQuadToGraph(graph, quad, quadParseOptions),
        }),
    });
}
function addRdfJsQuadToGraph(graph, quad, quadParseOptions) {
    var _a;
    const supportedSubjectTypes = [
        "NamedNode",
        "BlankNode",
    ];
    if (!supportedSubjectTypes.includes(quad.subject.termType)) {
        throw new Error(`Cannot parse Quads with nodes of type [${quad.subject.termType}] as their Subject node.`);
    }
    const subjectIri = quad.subject.termType === "BlankNode"
        ? `_:${quad.subject.value}`
        : quad.subject.value;
    const subject = (_a = graph[subjectIri]) !== null && _a !== void 0 ? _a : {
        type: "Subject",
        url: subjectIri,
        predicates: {},
    };
    return freeze({
        ...graph,
        [subjectIri]: addRdfJsQuadToSubject(subject, quad, quadParseOptions),
    });
}
function addRdfJsQuadToSubject(subject, quad, quadParseOptions) {
    return freeze({
        ...subject,
        predicates: addRdfJsQuadToPredicates(subject.predicates, quad, quadParseOptions),
    });
}
function addRdfJsQuadToPredicates(predicates, quad, quadParseOptions) {
    var _a;
    const supportedPredicateTypes = [
        "NamedNode",
    ];
    if (!supportedPredicateTypes.includes(quad.predicate.termType)) {
        throw new Error(`Cannot parse Quads with nodes of type [${quad.predicate.termType}] as their Predicate node.`);
    }
    const predicateIri = quad.predicate.value;
    const objects = (_a = predicates[predicateIri]) !== null && _a !== void 0 ? _a : {};
    return freeze({
        ...predicates,
        [predicateIri]: addRdfJsQuadToObjects(objects, quad, quadParseOptions),
    });
}
function addRdfJsQuadToObjects(objects, quad, quadParseOptions) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (quad.object.termType === "NamedNode") {
        const namedNodes = freeze([
            ...((_a = objects.namedNodes) !== null && _a !== void 0 ? _a : []),
            quad.object.value,
        ]);
        return freeze({
            ...objects,
            namedNodes,
        });
    }
    if (quad.object.termType === "Literal") {
        if (quad.object.datatype.value === xmlSchemaTypes.langString) {
            const locale = quad.object.language.toLowerCase();
            const thisLocaleStrings = freeze([
                ...((_c = (_b = objects.langStrings) === null || _b === void 0 ? void 0 : _b[locale]) !== null && _c !== void 0 ? _c : []),
                quad.object.value,
            ]);
            const langStrings = freeze({
                ...((_d = objects.langStrings) !== null && _d !== void 0 ? _d : {}),
                [locale]: thisLocaleStrings,
            });
            return freeze({
                ...objects,
                langStrings,
            });
        }
        // If the Object is a non-langString Literal
        const thisTypeValues = freeze([
            ...((_f = (_e = objects.literals) === null || _e === void 0 ? void 0 : _e[quad.object.datatype.value]) !== null && _f !== void 0 ? _f : []),
            quad.object.value,
        ]);
        const literals = freeze({
            ...((_g = objects.literals) !== null && _g !== void 0 ? _g : {}),
            [quad.object.datatype.value]: thisTypeValues,
        });
        return freeze({
            ...objects,
            literals,
        });
    }
    if (quad.object.termType === "BlankNode") {
        const blankNodePredicates = getPredicatesForBlankNode(quad.object, quadParseOptions);
        const blankNodes = freeze([
            ...((_h = objects.blankNodes) !== null && _h !== void 0 ? _h : []),
            blankNodePredicates,
        ]);
        return freeze({
            ...objects,
            blankNodes,
        });
    }
    throw new Error(`Objects of type [${quad.object.termType}] are not supported.`);
}
function getPredicatesForBlankNode(node, quadParseOptions) {
    var _a, _b;
    const chainBlankNodes = (_a = quadParseOptions.chainBlankNodes) !== null && _a !== void 0 ? _a : [];
    if (chainBlankNodes.find((chainBlankNode) => chainBlankNode.equals(node)) ===
        undefined) {
        // If this Blank Node is not used to provide nested values for another Subject,
        // just return its identifier.
        // That identifier will also be listed among the Subjects in the Graph.
        return getBlankNodeId(node);
    }
    /* istanbul ignore next: If there are chain nodes, there will always be other Quads, so the `?? []` can't be reached: */
    const quads = (_b = quadParseOptions.otherQuads) !== null && _b !== void 0 ? _b : [];
    const quadsWithNodeAsSubject = quads.filter((quad) => quad.subject.equals(node));
    // First add the Quads with regular Objects
    const predicates = quadsWithNodeAsSubject
        .filter((quad) => !isBlankNode(quad.object))
        .reduce((predicatesAcc, quad) => {
        var _a;
        const supportedPredicateTypes = [
            "NamedNode",
        ];
        if (!supportedPredicateTypes.includes(quad.predicate.termType)) {
            throw new Error(`Cannot parse Quads with nodes of type [${quad.predicate.termType}] as their Predicate node.`);
        }
        const objects = (_a = predicatesAcc[quad.predicate.value]) !== null && _a !== void 0 ? _a : {};
        return freeze({
            ...predicatesAcc,
            [quad.predicate.value]: addRdfJsQuadToObjects(objects, quad, quadParseOptions),
        });
    }, {});
    // And then also add the Quads that have another Blank Node as the Object
    // in addition to the Blank Node `node` as the Subject:
    const blankNodeObjectQuads = quadsWithNodeAsSubject.filter((quad) => isBlankNode(quad.object));
    return blankNodeObjectQuads.reduce((predicatesAcc, quad) => {
        var _a, _b;
        const supportedPredicateTypes = [
            "NamedNode",
        ];
        if (!supportedPredicateTypes.includes(quad.predicate.termType)) {
            throw new Error(`Cannot parse Quads with nodes of type [${quad.predicate.termType}] as their Predicate node.`);
        }
        /* istanbul ignore next: The `?? {}` doesn't get hit; presumably it's initialised above. */
        const objects = (_a = predicatesAcc[quad.predicate.value]) !== null && _a !== void 0 ? _a : {};
        /* istanbul ignore next: The `?? []` doesn't get hit; presumably it's initialised above. */
        const blankNodes = (_b = objects.blankNodes) !== null && _b !== void 0 ? _b : [];
        return freeze({
            ...predicatesAcc,
            // The BlankNode assertions are valid because we filtered on BlankNodes above:
            [quad.predicate.value]: {
                ...objects,
                blankNodes: [
                    ...blankNodes,
                    getPredicatesForBlankNode(quad.object, quadParseOptions),
                ],
            },
        });
    }, predicates);
}
/**
 * Given an array of Quads, returns all Blank Nodes that are used in a single chain of Nodes.
 *
 * This allows you to obtain which Blank Nodes are involved in e.g. RDF lists.
 * This is useful because those can be represented as nested data that will have
 * a deterministic structure, whereas a representation of Blank Nodes that
 * create a cycle or are re-used will need ad-hoc, non-deterministic identifiers
 * to allow for representation without inifinite nesting.
 */
function getChainBlankNodes(quads) {
    // All Blank Nodes that occur in Subject position:
    const blankNodeSubjects = quads
        .map((quad) => quad.subject)
        .filter(isBlankNode);
    // All Blank Nodes that occur in Object position:
    const blankNodeObjects = quads.map((quad) => quad.object).filter(isBlankNode);
    // Makes sure that all given Nodes are the same,
    // which will be used to verify that a set of Quads all have the same Subject:
    function everyNodeTheSame(nodes) {
        // This could potentially be made more performant by mapping every term
        // to their value and using native JS comparisons, assuming every node is
        // either a Blank or a Named Node.
        return nodes.every((otherNode) => nodes.every((anotherNode) => otherNode.equals(anotherNode)));
    }
    // Get all Blank Nodes that are part of a cycle in the graph:
    const cycleBlankNodes = [];
    blankNodeObjects.forEach((blankNodeObject) => {
        cycleBlankNodes.push(...getCycleBlankNodes(blankNodeObject, quads));
    });
    // Get Blank Nodes that are used to provide nested values for a single Subject,
    // which we'll represent as nested values as well
    // (this allows us to avoid generating a non-deterministic, ad-hoc identifier
    // for those Blank Nodes).
    // We'll do this by taking all Blank Nodes in the given Quads...
    const chainBlankNodes = blankNodeSubjects
        .concat(blankNodeObjects)
        .filter((blankNode) => {
        // ....removing those Blank Nodes that are part of a cycle...
        if (cycleBlankNodes.some((cycleBlankNode) => cycleBlankNode.equals(blankNode))) {
            return false;
        }
        // ...and then returning only those Blank Nodes that only occur in the
        // Object position for a single Subject, i.e. that are part of a single
        // chain:
        const subjectsWithThisNodeAsObject = quads
            .filter((quad) => quad.object.equals(blankNode))
            .map((quad) => quad.subject);
        return (subjectsWithThisNodeAsObject.length > 0 &&
            everyNodeTheSame(subjectsWithThisNodeAsObject));
    });
    return chainBlankNodes;
}
function toRdfJsQuads(dataset, options = {}) {
    var _a;
    const quads = [];
    const dataFactory = (_a = options.dataFactory) !== null && _a !== void 0 ? _a : n3.DataFactory;
    Object.keys(dataset.graphs).forEach((graphIri) => {
        const graph = dataset.graphs[graphIri];
        const graphNode = graphIri === "default"
            ? dataFactory.defaultGraph()
            : dataFactory.namedNode(graphIri);
        Object.keys(graph).forEach((subjectIri) => {
            const { predicates } = graph[subjectIri];
            const subjectNode = isBlankNodeId(subjectIri)
                ? dataFactory.blankNode(getBlankNodeValue(subjectIri))
                : dataFactory.namedNode(subjectIri);
            quads.push(...subjectToRdfJsQuads(predicates, subjectNode, graphNode, options));
        });
    });
    return quads;
}
function subjectToRdfJsQuads(predicates, subjectNode, graphNode, options = {}) {
    var _a;
    const quads = [];
    const dataFactory = (_a = options.dataFactory) !== null && _a !== void 0 ? _a : n3.DataFactory;
    Object.keys(predicates).forEach((predicateIri) => {
        var _a, _b, _c, _d;
        const predicateNode = dataFactory.namedNode(predicateIri);
        const langStrings = (_a = predicates[predicateIri].langStrings) !== null && _a !== void 0 ? _a : {};
        const namedNodes = (_b = predicates[predicateIri].namedNodes) !== null && _b !== void 0 ? _b : [];
        const literals = (_c = predicates[predicateIri].literals) !== null && _c !== void 0 ? _c : {};
        const blankNodes = (_d = predicates[predicateIri].blankNodes) !== null && _d !== void 0 ? _d : [];
        const literalTypes = Object.keys(literals);
        literalTypes.forEach((typeIri) => {
            const typeNode = dataFactory.namedNode(typeIri);
            const literalValues = literals[typeIri];
            literalValues.forEach((value) => {
                const literalNode = dataFactory.literal(value, typeNode);
                quads.push(dataFactory.quad(subjectNode, predicateNode, literalNode, graphNode));
            });
        });
        const locales = Object.keys(langStrings);
        locales.forEach((locale) => {
            const localeValues = langStrings[locale];
            localeValues.forEach((value) => {
                const langStringNode = dataFactory.literal(value, locale);
                quads.push(dataFactory.quad(subjectNode, predicateNode, langStringNode, graphNode));
            });
        });
        namedNodes.forEach((namedNodeIri) => {
            const node = dataFactory.namedNode(namedNodeIri);
            quads.push(dataFactory.quad(subjectNode, predicateNode, node, graphNode));
        });
        blankNodes.forEach((blankNodeIdOrPredicates) => {
            if (isBlankNodeId(blankNodeIdOrPredicates)) {
                const blankNode = dataFactory.blankNode(getBlankNodeValue(blankNodeIdOrPredicates));
                quads.push(dataFactory.quad(subjectNode, predicateNode, blankNode, graphNode));
            }
            else {
                const node = dataFactory.blankNode();
                const blankNodeObjectQuad = dataFactory.quad(subjectNode, predicateNode, node, graphNode);
                const blankNodeSubjectQuads = subjectToRdfJsQuads(blankNodeIdOrPredicates, node, graphNode);
                quads.push(blankNodeObjectQuad);
                quads.push(...blankNodeSubjectQuads);
            }
        });
    });
    return quads;
}
/**
 * A recursive function that finds all Blank Nodes in an array of Quads that create a cycle in the graph.
 *
 * This function will traverse the graph starting from `currentNode`, keeping
 * track of all the Blank Nodes it encounters twice while doing so, and
 * returning those.
 */
function getCycleBlankNodes(currentNode, quads, traversedBlankNodes = []) {
    // If we've encountered `currentNode` before, all the Blank Nodes we've
    // encountered so far are part of a cycle. Return those.
    if (traversedBlankNodes.find((traversedBlankNode) => traversedBlankNode.equals(currentNode)) !== undefined) {
        return traversedBlankNodes;
    }
    // Find all Blank Nodes that are connected to `currentNode`:
    const blankNodeObjects = quads
        .filter((quad) => quad.subject.equals(currentNode) && isBlankNode(quad.object))
        .map((quad) => quad.object);
    // If no Blank Nodes are connected to `currentNode`, and `currentNode` is not
    // part of a cycle, we're done; the currently traversed Nodes do not form a
    // cycle:
    if (blankNodeObjects.length === 0) {
        return [];
    }
    // Store that we've traversed `currentNode`, then move on to all the Blank
    // Nodes connected to it, which will then take up the role of `currentNode`:
    const nextTraversedNodes = [...traversedBlankNodes, currentNode];
    const cycleBlankNodeArrays = blankNodeObjects.map((nextNode) => getCycleBlankNodes(nextNode, quads, nextTraversedNodes));
    // Collect all the cycle Blank Nodes found in those traverals,
    // then return them:
    const allCycleBlankNodes = [];
    for (const cycleBlankNodes of cycleBlankNodeArrays) {
        allCycleBlankNodes.push(...cycleBlankNodes);
    }
    return allCycleBlankNodes;
}
function isBlankNode(term) {
    return term.termType === "BlankNode";
}

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
 * ```{note} This function is still experimental and subject to change, even
 * in a non-major release.
 * ```
 * This returns a parser that transforms a JSON-LD string into a set of RDFJS quads.
 *
 * @returns A Parser object.
 * @since 1.15.0
 */
const getTurtleParser$1 = () => {
    const onQuadCallbacks = [];
    const onCompleteCallbacks = [];
    const onErrorCallbacks = [];
    return {
        onQuad: (callback) => {
            onQuadCallbacks.push(callback);
        },
        onError: (callback) => {
            onErrorCallbacks.push(callback);
        },
        onComplete: (callback) => {
            onCompleteCallbacks.push(callback);
        },
        parse: (source, resourceInfo) => {
            getParser(getSourceUrl(resourceInfo)).parse(source, (error, quad) => {
                if (error) {
                    onErrorCallbacks.forEach((callback) => callback(error));
                }
                else if (quad) {
                    onQuadCallbacks.forEach((callback) => callback(quad));
                }
                else {
                    onCompleteCallbacks.forEach((callback) => callback());
                }
            });
        },
    };
};
function getParser(baseIri) {
    return new n3.Parser({ format: "text/turtle", baseIRI: baseIri });
}
/**
 * @param quads Triples that should be serialised to Turtle
 * @internal Utility method for internal use; not part of the public API.
 */
async function triplesToTurtle(quads, options) {
    const format = "text/turtle";
    const writer = new n3.Writer({ format, prefixes: options === null || options === void 0 ? void 0 : options.prefixes });
    // Remove any potentially lingering references to Named Graphs in Quads;
    // they'll be determined by the URL the Turtle will be sent to:
    const triples = quads.map((quad) => n3.DataFactory.quad(quad.subject, quad.predicate, quad.object, undefined));
    writer.addQuads(triples);
    const writePromise = new Promise((resolve, reject) => {
        writer.end((error, result) => {
            /* istanbul ignore if [n3.js doesn't actually pass an error nor a result, apparently: https://github.com/rdfjs/N3.js/blob/62682e48c02d8965b4d728cb5f2cbec6b5d1b1b8/src/N3Writer.js#L290] */
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
    const rawTurtle = await writePromise;
    return rawTurtle;
}

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
const prefixes = {
    acl: "http://www.w3.org/ns/auth/acl#",
    acp: "http://www.w3.org/ns/solid/acp#",
    cc: "http://creativecommons.org/ns#",
    cert: "http://www.w3.org/ns/auth/cert#",
    csvw: "http://www.w3.org/ns/csvw#",
    current: "#",
    dc: "http://purl.org/dc/terms/",
    dcam: "http://purl.org/dc/dcam/",
    dcat: "http://www.w3.org/ns/dcat#",
    dctype: "http://purl.org/dc/dcmitype/",
    foaf: "http://xmlns.com/foaf/0.1/",
    ldp: "http://www.w3.org/ns/ldp#",
    owl: "http://www.w3.org/2002/07/owl#",
    posixstat: "http://www.w3.org/ns/posix/stat#",
    rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    rdfs: "http://www.w3.org/2000/01/rdf-schema#",
    schema: "https://schema.org/",
    shacl: "http://www.w3.org/ns/shacl#",
    skos: "http://www.w3.org/2004/02/skos/core#",
    skosxl: "http://www.w3.org/2008/05/skos-xl#",
    solid: "http://www.w3.org/ns/solid/terms#",
    swapdoc: "http://www.w3.org/2000/10/swap/pim/doc#",
    ui: "http://www.w3.org/ns/ui#",
    vann: "http://purl.org/vocab/vann/",
    vcard: "http://www.w3.org/2006/vcard/ns#",
    ws: "http://www.w3.org/ns/pim/space#",
    xsd: "http://www.w3.org/2001/XMLSchema#",
};

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
 * Convert an RDF/JS Dataset into a [[SolidDataset]]
 *
 * Parse an RDF/JS
 * {@link https://rdf.js.org/dataset-spec/#datasetcore-interface DatasetCore},
 * into a [[SolidDataset]]. Note that, when saving the returned SolidDataset to
 * a Solid Pod, only Quads in the Default Graph will be stored.
 *
 * @param rdfJsDataset The source RDF/JS Dataset.
 * @returns A [[SolidDataset]] containing the same data as the given RDF/JS Dataset.
 * @since 1.9.0
 */
function fromRdfJsDataset(rdfJsDataset) {
    const dataset = {
        graphs: { default: {} },
        type: "Dataset",
    };
    const quads = Array.from(rdfJsDataset);
    const chainBlankNodes = getChainBlankNodes(quads);
    // Quads with chain Blank Nodes as their Subject will be parsed when those
    // Blank Nodes are referred to in an Object. See `addRdfJsQuadToObjects`.
    const quadsWithoutChainBlankNodeSubjects = quads.filter((quad) => chainBlankNodes.every((chainBlankNode) => !chainBlankNode.equals(quad.subject)));
    return quadsWithoutChainBlankNodeSubjects.reduce((datasetAcc, quad) => addRdfJsQuadToDataset(datasetAcc, quad, {
        otherQuads: quads,
        chainBlankNodes,
    }), dataset);
}
/**
 * Convert a [[SolidDataset]] into an RDF/JS Dataset
 *
 * Export a [[SolidDataset]] into an RDF/JS
 * {@link https://rdf.js.org/dataset-spec/#datasetcore-interface DatasetCore}.
 *
 * @param set A [[SolidDataset]] to export into an RDF/JS Dataset.
 * @param options Optional parameter that allows you to pass in your own RDF/JS DataFactory or DatasetCoreFactory.
 * @returns An RDF/JS Dataset containing the data from the given SolidDataset.
 * @since 1.9.0
 */
function toRdfJsDataset(set, options = {}) {
    var _a, _b;
    const datasetFactory = (_b = (_a = options.datasetFactory) === null || _a === void 0 ? void 0 : _a.dataset) !== null && _b !== void 0 ? _b : rdfJsDataset;
    return datasetFactory(toRdfJsQuads(set, options));
}

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
 * A function to serialise a Solid Dataset as Turtle
 *
 * @param dataset The Dataset to serialize as Turtle
 * @param options.prefixes The Prefixes to use for Turtle serialisation (defaulting to a set of well known prefixes)
 * @param options.thing Restricts serialisation to the part of a dataset related to the thing
 * @returns RDF serialised as Turtle
 * @since 1.20.0
 */
async function solidDatasetAsTurtle$1(dataset, options) {
    const { prefixes: prefixes$1 = prefixes, thing } = { ...options };
    const writer = new n3.Writer({ format: "application/turtle", prefixes: prefixes$1 });
    const subject = thing ? new n3.NamedNode(thing) : undefined;
    // If the subject is undefined, all the triples match.
    for (const quad of toRdfJsDataset(dataset).match(subject)) {
        writer.addQuad(quad);
    }
    return new Promise((resolve, reject) => {
        writer.end((error, result) => {
            /* istanbul ignore next */
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    });
}

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

var formats = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getJsonLdParser: getJsonLdParser$1,
    getTurtleParser: getTurtleParser$1,
    solidDatasetAsTurtle: solidDatasetAsTurtle$1
});

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
const RESERVED_HEADERS = ["Slug", "If-None-Match", "Content-Type"];
/**
 * Some of the headers must be set by the library, rather than directly.
 */
function containsReserved(header) {
    return RESERVED_HEADERS.some((reserved) => header[reserved] !== undefined);
}
/**
 * Retrieves a file from a URL and returns the file as a blob.
 *
 * For example:
 *
 * ```
 * const fileBlob = await getFile("https://pod.example.com/some/file", { fetch: fetch });
 * ```
 *
 * For additional examples, see
 * [Read/Write Files](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/#retrieve-a-file).
 *
 * @param fileUrl The URL of the file to return
 * @param options Fetching options: a custom fetcher and/or headers.
 * @returns The file as a blob.
 */
async function getFile(fileUrl, options) {
    var _a;
    const normalizedUrl = normalizeUrl(internal_toIriString(fileUrl), {
        trailingSlash: false,
    });
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(normalizedUrl, options === null || options === void 0 ? void 0 : options.init);
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Fetching the File failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
    const resourceInfo = internal_parseResourceInfo(response);
    const data = await response.blob();
    const fileWithResourceInfo = Object.assign(data, {
        internal_resourceInfo: resourceInfo,
    });
    return fileWithResourceInfo;
}
/**
 * Deletes a file at a given URL.
 *
 * For example:
 *
 * ```
 * await deleteFile( "https://pod.example.com/some/file", { fetch: fetch });
 * ```
 *
 * For additional examples, see
 * [Read/Write Files](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/#delete-a-file).
 *
 * @param file The URL of the file to delete or the file itself (if it has ResourceInfo).
 */
async function deleteFile(file, options) {
    var _a;
    const url = hasResourceInfo(file)
        ? internal_toIriString(getSourceIri(file))
        : normalizeUrl(internal_toIriString(file), { trailingSlash: false });
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(url, {
        ...options === null || options === void 0 ? void 0 : options.init,
        method: "DELETE",
    });
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Deleting the file at [${url}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
}
/**
 * Saves a file in an existing folder/Container associated with the given URL.
 *
 * For example:
 *
 * ```
 * const savedFile = await saveFileInContainer(
 *   "https://pod.example.com/some/existing/container/",
 *   new File(["This is a plain piece of text"], "suggestedFileName.txt", { type: "text/plain" }),
 *   { fetch: fetch }
 * );
 * ```
 *
 * For additional example, see
 * [Read/Write Files](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/#save-a-file-into-an-existing-container).
 *
 * In the `options` parameter,
 *
 * - You can suggest a file name in the `slug` field.  However, the Solid
 *   Server may or may not use the suggested `slug` as the file name.
 *
 * - *Recommended:* You can specify the [media type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type)
 *   of the file in the `contentType`.  If unspecified, the function uses the default type of
 *   `application/octet-stream`, indicating a binary data file.
 *
 * The function saves a file into an *existing* Container. If the
 * Container does not exist, either:
 * - Create the Container first using [[createContainerAt]], and then
 *   use the function, or
 * - Use [[overwriteFile]] to save the file. [[overwriteFile]] creates
 *   the Containers in the saved file path as needed.
 *
 * Users who only have `Append` but not `Write` access to a Container
 * can use [[saveFileInContainer]] to save new files to the Container.
 * That is, [[saveFileInContainer]] is useful in situations where users
 * can add new files to a Container but not change existing files in
 * the Container, such as users given access to send notifications to
 * another's Pod but not to view or delete existing notifications in that Pod.
 *
 * Users with `Write` access to the given folder/Container may prefer to
 * use [[overwriteFile]].
 *
 * @param folderUrl The URL of an existing folder where the new file is saved.
 * @param file The file to be written.
 * @param options Additional parameters for file creation (e.g. a slug).
 * @returns A Promise that resolves to the saved file, if available, or `null` if the current user does not have Read access to the newly-saved file. It rejects if saving fails.
 */
async function saveFileInContainer(folderUrl, file, options) {
    const folderUrlString = normalizeUrl(internal_toIriString(folderUrl), {
        trailingSlash: true,
    });
    const response = await writeFile(folderUrlString, file, "POST", options);
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Saving the file in [${folderUrl}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
    const locationHeader = response.headers.get("Location");
    if (locationHeader === null) {
        throw new Error("Could not determine the location of the newly saved file.");
    }
    const fileIri = new URL(locationHeader, new URL(folderUrlString).origin).href;
    const blobClone = internal_cloneResource(file);
    const resourceInfo = {
        internal_resourceInfo: {
            isRawData: true,
            sourceIri: fileIri,
            contentType: getContentType(file, options === null || options === void 0 ? void 0 : options.contentType),
        },
    };
    return Object.assign(blobClone, resourceInfo);
}
/**
 * Saves a file at a given URL. If a file already exists at the URL,
 * the function overwrites the existing file.
 *
 * For example:
 *
 * ```
 * const savedFile = await overwriteFile(
 *   "https://pod.example.com/some/container/myFile.txt",
 *   new File(["This is a plain piece of text"], "myFile", { type: "text/plain" }),
 *   { fetch: fetch }
 * );
 * ```
 *
 * For additional example, see
 * [Read/Write Files](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-files/#write-a-file-to-a-specific-url).
 *
 * *Recommended:* In the `options` parameter, you can specify the
 * [media type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type)
 * of the file in the `contentType`.  If unspecified, the function uses the default type of
 * `application/octet-stream`, indicating a binary data file.
 *
 * When saving a file with [[overwriteFile]], the Solid server creates any
 * intermediary Containers as needed; i.e., the Containers do not
 * need to be created in advance. For example, when saving a file to the target URL of
 * https://example.pod/container/resource, if https://example.pod/container/ does not exist,
 * the container is created as part of the save.
 *
 * @param fileUrl The URL where the file is saved.
 * @param file The file to be written.
 * @param options Additional parameters for file creation (e.g., media type).
 */
async function overwriteFile(fileUrl, file, options) {
    const fileUrlString = internal_toIriString(fileUrl);
    const response = await writeFile(fileUrlString, file, "PUT", options);
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Overwriting the file at [${fileUrlString}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
    const blobClone = internal_cloneResource(file);
    const resourceInfo = internal_parseResourceInfo(response);
    resourceInfo.sourceIri = fileUrlString;
    resourceInfo.isRawData = true;
    return Object.assign(blobClone, { internal_resourceInfo: resourceInfo });
}
function isHeadersArray(headers) {
    return Array.isArray(headers);
}
/**
 * The return type of this function is misleading: it should ONLY be used to check
 * whether an object has a forEach method that returns <key, value> pairs.
 *
 * @param headers A headers object that might have a forEach
 */
function hasHeadersObjectForEach(headers) {
    return typeof headers.forEach === "function";
}
/**
 * @hidden
 * This function feels unnecessarily complicated, but is required in order to
 * have Headers according to type definitions in both Node and browser environments.
 * This might require a fix upstream to be cleaned up.
 *
 * @param headersToFlatten A structure containing headers potentially in several formats
 */
function flattenHeaders(headersToFlatten) {
    if (typeof headersToFlatten === "undefined") {
        return {};
    }
    let flatHeaders = {};
    if (isHeadersArray(headersToFlatten)) {
        headersToFlatten.forEach(([key, value]) => {
            flatHeaders[key] = value;
        });
        // Note that the following line must be a elsif, because string[][] has a forEach,
        // but it returns string[] instead of <key, value>
    }
    else if (hasHeadersObjectForEach(headersToFlatten)) {
        headersToFlatten.forEach((value, key) => {
            flatHeaders[key] = value;
        });
    }
    else {
        // If the headers are already a Record<string, string>,
        // they can directly be returned.
        flatHeaders = headersToFlatten;
    }
    return flatHeaders;
}
/**
 * Internal function that performs the actual write HTTP query, either POST
 * or PUT depending on the use case.
 *
 * @param fileUrl The URL where the file is saved
 * @param file The file to be written
 * @param method The HTTP method
 * @param options Additional parameters for file creation (e.g. a slug, or media type)
 */
async function writeFile(targetUrl, file, method, options = {}) {
    var _a, _b, _c;
    const headers = flattenHeaders((_b = (_a = options.init) === null || _a === void 0 ? void 0 : _a.headers) !== null && _b !== void 0 ? _b : {});
    if (containsReserved(headers)) {
        throw new Error(`No reserved header (${RESERVED_HEADERS.join(", ")}) should be set in the optional RequestInit.`);
    }
    // If a slug is in the parameters, set the request headers accordingly
    if (options.slug !== undefined) {
        headers.Slug = options.slug;
    }
    else if ("name" in file && file.name !== undefined) {
        headers.Slug = file.name;
    }
    headers["Content-Type"] = getContentType(file, options.contentType);
    return ((_c = options.fetch) !== null && _c !== void 0 ? _c : fetch)(targetUrl, {
        ...options.init,
        headers,
        method,
        body: file,
    });
}
function getContentType(file, contentTypeOverride) {
    if (typeof contentTypeOverride === "string") {
        return contentTypeOverride;
    }
    const fileType = typeof file === "object" &&
        file !== null &&
        "type" in file &&
        typeof file.type === "string" &&
        file.type.length > 0
        ? file.type
        : undefined;
    return fileType !== null && fileType !== void 0 ? fileType : "application/octet-stream";
}

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
/** @hidden For internal use only. */
function internal_getReadableValue(value) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (isNamedNode(value)) {
        return `<${value.value}> (URL)`;
    }
    if (isLiteral(value)) {
        /* istanbul ignore if: thingAsMarkdown always instantiates a NamedNode, so we can't hit this code path in tests. */
        if (!isNamedNode(value.datatype)) {
            return `[${value.value}] (RDF/JS Literal of unknown type)`;
        }
        let val;
        switch (value.datatype.value) {
            case xmlSchemaTypes.boolean:
                val =
                    (_b = (_a = deserializeBoolean(value.value)) === null || _a === void 0 ? void 0 : _a.valueOf()) !== null && _b !== void 0 ? _b : `Invalid data: \`${value.value}\``;
                return `${val} (boolean)`;
            case xmlSchemaTypes.dateTime:
                val =
                    (_d = (_c = deserializeDatetime(value.value)) === null || _c === void 0 ? void 0 : _c.toUTCString()) !== null && _d !== void 0 ? _d : `Invalid data: \`${value.value}\``;
                return `${val} (datetime)`;
            case xmlSchemaTypes.decimal:
                val =
                    (_f = (_e = deserializeDecimal(value.value)) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : `Invalid data: \`${value.value}\``;
                return `${val} (decimal)`;
            case xmlSchemaTypes.integer:
                val =
                    (_h = (_g = deserializeInteger(value.value)) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : `Invalid data: \`${value.value}\``;
                return `${val} (integer)`;
            case xmlSchemaTypes.langString:
                return `"${value.value}" (${value.language} string)`;
            case xmlSchemaTypes.string:
                return `"${value.value}" (string)`;
            default:
                return `[${value.value}] (RDF/JS Literal of type: \`${value.datatype.value}\`)`;
        }
    }
    /* istanbul ignore else: thingAsMarkdown doesn't generate other Nodes, so we can't hit this path in tests. */
    if (value.termType === "BlankNode") {
        return `[${value.value}] (RDF/JS BlankNode)`;
    }
    /* istanbul ignore next: thingAsMarkdown doesn't generate Quad Nodes, so we can't hit this path in tests. */
    if (value.termType === "Quad") {
        return `??? (nested RDF* Quad)`;
    }
    /* istanbul ignore else: The if statements are exhaustive; if not, TypeScript will complain. */
    /* istanbul ignore next: thingAsMarkdown doesn't generate Variable Nodes, so we can't hit this path in tests. */
    if (value.termType === "Variable") {
        return `?${value.value} (RDF/JS Variable)`;
    }
    /* istanbul ignore next: The if statements are exhaustive; if not, TypeScript will complain. */
    return value;
}
/**
 * @hidden
 */
function internal_throwIfNotThing(thing) {
    if (!isThing(thing)) {
        throw new ThingExpectedError(thing);
    }
}
/**
 * @hidden
 * @param solidDataset
 */
function internal_addAdditionsToChangeLog(solidDataset, additions) {
    const changeLog = hasChangelog(solidDataset)
        ? solidDataset.internal_changeLog
        : /* istanbul ignore next: This function always gets called after addDeletionsToChangeLog, so the ChangeLog always already exists in tests: */
            { additions: [], deletions: [] };
    const [newAdditions, newDeletions] = additions
        .filter((addition) => !containsBlankNode(addition))
        .reduce(([additionsAcc, deletionsAcc], addition) => {
        const existingDeletion = deletionsAcc.find((deletion) => deletion.equals(addition));
        if (typeof existingDeletion !== "undefined") {
            return [
                additionsAcc,
                deletionsAcc.filter((deletion) => !deletion.equals(addition)),
            ];
        }
        return [additionsAcc.concat(addition), deletionsAcc];
    }, [changeLog.additions, changeLog.deletions]);
    return freeze({
        ...solidDataset,
        internal_changeLog: {
            additions: newAdditions,
            deletions: newDeletions,
        },
    });
}
/**
 * @hidden
 * @param solidDataset
 */
function internal_addDeletionsToChangeLog(solidDataset, deletions) {
    const changeLog = hasChangelog(solidDataset)
        ? solidDataset.internal_changeLog
        : { additions: [], deletions: [] };
    const [newAdditions, newDeletions] = deletions
        .filter((deletion) => !containsBlankNode(deletion))
        .reduce(([additionsAcc, deletionsAcc], deletion) => {
        const existingAddition = additionsAcc.find((addition) => addition.equals(deletion));
        if (typeof existingAddition !== "undefined") {
            return [
                additionsAcc.filter((addition) => !addition.equals(deletion)),
                deletionsAcc,
            ];
        }
        return [additionsAcc, deletionsAcc.concat(deletion)];
    }, [changeLog.additions, changeLog.deletions]);
    return freeze({
        ...solidDataset,
        internal_changeLog: {
            additions: newAdditions,
            deletions: newDeletions,
        },
    });
}
/**
 * Enforces the presence of a Changelog for a given dataset. If a changelog is
 * already present, it is unchanged. Otherwise, an empty changelog is created.
 * @hidden
 * @param solidDataset
 */
function internal_withChangeLog(solidDataset) {
    const newSolidDataset = hasChangelog(solidDataset)
        ? solidDataset
        : freeze({
            ...solidDataset,
            internal_changeLog: { additions: [], deletions: [] },
        });
    return newSolidDataset;
}
/**
 * We don't currently support reading and writing Blank Nodes, so this function can be used to skip those Quads.
 *
 * This is needed because we cannot reconcile Blank Nodes in additions and
 * deletions. Down the road, we should do a diff before saving a SolidDataset
 * against a saved copy of the originally-fetched one, based on our own data
 * structures, which should make it easier to reconcile.
 */
function containsBlankNode(quad) {
    return (quad.subject.termType === "BlankNode" ||
        quad.object.termType === "BlankNode");
}

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
    return n3.DataFactory.namedNode(iriString);
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
    return iriStrings.map((iriString) => n3.DataFactory.namedNode(iriString));
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
            return n3.DataFactory.literal(langStrings[nonEmptyLocale][0], nonEmptyLocale);
        }
    }
    const otherLiterals = (_d = (_c = thing.predicates[predicateIri]) === null || _c === void 0 ? void 0 : _c.literals) !== null && _d !== void 0 ? _d : {};
    const dataTypes = Object.keys(otherLiterals);
    if (dataTypes.length > 0) {
        const nonEmptyDataType = dataTypes.find((dataType) => Array.isArray(otherLiterals[dataType]) &&
            otherLiterals[dataType].length > 0);
        if (typeof nonEmptyDataType === "string") {
            return n3.DataFactory.literal(otherLiterals[nonEmptyDataType][0], n3.DataFactory.namedNode(nonEmptyDataType));
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
        const localeLiterals = stringsInLocale.map((langString) => n3.DataFactory.literal(langString, locale));
        literals = literals.concat(localeLiterals);
    }
    const otherLiterals = (_d = (_c = thing.predicates[predicateIri]) === null || _c === void 0 ? void 0 : _c.literals) !== null && _d !== void 0 ? _d : {};
    const dataTypes = Object.keys(otherLiterals);
    for (const dataType of dataTypes) {
        const values = otherLiterals[dataType];
        const typeNode = n3.DataFactory.namedNode(dataType);
        const dataTypeLiterals = values.map((value) => n3.DataFactory.literal(value, typeNode));
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
        return n3.DataFactory.blankNode(blankNodeValue);
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
        return n3.DataFactory.blankNode(blankNodeName);
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
 * Extract Quads with a given Subject from a [[SolidDataset]] into a [[Thing]].
 *
 * @param solidDataset The [[SolidDataset]] to extract the [[Thing]] from.
 * @param thingUrl The URL of the desired [[Thing]].
 * @param options Not yet implemented.
 */
function getThing(solidDataset, thingUrl, options = {}) {
    var _a;
    if (!internal_isValidUrl(thingUrl)) {
        throw new ValidThingUrlExpectedError(thingUrl);
    }
    const graph = typeof options.scope !== "undefined"
        ? internal_toIriString(options.scope)
        : "default";
    const thingsByIri = (_a = solidDataset.graphs[graph]) !== null && _a !== void 0 ? _a : {};
    const thingIri = internal_toIriString(thingUrl);
    const resolvedThingIri = isLocalNodeIri(thingIri) && hasServerResourceInfo(solidDataset)
        ? resolveLocalIri(getLocalNodeName(thingIri), getSourceUrl(solidDataset))
        : thingIri;
    const thing = thingsByIri[resolvedThingIri];
    if (typeof thing === "undefined") {
        return null;
    }
    return thing;
}
/**
 * Get all [[Thing]]s in a [[SolidDataset]].
 *
 * @param solidDataset The [[SolidDataset]] to extract the [[Thing]]s from.
 * @param options Not yet implemented.
 */
function getThingAll(solidDataset, options = { acceptBlankNodes: false }) {
    var _a;
    const graph = typeof options.scope !== "undefined"
        ? internal_toIriString(options.scope)
        : "default";
    const thingsByIri = (_a = solidDataset.graphs[graph]) !== null && _a !== void 0 ? _a : {};
    return Object.values(thingsByIri).filter((thing) => !isBlankNodeId(thing.url) || options.acceptBlankNodes);
}
/**
 * Insert a [[Thing]] into a [[SolidDataset]], replacing previous instances of that Thing.
 *
 * @param solidDataset The SolidDataset to insert a Thing into.
 * @param thing The Thing to insert into the given SolidDataset.
 * @returns A new SolidDataset equal to the given SolidDataset, but with the given Thing.
 */
function setThing(solidDataset, thing) {
    var _a;
    const thingIri = isThingLocal(thing) && hasServerResourceInfo(solidDataset)
        ? resolveLocalIri(getLocalNodeName(thing.url), getSourceUrl(solidDataset))
        : thing.url;
    const defaultGraph = solidDataset.graphs.default;
    const updatedDefaultGraph = freeze({
        ...defaultGraph,
        [thingIri]: freeze({ ...thing, url: thingIri }),
    });
    const updatedGraphs = freeze({
        ...solidDataset.graphs,
        default: updatedDefaultGraph,
    });
    const subjectNode = n3.DataFactory.namedNode(thingIri);
    const deletedThingPredicates = (_a = solidDataset.graphs.default[thingIri]) === null || _a === void 0 ? void 0 : _a.predicates;
    const deletions = typeof deletedThingPredicates !== "undefined"
        ? subjectToRdfJsQuads(deletedThingPredicates, subjectNode, n3.DataFactory.defaultGraph())
        : [];
    const additions = subjectToRdfJsQuads(thing.predicates, subjectNode, n3.DataFactory.defaultGraph());
    return internal_addAdditionsToChangeLog(internal_addDeletionsToChangeLog(freeze({
        ...solidDataset,
        graphs: updatedGraphs,
    }), deletions), additions);
}
/**
 * Remove a Thing from a SolidDataset.
 *
 * @param solidDataset The SolidDataset to remove a Thing from.
 * @param thing The Thing to remove from `solidDataset`.
 * @returns A new [[SolidDataset]] equal to the input SolidDataset, excluding the given Thing.
 */
function removeThing(solidDataset, thing) {
    var _a;
    let thingIri;
    if (isNamedNode(thing)) {
        thingIri = thing.value;
    }
    else if (typeof thing === "string") {
        thingIri =
            isLocalNodeIri(thing) && hasServerResourceInfo(solidDataset)
                ? resolveLocalIri(getLocalNodeName(thing), getSourceUrl(solidDataset))
                : thing;
    }
    else if (isThingLocal(thing)) {
        thingIri = thing.url;
    }
    else {
        thingIri = asIri(thing);
    }
    const defaultGraph = solidDataset.graphs.default;
    const updatedDefaultGraph = { ...defaultGraph };
    delete updatedDefaultGraph[thingIri];
    const updatedGraphs = freeze({
        ...solidDataset.graphs,
        default: freeze(updatedDefaultGraph),
    });
    const subjectNode = n3.DataFactory.namedNode(thingIri);
    const deletedThingPredicates = (_a = solidDataset.graphs.default[thingIri]) === null || _a === void 0 ? void 0 : _a.predicates;
    const deletions = typeof deletedThingPredicates !== "undefined"
        ? subjectToRdfJsQuads(deletedThingPredicates, subjectNode, n3.DataFactory.defaultGraph())
        : [];
    return internal_addDeletionsToChangeLog(freeze({
        ...solidDataset,
        graphs: updatedGraphs,
    }), deletions);
}
function createThing(options = {}) {
    var _a;
    if (typeof options.url !== "undefined") {
        const { url } = options;
        if (!internal_isValidUrl(url)) {
            throw new ValidThingUrlExpectedError(url);
        }
        const thing = freeze({
            type: "Subject",
            predicates: freeze({}),
            url,
        });
        return thing;
    }
    const name = (_a = options.name) !== null && _a !== void 0 ? _a : generateName();
    const localNodeIri = getLocalNodeIri(name);
    const thing = freeze({
        type: "Subject",
        predicates: freeze({}),
        url: localNodeIri,
    });
    return thing;
}
/**
 * @param input An value that might be a [[Thing]].
 * @returns Whether `input` is a Thing.
 * @since 0.2.0
 */
function isThing(input) {
    return (typeof input === "object" &&
        input !== null &&
        typeof input.type === "string" &&
        input.type === "Subject");
}
function asUrl(thing, baseUrl) {
    if (isThingLocal(thing)) {
        if (typeof baseUrl === "undefined") {
            throw new Error("The URL of a Thing that has not been persisted cannot be determined without a base URL.");
        }
        return resolveLocalIri(getLocalNodeName(thing.url), baseUrl);
    }
    return thing.url;
}
/** @hidden Alias of [[asUrl]] for those who prefer IRI terminology. */
const asIri = asUrl;
/**
 * Gets a human-readable representation of the given Thing to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param thing The Thing to get a human-readable representation of.
 * @since 0.3.0
 */
function thingAsMarkdown(thing) {
    let thingAsMarkdown = "";
    if (isThingLocal(thing)) {
        thingAsMarkdown += `## Thing (no URL yet — identifier: \`#${getLocalNodeName(thing.url)}\`)\n`;
    }
    else {
        thingAsMarkdown += `## Thing: ${thing.url}\n`;
    }
    const predicateIris = Object.keys(thing.predicates);
    if (predicateIris.length === 0) {
        thingAsMarkdown += "\n<empty>\n";
    }
    else {
        for (const predicate of predicateIris) {
            thingAsMarkdown += `\nProperty: ${predicate}\n`;
            const values = getTermAll(thing, predicate);
            thingAsMarkdown += values.reduce((acc, value) => {
                return `${acc}- ${internal_getReadableValue(value)}\n`;
            }, "");
        }
    }
    return thingAsMarkdown;
}
/**
 * @param thing The [[Thing]] of which a URL might or might not be known.
 * @return `true` if `thing` has no known URL yet.
 * @since 1.7.0
 */
function isThingLocal(thing) {
    return isLocalNodeIri(thing.url);
}
/**
 * This error is thrown when a function expected to receive a [[Thing]] but received something else.
 * @since 1.2.0
 */
class ThingExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const message = `Expected a Thing, but received: [${receivedValue}].`;
        super(message);
        this.receivedValue = receivedValue;
    }
}
/**
 * This error is thrown when a function expected to receive a valid URL to identify a property but received something else.
 */
class ValidPropertyUrlExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const value = isNamedNode(receivedValue)
            ? receivedValue.value
            : receivedValue;
        const message = `Expected a valid URL to identify a property, but received: [${value}].`;
        super(message);
        this.receivedProperty = value;
    }
}
/**
 * This error is thrown when a function expected to receive a valid URL value but received something else.
 */
class ValidValueUrlExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const value = isNamedNode(receivedValue)
            ? receivedValue.value
            : receivedValue;
        const message = `Expected a valid URL value, but received: [${value}].`;
        super(message);
        this.receivedValue = value;
    }
}
/**
 * This error is thrown when a function expected to receive a valid URL to identify a [[Thing]] but received something else.
 */
class ValidThingUrlExpectedError extends SolidClientError {
    constructor(receivedValue) {
        const value = isNamedNode(receivedValue)
            ? receivedValue.value
            : receivedValue;
        const message = `Expected a valid URL to identify a Thing, but received: [${value}].`;
        super(message);
        this.receivedValue = value;
    }
}
/**
 * Generate a string that can be used as the unique identifier for a Thing
 *
 * This function works by starting with a date string (so that Things can be
 * sorted chronologically), followed by a random number generated by taking a
 * random number between 0 and 1, and cutting off the `0.`.
 *
 * @internal
 * @returns An string that's likely to be unique
 */
const generateName = () => {
    return uuid.v4();
};

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
 * This function normalizes IRIs as managed by the server to ease accurate comparison.
 * @param iri
 * @hidden
 */
function normalizeServerSideIri(iri) {
    const iriObj = new URL(iri);
    iriObj.hash = "";
    return iriObj.href;
}

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
 * Initialise a new [[SolidDataset]] in memory.
 *
 * @returns An empty [[SolidDataset]].
 */
function createSolidDataset() {
    return freeze({
        type: "Dataset",
        graphs: {
            default: {},
        },
    });
}
/**
 * @hidden This interface is not exposed yet until we've tried it out in practice.
 */
async function responseToSolidDataset(response, parseOptions = {}) {
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Fetching the SolidDataset at [${response.url}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
    const resourceInfo = responseToResourceInfo(response);
    const parsers = {
        "text/turtle": getTurtleParser$1(),
        ...parseOptions.parsers,
    };
    const contentType = getContentType$1(resourceInfo);
    if (contentType === null) {
        throw new Error(`Could not determine the content type of the Resource at [${getSourceUrl(resourceInfo)}].`);
    }
    const mimeType = contentType.split(";")[0];
    const parser = parsers[mimeType];
    if (typeof parser === "undefined") {
        throw new Error(`The Resource at [${getSourceUrl(resourceInfo)}] has a MIME type of [${mimeType}], but the only parsers available are for the following MIME types: [${Object.keys(parsers).join(", ")}].`);
    }
    const data = await response.text();
    const parsingPromise = new Promise((resolve, reject) => {
        let solidDataset = freeze({
            graphs: freeze({ default: freeze({}) }),
            type: "Dataset",
        });
        // While Quads without Blank Nodes can be added to the SolidDataset as we
        // encounter them, to parse Quads with Blank Nodes, we'll have to wait until
        // we've seen all the Quads, so that we can reconcile equal Blank Nodes.
        const quadsWithBlankNodes = [];
        const allQuads = [];
        parser.onError((error) => {
            reject(new Error(`Encountered an error parsing the Resource at [${getSourceUrl(resourceInfo)}] with content type [${contentType}]: ${error}`));
        });
        parser.onQuad((quad) => {
            allQuads.push(quad);
            if (quad.subject.termType === "BlankNode" ||
                quad.object.termType === "BlankNode") {
                // Quads with Blank Nodes will be parsed when all Quads are known,
                // so that equal Blank Nodes can be reconciled:
                quadsWithBlankNodes.push(quad);
            }
            else {
                solidDataset = addRdfJsQuadToDataset(solidDataset, quad);
            }
        });
        parser.onComplete(async () => {
            // If a Resource contains more than this number of Blank Nodes,
            // we consider the detection of chains (O(n^2), I think) to be too
            // expensive, and just incorporate them as regular Blank Nodes with
            // non-deterministic, ad-hoc identifiers into the SolidDataset:
            const maxBlankNodesToDetectChainsFor = 20;
            // Some Blank Nodes only serve to use a set of Quads as the Object for a
            // single Subject. Those Quads will be added to the SolidDataset when
            // their Subject's Blank Node is encountered in the Object position.
            const chainBlankNodes = quadsWithBlankNodes.length <= maxBlankNodesToDetectChainsFor
                ? getChainBlankNodes(quadsWithBlankNodes)
                : [];
            const quadsWithoutChainBlankNodeSubjects = quadsWithBlankNodes.filter((quad) => chainBlankNodes.every((chainBlankNode) => !chainBlankNode.equals(quad.subject)));
            solidDataset = quadsWithoutChainBlankNodeSubjects.reduce((datasetAcc, quad) => addRdfJsQuadToDataset(datasetAcc, quad, {
                otherQuads: allQuads,
                chainBlankNodes,
            }), solidDataset);
            const solidDatasetWithResourceInfo = freeze({
                ...solidDataset,
                ...resourceInfo,
            });
            resolve(solidDatasetWithResourceInfo);
        });
        parser.parse(data, resourceInfo);
    });
    return parsingPromise;
}
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
async function getSolidDataset(url, options) {
    var _a, _b;
    const normalizedUrl = normalizeUrl(internal_toIriString(url));
    const parserContentTypes = Object.keys((_a = options === null || options === void 0 ? void 0 : options.parsers) !== null && _a !== void 0 ? _a : {});
    const acceptedContentTypes = parserContentTypes.length > 0
        ? parserContentTypes.join(", ")
        : "text/turtle";
    const response = await ((_b = options === null || options === void 0 ? void 0 : options.fetch) !== null && _b !== void 0 ? _b : fetch)(normalizedUrl, {
        headers: {
            Accept: acceptedContentTypes,
        },
    });
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Fetching the Resource at [${normalizedUrl}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
    const solidDataset = await responseToSolidDataset(response, options);
    return solidDataset;
}
/**
 * Create a SPARQL UPDATE Patch request from a [[SolidDataset]] with a changelog.
 * @param solidDataset the [[SolidDataset]] that has been locally updated, and that should be persisted.
 * @returns an HTTP PATCH request configuration object, aligned with the [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters), containing a SPARQL UPDATE.
 * @hidden
 */
async function prepareSolidDatasetUpdate(solidDataset) {
    const deleteStatement = solidDataset.internal_changeLog.deletions.length > 0
        ? `DELETE DATA {${(await triplesToTurtle(solidDataset.internal_changeLog.deletions.map(getNamedNodesForLocalNodes))).trim()}};`
        : "";
    const insertStatement = solidDataset.internal_changeLog.additions.length > 0
        ? `INSERT DATA {${(await triplesToTurtle(solidDataset.internal_changeLog.additions.map(getNamedNodesForLocalNodes))).trim()}};`
        : "";
    return {
        method: "PATCH",
        body: `${deleteStatement} ${insertStatement}`,
        headers: {
            "Content-Type": "application/sparql-update",
        },
    };
}
/**
 * Create a Put request to write a locally created [[SolidDataset]] to a Pod.
 * @param solidDataset the [[SolidDataset]] that has been locally updated, and that should be persisted.
 * @returns an HTTP PUT request configuration object, aligned with the [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters), containing a serialization of the [[SolidDataset]].
 * @hidden
 */
async function prepareSolidDatasetCreation(solidDataset, options) {
    return {
        method: "PUT",
        body: await triplesToTurtle(toRdfJsQuads(solidDataset).map(getNamedNodesForLocalNodes), options),
        headers: {
            "Content-Type": "text/turtle",
            "If-None-Match": "*",
            Link: `<${ldp.Resource}>; rel="type"`,
        },
    };
}
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
async function saveSolidDatasetAt(url, solidDataset, options) {
    var _a;
    const targetUrl = normalizeUrl(internal_toIriString(url));
    const datasetWithChangelog = internal_withChangeLog(solidDataset);
    const requestInit = isUpdate(datasetWithChangelog, targetUrl)
        ? await prepareSolidDatasetUpdate(datasetWithChangelog)
        : await prepareSolidDatasetCreation(datasetWithChangelog, options);
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(targetUrl, requestInit);
    if (internal_isUnsuccessfulResponse(response)) {
        const diagnostics = isUpdate(datasetWithChangelog, targetUrl)
            ? `The changes that were sent to the Pod are listed below.\n\n${changeLogAsMarkdown(datasetWithChangelog)}`
            : `The SolidDataset that was sent to the Pod is listed below.\n\n${solidDatasetAsMarkdown(datasetWithChangelog)}`;
        throw new FetchError(`Storing the Resource at [${targetUrl}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.\n\n${diagnostics}`, response);
    }
    const resourceInfo = {
        ...internal_parseResourceInfo(response),
        isRawData: false,
    };
    const storedDataset = freeze({
        ...solidDataset,
        internal_changeLog: { additions: [], deletions: [] },
        internal_resourceInfo: resourceInfo,
    });
    const storedDatasetWithResolvedIris = resolveLocalIrisInSolidDataset(storedDataset);
    return storedDatasetWithResolvedIris;
}
/**
 * Deletes the SolidDataset at a given URL.
 *
 * If operating on a container, the container must be empty otherwise a 409 CONFLICT will be raised.
 *
 * @param solidDataset The URL of the SolidDataset to delete or the SolidDataset itself (if it has ResourceInfo).
 * @since 0.6.0
 */
async function deleteSolidDataset(solidDataset, options) {
    var _a;
    const url = hasResourceInfo(solidDataset)
        ? internal_toIriString(getSourceUrl(solidDataset))
        : normalizeUrl(internal_toIriString(solidDataset));
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(url, { method: "DELETE" });
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Deleting the SolidDataset at [${url}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
}
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
async function createContainerAt(url, options = {}) {
    var _a, _b;
    const normalizedUrl = normalizeUrl(internal_toIriString(url), {
        trailingSlash: true,
    });
    const response = await ((_a = options.fetch) !== null && _a !== void 0 ? _a : fetch)(normalizedUrl, {
        method: "PUT",
        body: options.initialContent
            ? await triplesToTurtle(toRdfJsQuads(options.initialContent).map(getNamedNodesForLocalNodes))
            : undefined,
        headers: {
            Accept: "text/turtle",
            "Content-Type": "text/turtle",
            "If-None-Match": "*",
            // This header should not be required to create a Container,
            // but ESS currently expects it:
            Link: `<${ldp.BasicContainer}>; rel="type"`,
        },
    });
    if (internal_isUnsuccessfulResponse(response)) {
        const containerType = options.initialContent === undefined ? "empty" : "non-empty";
        throw new FetchError(`Creating the ${containerType} Container at [${url}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
    const resourceInfo = internal_parseResourceInfo(response);
    const containerDataset = freeze({
        ...((_b = options.initialContent) !== null && _b !== void 0 ? _b : createSolidDataset()),
        internal_changeLog: { additions: [], deletions: [] },
        internal_resourceInfo: resourceInfo,
    });
    return containerDataset;
}
function isSourceIriEqualTo(dataset, iri) {
    return (normalizeServerSideIri(dataset.internal_resourceInfo.sourceIri) ===
        normalizeServerSideIri(iri));
}
function isUpdate(solidDataset, url) {
    return (hasChangelog(solidDataset) &&
        hasResourceInfo(solidDataset) &&
        typeof solidDataset.internal_resourceInfo.sourceIri === "string" &&
        isSourceIriEqualTo(solidDataset, url));
}
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
async function saveSolidDatasetInContainer(containerUrl, solidDataset, options) {
    var _a;
    const normalizedUrl = normalizeUrl(internal_toIriString(containerUrl), {
        trailingSlash: true,
    });
    const rawTurtle = await triplesToTurtle(toRdfJsQuads(solidDataset).map(getNamedNodesForLocalNodes));
    const headers = {
        "Content-Type": "text/turtle",
        Link: `<${ldp.Resource}>; rel="type"`,
    };
    if (options === null || options === void 0 ? void 0 : options.slugSuggestion) {
        headers.slug = options.slugSuggestion;
    }
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(normalizedUrl, {
        method: "POST",
        body: rawTurtle,
        headers,
    });
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Storing the Resource in the Container at [${normalizedUrl}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.\n\n` +
            `The SolidDataset that was sent to the Pod is listed below.\n\n${solidDatasetAsMarkdown(solidDataset)}`, response);
    }
    const internalResourceInfo = internal_parseResourceInfo(response);
    if (!internalResourceInfo.location) {
        throw new Error("Could not determine the location of the newly saved SolidDataset.");
    }
    let resourceIri;
    try {
        // Try to parse the location header as a URL (safe if it's an absolute URL)``
        // This should help determine the container URL if normalisation happened on the server side.
        resourceIri = new URL(internalResourceInfo.location).href;
    }
    catch (e) {
        // If it's a relative URL then, rely on the response.url to construct the sourceIri
        resourceIri = new URL(internalResourceInfo.location, response.url).href;
    }
    const resourceInfo = {
        internal_resourceInfo: {
            isRawData: false,
            sourceIri: resourceIri,
        },
    };
    const resourceWithResourceInfo = freeze({
        ...solidDataset,
        ...resourceInfo,
    });
    const resourceWithResolvedIris = resolveLocalIrisInSolidDataset(resourceWithResourceInfo);
    return resourceWithResolvedIris;
}
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
async function createContainerInContainer(containerUrl, options) {
    var _a;
    const normalizedUrl = normalizeUrl(internal_toIriString(containerUrl), {
        trailingSlash: true,
    });
    const headers = {
        "Content-Type": "text/turtle",
        Link: `<${ldp.BasicContainer}>; rel="type"`,
    };
    if (options === null || options === void 0 ? void 0 : options.slugSuggestion) {
        headers.slug = options.slugSuggestion;
    }
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(normalizedUrl, {
        method: "POST",
        headers,
    });
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Creating an empty Container in the Container at [${normalizedUrl}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
    const internalResourceInfo = internal_parseResourceInfo(response);
    if (!internalResourceInfo.location) {
        throw new Error("Could not determine the location of the newly created Container.");
    }
    try {
        // Try to parse the location header as a URL (safe if it's an absolute URL)``
        // This should help determine the container URL if normalisation happened on the server side.
        const sourceIri = new URL(internalResourceInfo.location).toString();
        return freeze({
            ...createSolidDataset(),
            internal_resourceInfo: {
                ...internalResourceInfo,
                sourceIri,
            },
        });
    }
    catch (e) {
        // If it's a relative URL then, rely on the response.url to construct the sourceIri
    }
    return freeze({
        ...createSolidDataset(),
        internal_resourceInfo: {
            ...internalResourceInfo,
            sourceIri: new URL(internalResourceInfo.location, response.url).href,
        },
    });
}
/**
 * Deletes the Container at a given URL.
 *
 * @param container The URL of the Container to delete or the Container Dataset itself (if it has ResourceInfo).
 * @since 0.6.0
 */
async function deleteContainer(container, options) {
    var _a;
    const normalizedUrl = hasResourceInfo(container)
        ? internal_toIriString(getSourceUrl(container))
        : normalizeUrl(internal_toIriString(container));
    if (!isContainer(container)) {
        throw new Error(`You're trying to delete the Container at [${normalizedUrl}], but Container URLs should end in a \`/\`. Are you sure this is a Container?`);
    }
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(normalizedUrl, {
        method: "DELETE",
    });
    if (internal_isUnsuccessfulResponse(response)) {
        throw new FetchError(`Deleting the Container at [${normalizedUrl}] failed: [${response.status}] [${response.statusText}] ${await response.text()}.`, response);
    }
}
function isChildResource(a, b) {
    const parent = new URL(b);
    const child = new URL(a);
    // Explicitly test on the whole URL to enforce similar origins.
    const isAncestor = child.href.startsWith(parent.href);
    const relativePath = child.pathname
        .substring(parent.pathname.length, child.pathname.length)
        .replace(/(^\/)|(\/$)/g, "");
    // The child path component that isn't present in the parent should only
    // potentially include slashes at the end (if it is a container).
    return isAncestor && relativePath.length >= 1 && !relativePath.includes("/");
}
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
function getContainedResourceUrlAll(solidDataset) {
    const containerUrl = getSourceUrl(solidDataset);
    const container = getThing(solidDataset, containerUrl);
    if (container === null) {
        return [];
    }
    // See https://www.w3.org/TR/2015/REC-ldp-20150226/#h-ldpc-http_post:
    // > a containment triple MUST be added to the state of the LDPC whose subject is the LDPC URI,
    // > whose predicate is ldp:contains and whose object is the URI for the newly created document
    return (getIriAll(container, ldp.contains)
        // See https://solidproject.org/TR/protocol#resource-containment
        .filter((childUrl) => isChildResource(childUrl, containerUrl)));
}
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
function validateContainedResourceAll(solidDataset) {
    const containerUrl = getSourceUrl(solidDataset);
    const container = getThing(solidDataset, containerUrl);
    if (container === null) {
        return { isValid: true, invalidContainedResources: [] };
    }
    // See https://www.w3.org/TR/2015/REC-ldp-20150226/#h-ldpc-http_post:
    // > a containment triple MUST be added to the state of the LDPC whose subject is the LDPC URI,
    // > whose predicate is ldp:contains and whose object is the URI for the newly created document
    const invalidChildren = getIriAll(container, ldp.contains)
        // See https://solidproject.org/TR/protocol#resource-containment
        .filter((childUrl) => !isChildResource(childUrl, containerUrl));
    if (invalidChildren.length > 0) {
        return { isValid: false, invalidContainedResources: invalidChildren };
    }
    return { isValid: true, invalidContainedResources: [] };
}
/**
 * Gets a human-readable representation of the given SolidDataset to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param solidDataset The [[SolidDataset]] to get a human-readable representation of.
 * @since 0.3.0
 */
function solidDatasetAsMarkdown(solidDataset) {
    let readableSolidDataset = "";
    if (hasResourceInfo(solidDataset)) {
        readableSolidDataset += `# SolidDataset: ${getSourceUrl(solidDataset)}\n`;
    }
    else {
        readableSolidDataset += `# SolidDataset (no URL yet)\n`;
    }
    const things = getThingAll(solidDataset);
    if (things.length === 0) {
        readableSolidDataset += "\n<empty>\n";
    }
    else {
        things.forEach((thing) => {
            readableSolidDataset += `\n${thingAsMarkdown(thing)}`;
            if (hasChangelog(solidDataset)) {
                readableSolidDataset += `\n${getReadableChangeLogSummary(solidDataset, thing)}\n`;
            }
        });
    }
    return readableSolidDataset;
}
/**
 * Gets a human-readable representation of the local changes to a Resource to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param solidDataset The Resource of which to get a human-readable representation of the changes applied to it locally.
 * @since 0.3.0
 */
function changeLogAsMarkdown(solidDataset) {
    if (!hasResourceInfo(solidDataset)) {
        return "This is a newly initialized SolidDataset, so there is no source to compare it to.";
    }
    if (!hasChangelog(solidDataset) ||
        (solidDataset.internal_changeLog.additions.length === 0 &&
            solidDataset.internal_changeLog.deletions.length === 0)) {
        return (`## Changes compared to ${getSourceUrl(solidDataset)}\n\n` +
            `This SolidDataset has not been modified since it was fetched from ${getSourceUrl(solidDataset)}.\n`);
    }
    let readableChangeLog = `## Changes compared to ${getSourceUrl(solidDataset)}\n`;
    const changeLogsByThingAndProperty = sortChangeLogByThingAndProperty(solidDataset);
    Object.keys(changeLogsByThingAndProperty).forEach((thingUrl) => {
        readableChangeLog += `\n### Thing: ${thingUrl}\n`;
        const changeLogByProperty = changeLogsByThingAndProperty[thingUrl];
        Object.keys(changeLogByProperty).forEach((propertyUrl) => {
            readableChangeLog += `\nProperty: ${propertyUrl}\n`;
            const { deleted } = changeLogByProperty[propertyUrl];
            const { added } = changeLogByProperty[propertyUrl];
            if (deleted.length > 0) {
                readableChangeLog += "- Removed:\n";
                readableChangeLog += deleted.reduce((acc, deletedValue) => {
                    return `${acc}  - ${internal_getReadableValue(deletedValue)}\n`;
                }, "");
            }
            if (added.length > 0) {
                readableChangeLog += "- Added:\n";
                readableChangeLog += added.reduce((acc, addedValue) => {
                    return `${acc}  - ${internal_getReadableValue(addedValue)}\n`;
                }, "");
            }
        });
    });
    return readableChangeLog;
}
function sortChangeLogByThingAndProperty(solidDataset) {
    const changeLogsByThingAndProperty = Object.create(null);
    solidDataset.internal_changeLog.deletions.forEach((deletion) => {
        var _a, _b;
        var _c;
        const subjectNode = isLocalNode(deletion.subject)
            ? /* istanbul ignore next: Unsaved deletions should be removed from the additions list instead, so this code path shouldn't be hit: */
                resolveIriForLocalNode(deletion.subject, getSourceUrl(solidDataset))
            : deletion.subject;
        if (!isNamedNode(subjectNode) || !isNamedNode(deletion.predicate)) {
            return;
        }
        const thingUrl = internal_toIriString(subjectNode);
        const propertyUrl = internal_toIriString(deletion.predicate);
        (_a = changeLogsByThingAndProperty[thingUrl]) !== null && _a !== void 0 ? _a : (changeLogsByThingAndProperty[thingUrl] = Object.create(null));
        (_b = (_c = changeLogsByThingAndProperty[thingUrl])[propertyUrl]) !== null && _b !== void 0 ? _b : (_c[propertyUrl] = {
            added: [],
            deleted: [],
        });
        changeLogsByThingAndProperty[thingUrl][propertyUrl].deleted.push(deletion.object);
    });
    solidDataset.internal_changeLog.additions.forEach((addition) => {
        var _a, _b;
        var _c;
        const subjectNode = isLocalNode(addition.subject)
            ? /* istanbul ignore next: setThing already resolves local Subjects when adding them, so this code path should never be hit. */
                resolveIriForLocalNode(addition.subject, getSourceUrl(solidDataset))
            : addition.subject;
        if (!isNamedNode(subjectNode) || !isNamedNode(addition.predicate)) {
            return;
        }
        const thingUrl = internal_toIriString(subjectNode);
        const propertyUrl = internal_toIriString(addition.predicate);
        (_a = changeLogsByThingAndProperty[thingUrl]) !== null && _a !== void 0 ? _a : (changeLogsByThingAndProperty[thingUrl] = Object.create(null));
        (_b = (_c = changeLogsByThingAndProperty[thingUrl])[propertyUrl]) !== null && _b !== void 0 ? _b : (_c[propertyUrl] = {
            added: [],
            deleted: [],
        });
        changeLogsByThingAndProperty[thingUrl][propertyUrl].added.push(addition.object);
    });
    return changeLogsByThingAndProperty;
}
function getReadableChangeLogSummary(solidDataset, thing) {
    const subject = n3.DataFactory.namedNode(thing.url);
    const nrOfAdditions = solidDataset.internal_changeLog.additions.reduce((count, addition) => (addition.subject.equals(subject) ? count + 1 : count), 0);
    const nrOfDeletions = solidDataset.internal_changeLog.deletions.reduce((count, deletion) => (deletion.subject.equals(subject) ? count + 1 : count), 0);
    const additionString = nrOfAdditions === 1
        ? "1 new value added"
        : `${nrOfAdditions} new values added`;
    const deletionString = nrOfDeletions === 1 ? "1 value removed" : `${nrOfDeletions} values removed`;
    return `(${additionString} / ${deletionString})`;
}
function getNamedNodesForLocalNodes(quad) {
    const subject = isNamedNode(quad.subject)
        ? getNamedNodeFromLocalNode(quad.subject)
        : /* istanbul ignore next: We don't allow non-NamedNodes as the Subject, so this code path should never be hit: */
            quad.subject;
    const object = isNamedNode(quad.object)
        ? getNamedNodeFromLocalNode(quad.object)
        : quad.object;
    return n3.DataFactory.quad(subject, quad.predicate, object, quad.graph);
}
function getNamedNodeFromLocalNode(node) {
    if (isLocalNodeIri(node.value)) {
        return n3.DataFactory.namedNode(`#${getLocalNodeName(node.value)}`);
    }
    return node;
}
function resolveLocalIrisInSolidDataset(solidDataset) {
    const resourceIri = getSourceUrl(solidDataset);
    const defaultGraph = solidDataset.graphs.default;
    const thingIris = Object.keys(defaultGraph);
    const updatedDefaultGraph = thingIris.reduce((graphAcc, thingIri) => {
        const resolvedThing = resolveLocalIrisInThing(graphAcc[thingIri], resourceIri);
        const resolvedThingIri = isLocalNodeIri(thingIri)
            ? `${resourceIri}#${getLocalNodeName(thingIri)}`
            : thingIri;
        const updatedGraph = { ...graphAcc };
        delete updatedGraph[thingIri];
        updatedGraph[resolvedThingIri] = resolvedThing;
        return freeze(updatedGraph);
    }, defaultGraph);
    const updatedGraphs = freeze({
        ...solidDataset.graphs,
        default: updatedDefaultGraph,
    });
    return freeze({
        ...solidDataset,
        graphs: updatedGraphs,
    });
}
function resolveLocalIrisInThing(thing, baseIri) {
    const predicateIris = Object.keys(thing.predicates);
    const updatedPredicates = predicateIris.reduce((predicatesAcc, predicateIri) => {
        var _a;
        const namedNodes = (_a = predicatesAcc[predicateIri].namedNodes) !== null && _a !== void 0 ? _a : [];
        if (namedNodes.every((namedNode) => !isLocalNodeIri(namedNode))) {
            // This Predicate has no local node Objects, so return it unmodified:
            return predicatesAcc;
        }
        const updatedNamedNodes = freeze(namedNodes.map((namedNode) => isLocalNodeIri(namedNode)
            ? `${baseIri}#${getLocalNodeName(namedNode)}`
            : namedNode));
        const updatedPredicate = freeze({
            ...predicatesAcc[predicateIri],
            namedNodes: updatedNamedNodes,
        });
        return freeze({
            ...predicatesAcc,
            [predicateIri]: updatedPredicate,
        });
    }, thing.predicates);
    return freeze({
        ...thing,
        predicates: updatedPredicates,
        url: isLocalNodeIri(thing.url)
            ? `${baseIri}#${getLocalNodeName(thing.url)}`
            : thing.url,
    });
}
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
async function getWellKnownSolid(url, options) {
    const urlString = internal_toIriString(url);
    // Try to fetch the well-known solid dataset from the server's root
    try {
        const wellKnownSolidUrl = new URL("/.well-known/solid", new URL(urlString).origin).href;
        return await getSolidDataset(wellKnownSolidUrl);
    }
    catch (e) {
        // In case of error, do nothing and try to discover the .well-known
        // at the pod's root.
    }
    // 1.1s implementation:
    const resourceMetadata = await getResourceInfo(urlString, {
        fetch: options === null || options === void 0 ? void 0 : options.fetch,
        // Discovering the .well-known/solid document is useful even for resources
        // we don't have access to.
        ignoreAuthenticationErrors: true,
    });
    const linkedResources = getLinkedResourceUrlAll(resourceMetadata);
    const rootResources = linkedResources[pim.storage];
    const rootResource = (rootResources === null || rootResources === void 0 ? void 0 : rootResources.length) === 1 ? rootResources[0] : null;
    // If pod root (storage) was advertised, retrieve well known solid from pod's root
    if (rootResource !== null) {
        const wellKnownSolidUrl = new URL(".well-known/solid", rootResource.endsWith("/") ? rootResource : `${rootResource}/`).href;
        return getSolidDataset(wellKnownSolidUrl, {
            ...options,
            parsers: {
                "application/ld+json": getJsonLdParser$1(),
            },
        });
    }
    throw new Error("Could not determine storage root or well-known solid resource.");
}

/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new [[SolidDataset]] with metadata as though the
 * SolidDataset has been retrieved from the given URL. The mock SolidDataset can be used in
 * unit tests that require persisted SolidDatasets; e.g., unit tests that call [[getSourceUrl]].
 *
 * @param url The URL from which the returned SolidDataset appears to be retrieved.
 * @returns A mock SolidDataset that appears to be retrieved from the `url`.
 * @since 0.2.0
 */
function mockSolidDatasetFrom(url) {
    const solidDataset = createSolidDataset();
    const solidDatasetWithResourceInfo = {
        ...solidDataset,
        internal_resourceInfo: {
            sourceIri: internal_toIriString(url),
            isRawData: false,
            contentType: "text/turtle",
            linkedResources: {},
        },
    };
    return solidDatasetWithResourceInfo;
}
/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new Container [[SolidDataset]] with metadata as though the
 * Container has been retrieved from the given URL. The mock SolidDataset can be used in
 * unit tests that require persisted Containers; e.g., unit tests that call [[isContainer]].
 *
 * @param url The URL from which the returned Container appears to be retrieved. The `url` must end in a slash.
 * @returns A mock SolidDataset that appears to be retrieved from the `url`.
 * @since 0.2.0
 */
function mockContainerFrom(url) {
    const sourceIri = internal_toIriString(url);
    if (!sourceIri.endsWith("/")) {
        throw new Error("A Container's URL should end in a slash. Please update your tests.");
    }
    return mockSolidDatasetFrom(sourceIri);
}
/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new File with metadata as though the
 * File has been retrieved from the given URL. The mock File can be used in
 * unit tests that require persisted Files; e.g. unit tests that call [[getSourceUrl]].
 *
 * @param url The URL from which the returned File appears to be retrieved.
 * @returns A mock File that appears to be retrieved from the `url`.
 * @since 0.2.0
 */
function mockFileFrom(url, options) {
    const file = new Blob();
    const fileWithResourceInfo = Object.assign(file, {
        internal_resourceInfo: {
            sourceIri: internal_toIriString(url),
            isRawData: true,
            contentType: options === null || options === void 0 ? void 0 : options.contentType,
            linkedResources: {},
        },
    });
    return fileWithResourceInfo;
}
/**
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests**.
 * ```
 *
 * This function initialises a new Error object with metadata as though the
 * it was the result of getting a 404 when trying to fetch the Resource at the
 * given URL. The mock Error can be used in unit tests that require functions
 * that fetch Resources (like [[getSolidDataset]]) to fail.
 *
 * @param url The URL of the Resource that could not be fetched according to the error.
 * @param statusCode Optional status code (defaults to 404) that caused the error.
 * @returns A mock Error that represents not having been able to fetch the Resource at `url` due to a 404 Response.
 * @since 1.1.0
 */
function mockFetchError(fetchedUrl, statusCode = 404, statusText = "Not Found") {
    // The Response constructor in Node 14 makes an empty status text undefined.
    const failedResponse = new Response(undefined, {
        status: statusCode,
        statusText,
    });
    return new FetchError(`Fetching the Resource at [${fetchedUrl}] failed: [${failedResponse.status}] [${failedResponse.statusText}].`, failedResponse);
}

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
const setUrl = (thing, property, url) => {
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    if (!isThing(url) && !internal_isValidUrl(url)) {
        throw new ValidValueUrlExpectedError(url);
    }
    return addUrl(removeAll(thing, property), property, url);
};
/** @hidden Alias of [[setUrl]] for those who prefer IRI terminology. */
const setIri = setUrl;
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
const setBoolean = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addBoolean(removeAll(thing, property), property, value);
};
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
const setDatetime = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addDatetime(removeAll(thing, property), property, value);
};
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
const setDate = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addDate(removeAll(thing, property), property, value);
};
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
const setTime = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addTime(removeAll(thing, property), property, value);
};
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
const setDecimal = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addDecimal(removeAll(thing, property), property, value);
};
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
const setInteger = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addInteger(removeAll(thing, property), property, value);
};
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
function setStringWithLocale(thing, property, value, locale) {
    internal_throwIfNotThing(thing);
    return addStringWithLocale(removeAll(thing, property), property, value, locale);
}
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
const setStringNoLocale = (thing, property, value) => {
    internal_throwIfNotThing(thing);
    return addStringNoLocale(removeAll(thing, property), property, value);
};
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
function setNamedNode(thing, property, value) {
    internal_throwIfNotThing(thing);
    return addNamedNode(removeAll(thing, property), property, value);
}
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
function setLiteral(thing, property, value) {
    internal_throwIfNotThing(thing);
    return addLiteral(removeAll(thing, property), property, value);
}
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
function setTerm(thing, property, value) {
    internal_throwIfNotThing(thing);
    if (!internal_isValidUrl(property)) {
        throw new ValidPropertyUrlExpectedError(property);
    }
    return addTerm(removeAll(thing, property), property, value);
}

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
 * Create or modify a [[Thing]], setting multiple properties in a single expresssion.
 *
 * For example, you can create a new Thing and initialise several properties as follows:
 *
 *     const me = buildThing()
 *       .addUrl(rdf.type, schema.Person)
 *       .addStringNoLocale(schema.givenName, "Vincent")
 *       .build();
 *
 * Take note of the final call to `.build()` to obtain the actual Thing.
 *
 * @param init Optionally pass an existing [[Thing]] to modify the properties of. If left empty, `buildThing` will initialise a new Thing.
 * @returns a [[ThingBuilder]], a Fluent API that allows you to set multiple properties in a single expression.
 * @since 1.9.0
 */
function buildThing(init = createThing()) {
    let thing = isThing(init) ? init : createThing(init);
    function getAdder(adder) {
        return (property, value) => {
            thing = adder(thing, property, value);
            return builder;
        };
    }
    function getSetter(setter) {
        return (property, value) => {
            thing = setter(thing, property, value);
            return builder;
        };
    }
    function getRemover(remover) {
        return (property, value) => {
            thing = remover(thing, property, value);
            return builder;
        };
    }
    const builder = {
        build: () => thing,
        addUrl: getAdder(addUrl),
        addIri: getAdder(addIri),
        addBoolean: getAdder(addBoolean),
        addDatetime: getAdder(addDatetime),
        addDate: getAdder(addDate),
        addTime: getAdder(addTime),
        addDecimal: getAdder(addDecimal),
        addInteger: getAdder(addInteger),
        addStringNoLocale: getAdder(addStringNoLocale),
        addStringEnglish: (property, value) => {
            thing = addStringWithLocale(thing, property, value, "en");
            return builder;
        },
        addStringWithLocale: (property, value, locale) => {
            thing = addStringWithLocale(thing, property, value, locale);
            return builder;
        },
        addNamedNode: getAdder(addNamedNode),
        addLiteral: getAdder(addLiteral),
        addTerm: getAdder(addTerm),
        setUrl: getSetter(setUrl),
        setIri: getSetter(setIri),
        setBoolean: getSetter(setBoolean),
        setDatetime: getSetter(setDatetime),
        setDate: getSetter(setDate),
        setTime: getSetter(setTime),
        setDecimal: getSetter(setDecimal),
        setInteger: getSetter(setInteger),
        setStringNoLocale: getSetter(setStringNoLocale),
        setStringEnglish: (property, value) => {
            thing = setStringWithLocale(thing, property, value, "en");
            return builder;
        },
        setStringWithLocale: (property, value, locale) => {
            thing = setStringWithLocale(thing, property, value, locale);
            return builder;
        },
        setNamedNode: getSetter(setNamedNode),
        setLiteral: getSetter(setLiteral),
        setTerm: getSetter(setTerm),
        removeAll: (property) => {
            thing = removeAll(thing, property);
            return builder;
        },
        removeUrl: getRemover(removeUrl),
        removeIri: getRemover(removeIri),
        removeBoolean: getRemover(removeBoolean),
        removeDatetime: getRemover(removeDatetime),
        removeDate: getRemover(removeDate),
        removeTime: getRemover(removeTime),
        removeDecimal: getRemover(removeDecimal),
        removeInteger: getRemover(removeInteger),
        removeStringNoLocale: getRemover(removeStringNoLocale),
        removeStringEnglish: (property, value) => buildThing(removeStringWithLocale(thing, property, value, "en")),
        removeStringWithLocale: (property, value, locale) => buildThing(removeStringWithLocale(thing, property, value, locale)),
        removeNamedNode: getRemover(removeNamedNode),
        removeLiteral: getRemover(removeLiteral),
    };
    return builder;
}

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
function mockThingFrom(url) {
    const iri = internal_toIriString(url);
    const thing = {
        type: "Subject",
        predicates: {},
        url: iri,
    };
    return thing;
}

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
 * @param linkedAccessResource A Resource exposed via the Link header of another Resource with rel="acl".
 * @returns Whether that Resource is an ACP ACR or not (in which case it's likely a WAC ACL).
 */
function isAcr(linkedAccessResource) {
    const relTypeLinks = getLinkedResourceUrlAll(linkedAccessResource).type;
    return (Array.isArray(relTypeLinks) &&
        relTypeLinks.includes(acp.AccessControlResource));
}

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
 * This (currently internal) function fetches the ACL indicated in the [[WithServerResourceInfo]]
 * attached to a resource.
 *
 * @internal
 * @param resourceInfo The Resource info with the ACL URL
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters).
 */
async function internal_fetchAcl(resourceInfo, options) {
    if (!hasAccessibleAcl(resourceInfo)) {
        return {
            resourceAcl: null,
            fallbackAcl: null,
        };
    }
    try {
        const resourceAcl = await internal_fetchResourceAcl(resourceInfo, options);
        const acl = resourceAcl === null
            ? {
                resourceAcl: null,
                fallbackAcl: await internal_fetchFallbackAcl(resourceInfo, options),
            }
            : { resourceAcl, fallbackAcl: null };
        return acl;
    }
    catch (e) {
        /* istanbul ignore else: fetchResourceAcl swallows all non-AclIsAcrErrors */
        if (e instanceof AclIsAcrError) {
            return {
                resourceAcl: null,
                fallbackAcl: null,
            };
        }
        /* istanbul ignore next: fetchResourceAcl swallows all non-AclIsAcrErrors */
        throw e;
    }
}
/** @internal */
async function internal_fetchResourceAcl(dataset, options) {
    if (!hasAccessibleAcl(dataset)) {
        return null;
    }
    try {
        const aclSolidDataset = await getSolidDataset(dataset.internal_resourceInfo.aclUrl, options);
        if (isAcr(aclSolidDataset)) {
            throw new AclIsAcrError(dataset, aclSolidDataset);
        }
        return freeze({
            ...aclSolidDataset,
            internal_accessTo: getSourceUrl(dataset),
        });
    }
    catch (e) {
        if (e instanceof AclIsAcrError) {
            throw e;
        }
        // Since a Solid server adds a `Link` header to an ACL even if that ACL does not exist,
        // failure to fetch the ACL is expected to happen - we just return `null` and let callers deal
        // with it.
        return null;
    }
}
/** @internal */
async function internal_fetchFallbackAcl(resource, options) {
    const resourceUrl = new URL(getSourceUrl(resource));
    const resourcePath = resourceUrl.pathname;
    // Note: we're currently assuming that the Origin is the root of the Pod. However, it is not yet
    //       set in stone that that will always be the case. We might need to check the Container's
    //       metadata at some point in time to check whether it is actually the root of the Pod.
    //       See: https://github.com/solid/specification/issues/153#issuecomment-624630022
    if (resourcePath === "/") {
        // We're already at the root, so there's no Container we can retrieve:
        return null;
    }
    const containerPath = internal_getContainerPath(resourcePath);
    const containerIri = new URL(containerPath, resourceUrl.origin).href;
    const containerInfo = await getResourceInfo(containerIri, options);
    if (!hasAccessibleAcl(containerInfo)) {
        // If the current user does not have access to this Container's ACL,
        // we cannot determine whether its ACL is the one that applies. Thus, return null:
        return null;
    }
    const containerAcl = await internal_fetchResourceAcl(containerInfo, options);
    if (containerAcl === null) {
        return internal_fetchFallbackAcl(containerInfo, options);
    }
    return containerAcl;
}
/**
 * Given the path to a Resource, get the URL of the Container one level up in the hierarchy.
 * @param resourcePath The path of the Resource of which we need to determine the Container's path.
 * @hidden For internal use only.
 */
function internal_getContainerPath(resourcePath) {
    const resourcePathWithoutTrailingSlash = resourcePath.substring(resourcePath.length - 1) === "/"
        ? resourcePath.substring(0, resourcePath.length - 1)
        : resourcePath;
    const containerPath = `${resourcePath.substring(0, resourcePathWithoutTrailingSlash.lastIndexOf("/"))}/`;
    return containerPath;
}
/** @internal */
function internal_getAclRules(aclDataset) {
    const things = getThingAll(aclDataset);
    return things.filter(isAclRule);
}
function isAclRule(thing) {
    return getIriAll(thing, rdf.type).includes(acl.Authorization);
}
/** @internal */
function internal_getResourceAclRulesForResource(aclRules, resource) {
    return aclRules.filter((rule) => appliesToResource(rule, resource));
}
function appliesToResource(aclRule, resource) {
    return getIriAll(aclRule, acl.accessTo).includes(resource);
}
/** @internal */
function internal_getDefaultAclRulesForResource(aclRules, resource) {
    return aclRules.filter((rule) => isDefaultForResource(rule, resource));
}
function isDefaultForResource(aclRule, resource) {
    return (getIriAll(aclRule, acl.default).includes(resource) ||
        getIriAll(aclRule, acl.defaultForNew).includes(resource));
}
/** @internal */
function internal_getAccess(rule) {
    const ruleAccessModes = getIriAll(rule, acl.mode);
    const writeAccess = ruleAccessModes.includes(internal_accessModeIriStrings.write);
    return writeAccess
        ? {
            read: ruleAccessModes.includes(internal_accessModeIriStrings.read),
            append: true,
            write: true,
            control: ruleAccessModes.includes(internal_accessModeIriStrings.control),
        }
        : {
            read: ruleAccessModes.includes(internal_accessModeIriStrings.read),
            append: ruleAccessModes.includes(internal_accessModeIriStrings.append),
            write: false,
            control: ruleAccessModes.includes(internal_accessModeIriStrings.control),
        };
}
/** @internal */
function internal_combineAccessModes(modes) {
    return modes.reduce((accumulator, current) => {
        const writeAccess = accumulator.write || current.write;
        return writeAccess
            ? {
                read: accumulator.read || current.read,
                append: true,
                write: true,
                control: accumulator.control || current.control,
            }
            : {
                read: accumulator.read || current.read,
                append: accumulator.append || current.append,
                write: false,
                control: accumulator.control || current.control,
            };
    }, { read: false, append: false, write: false, control: false });
}
/** @internal */
function internal_removeEmptyAclRules(aclDataset) {
    const aclRules = internal_getAclRules(aclDataset);
    const aclRulesToRemove = aclRules.filter(isEmptyAclRule);
    // Is this too clever? It iterates over aclRulesToRemove, one by one removing them from aclDataset.
    const updatedAclDataset = aclRulesToRemove.reduce(removeThing, aclDataset);
    return updatedAclDataset;
}
function isEmptyAclRule(aclRule) {
    // If there are Quads in there unrelated to Access Control,
    // this is not an empty ACL rule that can be deleted:
    if (subjectToRdfJsQuads(aclRule.predicates, n3.DataFactory.namedNode(aclRule.url), n3.DataFactory.defaultGraph()).some((quad) => !isAclQuad(quad))) {
        return false;
    }
    // If the rule does not apply to any Resource, it is no longer working:
    if (getIri(aclRule, acl.accessTo) === null &&
        getIri(aclRule, acl.default) === null &&
        getIri(aclRule, acl.defaultForNew) === null) {
        return true;
    }
    // If the rule does not specify Access Modes, it is no longer working:
    if (getIri(aclRule, acl.mode) === null) {
        return true;
    }
    // If the rule does not specify whom it applies to, it is no longer working:
    if (getIri(aclRule, acl.agent) === null &&
        getIri(aclRule, acl.agentGroup) === null &&
        getIri(aclRule, acl.agentClass) === null) {
        return true;
    }
    return false;
}
function isAclQuad(quad) {
    const { predicate } = quad;
    const { object } = quad;
    if (predicate.equals(n3.DataFactory.namedNode(rdf.type)) &&
        object.equals(n3.DataFactory.namedNode(acl.Authorization))) {
        return true;
    }
    if (predicate.equals(n3.DataFactory.namedNode(acl.accessTo)) ||
        predicate.equals(n3.DataFactory.namedNode(acl.default)) ||
        predicate.equals(n3.DataFactory.namedNode(acl.defaultForNew))) {
        return true;
    }
    if (predicate.equals(n3.DataFactory.namedNode(acl.mode)) &&
        Object.values(internal_accessModeIriStrings).some((mode) => object.equals(n3.DataFactory.namedNode(mode)))) {
        return true;
    }
    if (predicate.equals(n3.DataFactory.namedNode(acl.agent)) ||
        predicate.equals(n3.DataFactory.namedNode(acl.agentGroup)) ||
        predicate.equals(n3.DataFactory.namedNode(acl.agentClass))) {
        return true;
    }
    if (predicate.equals(n3.DataFactory.namedNode(acl.origin))) {
        return true;
    }
    return false;
}
/**
 * IRIs of potential Access Modes
 * @internal
 */
const internal_accessModeIriStrings = {
    read: "http://www.w3.org/ns/auth/acl#Read",
    append: "http://www.w3.org/ns/auth/acl#Append",
    write: "http://www.w3.org/ns/auth/acl#Write",
    control: "http://www.w3.org/ns/auth/acl#Control",
};
/** @internal
 * This function finds, among a set of ACL rules, the ones granting access to a given entity (the target)
 * and identifying it with a specific property (`acl:agent` or `acl:agentGroup`).
 * @param aclRules The set of rules to filter
 * @param targetIri The IRI of the target
 * @param targetType The property linking the rule to the target
 */
function internal_getAclRulesForIri(aclRules, targetIri, targetType) {
    return aclRules.filter((rule) => getIriAll(rule, targetType).includes(targetIri));
}
/** @internal
 * This function transforms a given set of rules into a map associating the IRIs
 * of the entities to which permissions are granted by these rules, and the permissions
 * granted to them. Additionally, it filters these entities based on the predicate
 * that refers to them in the rule.
 */
function internal_getAccessByIri(aclRules, targetType) {
    const targetIriAccess = {};
    aclRules.forEach((rule) => {
        const ruleTargetIri = getIriAll(rule, targetType);
        const access = internal_getAccess(rule);
        // A rule might apply to multiple agents. If multiple rules apply to the same agent, the Access
        // Modes granted by those rules should be combined:
        ruleTargetIri.forEach((targetIri) => {
            targetIriAccess[targetIri] =
                typeof targetIriAccess[targetIri] === "undefined"
                    ? access
                    : internal_combineAccessModes([targetIriAccess[targetIri], access]);
        });
    });
    return targetIriAccess;
}
/**
 * Initialises a new ACL Rule that grants some access - but does not yet specify to whom.
 *
 * @hidden This is an internal utility function that should not be used directly by downstreams.
 * @param access Access mode that this Rule will grant
 */
function internal_initialiseAclRule(access) {
    let newRule = createThing();
    newRule = setIri(newRule, rdf.type, acl.Authorization);
    if (access.read) {
        newRule = addIri(newRule, acl.mode, internal_accessModeIriStrings.read);
    }
    if (access.append && !access.write) {
        newRule = addIri(newRule, acl.mode, internal_accessModeIriStrings.append);
    }
    if (access.write) {
        newRule = addIri(newRule, acl.mode, internal_accessModeIriStrings.write);
    }
    if (access.control) {
        newRule = addIri(newRule, acl.mode, internal_accessModeIriStrings.control);
    }
    return newRule;
}
/**
 * Creates a new ACL Rule with the same ACL values as the input ACL Rule, but having a different IRI.
 *
 * Note that non-ACL values will not be copied over.
 *
 * @hidden This is an internal utility function that should not be used directly by downstreams.
 * @param sourceRule ACL rule to duplicate.
 */
function internal_duplicateAclRule(sourceRule) {
    let targetRule = createThing();
    targetRule = setIri(targetRule, rdf.type, acl.Authorization);
    function copyIris(inputRule, outputRule, predicate) {
        return getIriAll(inputRule, predicate).reduce((outputRule, iriTarget) => addIri(outputRule, predicate, iriTarget), outputRule);
    }
    targetRule = copyIris(sourceRule, targetRule, acl.accessTo);
    targetRule = copyIris(sourceRule, targetRule, acl.default);
    targetRule = copyIris(sourceRule, targetRule, acl.defaultForNew);
    targetRule = copyIris(sourceRule, targetRule, acl.agent);
    targetRule = copyIris(sourceRule, targetRule, acl.agentGroup);
    targetRule = copyIris(sourceRule, targetRule, acl.agentClass);
    targetRule = copyIris(sourceRule, targetRule, acl.origin);
    targetRule = copyIris(sourceRule, targetRule, acl.mode);
    return targetRule;
}
function internal_setAcl(resource, acl) {
    return Object.assign(internal_cloneResource(resource), { internal_acl: acl });
}
const supportedActorPredicates = [
    acl.agent,
    acl.agentClass,
    acl.agentGroup,
    acl.origin,
];
/**
 * Given an ACL Rule, returns two new ACL Rules that cover all the input Rule's use cases,
 * except for giving the given Actor access to the given Resource.
 *
 * @param rule The ACL Rule that should no longer apply for a given Actor to a given Resource.
 * @param actor The Actor that should be removed from the Rule for the given Resource.
 * @param resourceIri The Resource to which the Rule should no longer apply for the given Actor.
 * @returns A tuple with the original ACL Rule without the given Actor, and a new ACL Rule for the given Actor for the remaining Resources, respectively.
 */
function internal_removeActorFromRule(rule, actor, actorPredicate, resourceIri, ruleType) {
    // If the existing Rule does not apply to the given Actor, we don't need to split up.
    // Without this check, we'd be creating a new rule for the given Actor (ruleForOtherTargets)
    // that would give it access it does not currently have:
    if (!getIriAll(rule, actorPredicate).includes(actor)) {
        const emptyRule = internal_initialiseAclRule({
            read: false,
            append: false,
            write: false,
            control: false,
        });
        return [rule, emptyRule];
    }
    // The existing rule will keep applying to Actors other than the given one:
    const ruleWithoutActor = removeIri(rule, actorPredicate, actor);
    // The actor might have been given other access in the existing rule, so duplicate it...
    let ruleForOtherTargets = internal_duplicateAclRule(rule);
    // ...but remove access to the original Resource...
    ruleForOtherTargets = removeIri(ruleForOtherTargets, ruleType === "resource" ? acl.accessTo : acl.default, resourceIri);
    // Prevents the legacy predicate 'acl:defaultForNew' to lead to privilege escalation
    if (ruleType === "default") {
        ruleForOtherTargets = removeIri(ruleForOtherTargets, acl.defaultForNew, resourceIri);
    }
    // ...and only apply the new Rule to the given Actor (because the existing Rule covers the others):
    ruleForOtherTargets = setIri(ruleForOtherTargets, actorPredicate, actor);
    supportedActorPredicates
        .filter((predicate) => predicate !== actorPredicate)
        .forEach((predicate) => {
        ruleForOtherTargets = removeAll(ruleForOtherTargets, predicate);
    });
    return [ruleWithoutActor, ruleForOtherTargets];
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the given Agent.
 * Specifically, the function returns a new resource ACL initialised with the given ACL and
 * new rules for the Actor's access.
 *
 * If rules for Actor's access already exist in the given ACL, in the returned ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 *
 * - Access Modes granted indirectly to Actors through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to Actors for the child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param actor The Actor to grant specific Access Modes.
 * @param access The Access Modes to grant to the Actor for the Resource.
 * @returns A new resource ACL initialised with the given `aclDataset` and `access` for the `agent`.
 */
function internal_setActorAccess(aclDataset, access, actorPredicate, accessType, actor) {
    // First make sure that none of the pre-existing rules in the given ACL SolidDataset
    // give the Agent access to the Resource:
    let filteredAcl = aclDataset;
    getThingAll(aclDataset).forEach((aclRule) => {
        // Obtain both the Rule that no longer includes the given Actor,
        // and a new Rule that includes all ACL Quads
        // that do not pertain to the given Actor-Resource combination.
        // Note that usually, the latter will no longer include any meaningful statements;
        // we'll clean them up afterwards.
        const [filteredRule, remainingRule] = internal_removeActorFromRule(aclRule, actor, actorPredicate, aclDataset.internal_accessTo, accessType);
        filteredAcl = setThing(filteredAcl, filteredRule);
        filteredAcl = setThing(filteredAcl, remainingRule);
    });
    // Create a new Rule that only grants the given Actor the given Access Modes:
    let newRule = internal_initialiseAclRule(access);
    newRule = setIri(newRule, accessType === "resource" ? acl.accessTo : acl.default, aclDataset.internal_accessTo);
    newRule = setIri(newRule, actorPredicate, actor);
    const updatedAcl = setThing(filteredAcl, newRule);
    // Remove any remaining Rules that do not contain any meaningful statements:
    return internal_removeEmptyAclRules(updatedAcl);
}
function internal_setResourceAcl(resource, acl) {
    const newAcl = {
        resourceAcl: acl,
        fallbackAcl: null,
    };
    return internal_setAcl(resource, newAcl);
}
function internal_getResourceAcl(resource) {
    return resource.internal_acl.resourceAcl;
}
/**
 * This error indicates that, if we're following a Link with rel="acl",
 * it does not result in a WAC ACL, but in an ACP ACR.
 */
class AclIsAcrError extends Error {
    constructor(sourceResource, aclResource) {
        super(`[${getSourceIri(sourceResource)}] is governed by Access Control Policies in [${getSourceIri(aclResource)}] rather than by Web Access Control.`);
    }
}

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
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Verify whether a given SolidDataset was fetched together with its Access Control List.
 *
 * @param dataset A [[SolidDataset]] that may have its ACLs attached.
 * @returns True if `dataset` was fetched together with its ACLs.
 */
function hasAcl(dataset) {
    const potentialAcl = dataset;
    return typeof potentialAcl.internal_acl === "object";
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Verifies whether the given Resource has a resource ACL (Access Control List) attached.
 *
 * The [[hasResourceAcl]] function checks that:
 * - a given Resource has a resource ACL attached, and
 * - the user calling [[hasResourceAcl]] has Control access to the Resource.
 *
 * To retrieve a Resource with its ACLs, see [[getSolidDatasetWithAcl]].
 *
 * @param resource A Resource that might have an ACL attached.
 * @returns `true` if the Resource has a resource ACL attached that is accessible by the user.
 */
function hasResourceAcl(resource) {
    return (resource.internal_acl.resourceAcl !== null &&
        getSourceUrl(resource) ===
            resource.internal_acl.resourceAcl.internal_accessTo &&
        resource.internal_resourceInfo.aclUrl ===
            getSourceUrl(resource.internal_acl.resourceAcl));
}
/**
 * Experimental: fetch a SolidDataset and its associated Access Control List.
 *
 * This is an experimental function that fetches both a Resource, the linked ACL Resource (if
 * available), and the ACL that applies to it if the linked ACL Resource is not available. This can
 * result in many HTTP requests being executed, in lieu of the Solid spec mandating servers to
 * provide this info in a single request. Therefore, and because this function is still
 * experimental, prefer [[getSolidDataset]] instead.
 *
 * If the Resource does not advertise the ACL Resource (because the authenticated user does not have
 * access to it), the `acl` property in the returned value will be null. `acl.resourceAcl` will be
 * undefined if the Resource's linked ACL Resource could not be fetched (because it does not exist),
 * and `acl.fallbackAcl` will be null if the applicable Container's ACL is not accessible to the
 * authenticated user.
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A SolidDataset and the ACLs that apply to it, if available to the authenticated user.
 */
async function getSolidDatasetWithAcl(url, options) {
    const solidDataset = await getSolidDataset(url, options);
    const acl = await internal_fetchAcl(solidDataset, options);
    return internal_setAcl(solidDataset, acl);
}
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Retrieves a file, its resource ACL (Access Control List) if available,
 * and its fallback ACL from a URL and returns them as a blob.
 *
 * If the user calling the function does not have access to the file's resource ACL,
 * [[hasAccessibleAcl]] on the returned blob returns false.
 * If the user has access to the file's resource ACL but the resource ACL does not exist,
 * [[getResourceAcl]] on the returned blob returns null.
 * If the fallback ACL is inaccessible by the user,
 * [[getFallbackAcl]] on the returned blob returns null.
 *
 * ```{tip}
 * To retrieve the ACLs, the function results in multiple HTTP requests rather than a single
 * request as mandated by the Solid spec. As such, prefer [[getFile]] instead if you do not need the ACL.
 * ```
 *
 * @param url The URL of the fetched file
 * @param options Fetching options: a custom fetcher and/or headers.
 * @returns A file and its ACLs, if available to the authenticated user, as a blob.
 * @since 0.2.0
 */
async function getFileWithAcl(input, options) {
    const file = await getFile(input, options);
    const acl = await internal_fetchAcl(file, options);
    return internal_setAcl(file, acl);
}
/**
 * Experimental: fetch a Resource's metadata and its associated Access Control List.
 *
 * This is an experimental function that fetches both a Resource's metadata, the linked ACL Resource (if
 * available), and the ACL that applies to it if the linked ACL Resource is not available (if accessible). This can
 * result in many HTTP requests being executed, in lieu of the Solid spec mandating servers to
 * provide this info in a single request.
 *
 * If the Resource's linked ACL Resource could not be fetched (because it does not exist, or because
 * the authenticated user does not have access to it), `acl.resourceAcl` will be `null`. If the
 * applicable Container's ACL is not accessible to the authenticated user, `acl.fallbackAcl` will be
 * `null`.
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A Resource's metadata and the ACLs that apply to the Resource, if available to the authenticated user.
 */
async function getResourceInfoWithAcl(url, options) {
    const resourceInfo = await getResourceInfo(url, options);
    const acl = await internal_fetchAcl(resourceInfo, options);
    return internal_setAcl(resourceInfo, acl);
}
function getResourceAcl(resource) {
    if (!hasResourceAcl(resource)) {
        return null;
    }
    return resource.internal_acl.resourceAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Verifies whether the given Resource has a fallback ACL (Access Control List) attached.
 *
 * A fallback ACL for a Resource is inherited from the Resource's parent Container
 * (or another of its ancestor Containers) and applies if the Resource does
 * not have its own resource ACL.
 *
 * The [[hasFallbackAcl]] function checks that:
 * - a given Resource has a fallback ACL attached, and
 * - the user calling [[hasFallbackAcl]] has Control access to the Container
 * from which the Resource inherits its ACL.
 *
 * To retrieve a Resource with its ACLs, see [[getSolidDatasetWithAcl]].
 *
 * @param resource A [[SolidDataset]] that might have a fallback ACL attached.
 *
 * @returns `true` if the Resource has a fallback ACL attached that is accessible to the user.
 */
function hasFallbackAcl(resource) {
    return resource.internal_acl.fallbackAcl !== null;
}
function getFallbackAcl(dataset) {
    if (!hasFallbackAcl(dataset)) {
        return null;
    }
    return dataset.internal_acl.fallbackAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Creates an empty resource ACL (Access Control List) for a given Resource.
 *
 * @param targetResource A Resource that does not have its own ACL yet (see [[hasResourceAcl]]).
 * @returns An empty resource ACL for the given Resource.
 */
function createAcl(targetResource) {
    const emptyResourceAcl = freeze({
        ...createSolidDataset(),
        internal_accessTo: getSourceUrl(targetResource),
        internal_resourceInfo: {
            sourceIri: targetResource.internal_resourceInfo.aclUrl,
            isRawData: false,
            linkedResources: {},
        },
    });
    return emptyResourceAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Creates a resource ACL (Access Control List), initialised from the fallback ACL
 * inherited from the given Resource's Container (or another of its ancestor Containers).
 * That is, the new ACL has the same rules/entries as the fallback ACL that currently
 * applies to the Resource.
 *
 * @param resource A Resource without its own resource ACL (see [[hasResourceAcl]]) but with an accessible fallback ACL (see [[hasFallbackAcl]]).
 * @returns A resource ACL initialised with the rules/entries from the Resource's fallback ACL.
 */
function createAclFromFallbackAcl(resource) {
    const emptyResourceAcl = createAcl(resource);
    const fallbackAclRules = internal_getAclRules(resource.internal_acl.fallbackAcl);
    const defaultAclRules = internal_getDefaultAclRulesForResource(fallbackAclRules, resource.internal_acl.fallbackAcl.internal_accessTo);
    const newAclRules = defaultAclRules.map((rule) => {
        rule = removeAll(rule, acl.default);
        rule = removeAll(rule, acl.defaultForNew);
        rule = setIri(rule, acl.accessTo, getSourceUrl(resource));
        rule = setIri(rule, acl.default, getSourceUrl(resource));
        return rule;
    });
    // Iterate over every ACL Rule we want to import, inserting them into `emptyResourceAcl` one by one:
    const initialisedResourceAcl = newAclRules.reduce(setThing, emptyResourceAcl);
    return initialisedResourceAcl;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Saves the resource ACL for a Resource.
 *
 * @param resource The Resource to which the given resource ACL applies.
 * @param resourceAcl An [[AclDataset]] whose ACL Rules will apply to `resource`.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 */
async function saveAclFor(resource, resourceAcl, options) {
    if (!hasAccessibleAcl(resource)) {
        throw new Error(`Could not determine the location of the ACL for the Resource at [${getSourceUrl(resource)}]; possibly the current user does not have Control access to that Resource. Try calling \`hasAccessibleAcl()\` before calling \`saveAclFor()\`.`);
    }
    const savedDataset = await saveSolidDatasetAt(resource.internal_resourceInfo.aclUrl, resourceAcl, options);
    const savedAclDataset = {
        ...savedDataset,
        internal_accessTo: getSourceUrl(resource),
    };
    return savedAclDataset;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the resource ACL (Access Control List) from a Resource.
 *
 * Once the resource ACL is removed from the Resource, the Resource relies on the
 * fallback ACL inherited from the Resource's parent Container (or another of its ancestor Containers).
 *
 * @param resource The Resource for which you want to delete the ACL.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 */
async function deleteAclFor(resource, options) {
    var _a;
    const response = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(resource.internal_resourceInfo.aclUrl, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Deleting the ACL of the Resource at [${getSourceUrl(resource)}] failed: [${response.status}] [${response.statusText}].`);
    }
    const storedResource = Object.assign(internal_cloneResource(resource), {
        acl: {
            resourceAcl: null,
        },
    });
    return storedResource;
}
/**
 * Given a [[SolidDataset]], verify whether its Access Control List is accessible to the current user.
 *
 * This should generally only be true for SolidDatasets fetched by
 * [[getSolidDatasetWithAcl]].
 *
 * Please note that the Web Access Control specification is not yet finalised, and hence, this
 * function is still experimental and can change in a non-major release.
 *
 * @param dataset A [[SolidDataset]].
 * @returns Whether the given `dataset` has a an ACL that is accessible to the current user.
 */
function hasAccessibleAcl(dataset) {
    return typeof dataset.internal_resourceInfo.aclUrl === "string";
}

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
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns an Agent's explicitly-granted Access Modes for the given Resource.
 *
 * The function does not return Access Modes granted indirectly to the Agent through other
 * ACL rules, e.g., public or group-specific permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Agent may have been granted access.
 * @param agent WebID of the Agent for which to retrieve what access it has to the Resource.
 * @returns Access Modes that have been explicitly granted to the Agent for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control access to a given Resource or its Container).
 */
function getAgentAccess$3(resourceInfo, agent) {
    if (hasResourceAcl(resourceInfo)) {
        return getAgentResourceAccess(resourceInfo.internal_acl.resourceAcl, agent);
    }
    if (hasFallbackAcl(resourceInfo)) {
        return getAgentDefaultAccess(resourceInfo.internal_acl.fallbackAcl, agent);
    }
    return null;
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Returns all explicitly-granted Access Modes per Agent for the given Resource.
 *
 * The function does not return Access Modes granted indirectly to Agents through other
 * ACL rules, e.g., public or group-specific permissions.
 *
 * @param resourceInfo Information about the Resource to which Agents may have been granted access.
 * @returns Access Modes per Agent that have been explicitly granted for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control access to a given Resource or its Container).
 */
function getAgentAccessAll$3(resourceInfo) {
    if (hasResourceAcl(resourceInfo)) {
        const resourceAcl = getResourceAcl(resourceInfo);
        return getAgentResourceAccessAll(resourceAcl);
    }
    if (hasFallbackAcl(resourceInfo)) {
        const fallbackAcl = getFallbackAcl(resourceInfo);
        return getAgentDefaultAccessAll(fallbackAcl);
    }
    return null;
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes explicitly granted to an Agent for the Resource
 * associated with an ACL (Access ControlList).
 *
 * The function does not return:
 *
 * - Access Modes granted indirectly to the Agent through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to the Agent for the child Resources if the associated Resource is a Container (see [[getAgentDefaultAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains ACL rules.
 * @param agent WebID of the Agent for which to retrieve what access it has to the Resource.
 * @returns Access Modes that have been explicitly granted to an Agent for the Resource associated with an ACL SolidDataset.
 */
function getAgentResourceAccess(aclDataset, agent) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getResourceAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRulesForAgent(resourceRules, agent);
    const agentAccessModes = agentResourceRules.map(internal_getAccess);
    return internal_combineAccessModes(agentAccessModes);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the explicitly granted Access Modes per Agent for the Resource associated
 * with an ACL (Access Control List).
 *
 * The function does not return:
 *
 * - Access Modes granted indirectly to Agents through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to Agents for the child Resources if the associated Resource is a Container.
 *
 * @param aclDataset The SolidDataset that contains ACL rules.
 * @returns Access Modes per Agent that have been explicitly granted for the Resource associated with an ACL SolidDataset.
 */
function getAgentResourceAccessAll(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getResourceAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRules(resourceRules);
    return getAccessByAgent(agentResourceRules);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the given Agent.
 * Specifically, the function returns a new resource ACL initialised with the given ACL and
 * new rules for the Agent's access.
 *
 * If rules for Agent's access already exist in the given ACL, in the returned ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 *
 * - Access Modes granted indirectly to Agents through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to Agents for the child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param agent The Agent to grant specific Access Modes.
 * @param access The Access Modes to grant to the Agent for the Resource.
 * @returns A new resource ACL initialised with the given `aclDataset` and `access` for the `agent`.
 */
function setAgentResourceAccess$1(aclDataset, agent, access) {
    return internal_setActorAccess(aclDataset, access, acl.agent, "resource", agent);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns an Agent's Access Modes explicitly granted for the children of the
 * Container associated with the given ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Agent through other ACL rules, e.g. public or group-specific permissions.
 * - Access Modes granted to the Agent for the Container Resource itself (see [[getAgentResourceAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules for a certain Container.
 * @param agent WebID of the Agent for which to retrieve what access it has to the Container's children.
 * @returns Access Modes that have been explicitly granted to an Agent for the children of the Container associated with the given ACL.
 */
function getAgentDefaultAccess(aclDataset, agent) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getDefaultAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRulesForAgent(resourceRules, agent);
    const agentAccessModes = agentResourceRules.map(internal_getAccess);
    return internal_combineAccessModes(agentAccessModes);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes, per Agent, that have been explicitly granted for the children
 * of the Container associated with the given ACL (Access Control List).
 *
 * The function does not return:
 *
 * - Access Modes granted indirectly to the Agents through other ACL rules, e.g. public or group-specific permissions.
 * - Access Modes granted to the Agents for the Container Resource itself (see [[getAgentResourceAccessAll]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @returns Access Modes, per Agent, that have been explicitly granted for the children of the Container associated with the given ACL.
 */
function getAgentDefaultAccessAll(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getDefaultAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const agentResourceRules = getAgentAclRules(resourceRules);
    return getAccessByAgent(agentResourceRules);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the default ACL (Access Control List) to set an Agent's Access Modes for the Container's children.
 * Specifically, the function returns a new default ACL initialised with the given ACL and
 * new rules for the Agent's access.
 *
 * If rules already exist for the Agent in the given ACL, in the returned ACL, they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted indirectly to the Agent through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to the Agent for the Container Resource itself.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param agent The Agent to grant specific Access Modes.
 * @param access The Access Modes to grant to the Agent.
 * @returns A new default ACL initialised with the given `aclDataset` and `access` for the `agent`.
 */
function setAgentDefaultAccess(aclDataset, agent, access) {
    return internal_setActorAccess(aclDataset, access, acl.agent, "default", agent);
}
function getAgentAclRulesForAgent(aclRules, agent) {
    return internal_getAclRulesForIri(aclRules, agent, acl.agent);
}
function getAgentAclRules(aclRules) {
    return aclRules.filter(isAgentAclRule);
}
function isAgentAclRule(aclRule) {
    return getIri(aclRule, acl.agent) !== null;
}
function getAccessByAgent(aclRules) {
    return internal_getAccessByIri(aclRules, acl.agent);
}

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
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Returns a Group's explicity-granted Access Modes for a given Resource.
 *
 * The function does not return Access Modes granted indirectly to the Group through other
 * ACL rules, e.g., public permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Group may have been granted access.
 * @param group URL of the Group for which to retrieve what access it has to the Resource.
 * @returns Access Modes that have been explicitly granted to the `group` for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control Access to a given Resource or its Container).
 */
function getGroupAccess(resourceInfo, group) {
    if (hasResourceAcl(resourceInfo)) {
        return getGroupResourceAccess(resourceInfo.internal_acl.resourceAcl, group);
    }
    if (hasFallbackAcl(resourceInfo)) {
        return getGroupDefaultAccess(resourceInfo.internal_acl.fallbackAcl, group);
    }
    return null;
}
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns all explicitly-granted Access Modes per Group for the given Resource.
 *
 * The function does not return Access Modes granted indirectly to the Group through other
 * ACL rules, e.g., public permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Group may have been granted access.
 * @returns Access Modes per Group that have been explicitly granted for the given Resource, or `null` if it could not be determined (e.g. because the current user does not have Control Access to a given Resource or its Container).
 */
function getGroupAccessAll(resourceInfo) {
    if (hasResourceAcl(resourceInfo)) {
        const resourceAcl = getResourceAcl(resourceInfo);
        return getGroupResourceAccessAll(resourceAcl);
    }
    if (hasFallbackAcl(resourceInfo)) {
        const fallbackAcl = getFallbackAcl(resourceInfo);
        return getGroupDefaultAccessAll(fallbackAcl);
    }
    return null;
}
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes explicitly granted to a Group for the Resource
 * associated with an ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g., public permissions.
 * - Access Modes granted to the Group for the child Resources if the associated Resource is a Container
 *   (see [[getGroupDefaultAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @param group URL of the Group for which to retrieve what access it has to the Resource.
 * @returns Access Modes explicitly granted to a Group for the Resource associated with an ACL.
 */
function getGroupResourceAccess(aclDataset, group) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getResourceAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const groupResourceRules = getGroupAclRuleForGroup(resourceRules, group);
    const groupAccessModes = groupResourceRules.map(internal_getAccess);
    return internal_combineAccessModes(groupAccessModes);
}
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the explicitly granted Access Modes per Group for the Resource associated
 * with an ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g., public permissions.
 * - Access Modes granted to Groups for the child Resources if the associated Resource is a Container.
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @returns Access Modes per Group that have been explicitly granted for the Resource associated with an ACL.
 */
function getGroupResourceAccessAll(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getResourceAclRulesForResource(allRules, aclDataset.internal_accessTo);
    return getAccessByGroup(resourceRules);
}
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns a Group's Access Modes explicitly granted for the children of the
 * Container associated with an ACL (Access ControlList).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g. public permissions.
 * - Access Modes granted to the Group for the Container Resource itself (see [[getGroupResourceAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains ACL rules for a certain Container.
 * @param group URL of the Group for which to retrieve what access it has to the child Resources of the given Container.
 * @returns Access Modes that have been explicitly granted to the Group for the children of the Container associated with the given ACL.
 */
function getGroupDefaultAccess(aclDataset, group) {
    const allRules = internal_getAclRules(aclDataset);
    const defaultRules = internal_getDefaultAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const groupDefaultRules = getGroupAclRuleForGroup(defaultRules, group);
    const groupAccessModes = groupDefaultRules.map(internal_getAccess);
    return internal_combineAccessModes(groupAccessModes);
}
/**
 * ```{note} This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes, per Group, that have been explicitly granted for the children
 * of the Container associated with the given ACL (Access Control List).
 *
 * The function does not return:
 * - Access Modes granted indirectly to the Groups through other ACL rules, e.g. public permissions.
 * - Access Modes granted to the Groups for the Container Resource itself (see [[getGroupResourceAccessAll]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules for a certain Container.
 * @returns Access Modes per Group that have been explicitly granted for the children of the Container associated with the given ACL SolidDataset.
 */
function getGroupDefaultAccessAll(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const defaultRules = internal_getDefaultAclRulesForResource(allRules, aclDataset.internal_accessTo);
    return getAccessByGroup(defaultRules);
}
function getGroupAclRuleForGroup(rules, group) {
    return internal_getAclRulesForIri(rules, group, acl.agentGroup);
}
function getAccessByGroup(aclRules) {
    return internal_getAccessByIri(aclRules, acl.agentGroup);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the given Group.
 * Specifically, the function returns a new resource ACL initialised with the given ACL and
 * new rules for the Group's access.
 *
 * If rules for Groups's access already exist in the given ACL, in the returned ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 *
 * - Access Modes granted indirectly to Groups through other ACL rules, e.g., public or Agent-specific permissions.
 * - Access Modes granted to Groups for the child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param group The Group to grant specific Access Modes.
 * @param access The Access Modes to grant to the Group for the Resource.
 * @returns A new resource ACL initialised with the given `aclDataset` and `access` for the `group`.
 * @since 1.4.0
 */
function setGroupResourceAccess(aclDataset, group, access) {
    return internal_setActorAccess(aclDataset, access, acl.agentGroup, "resource", group);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the default ACL (Access Control List) to set a Group's Access Modes for the Container's children.
 * Specifically, the function returns a new default ACL initialised with the given ACL and
 * new rules for the Group's access.
 *
 * If rules already exist for the Group in the given ACL, in the returned ACL, they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted indirectly to the Group through other ACL rules, e.g., public or Agent-specific permissions.
 * - Access Modes granted to the Group for the Container Resource itself.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param group The Group to grant specific Access Modes.
 * @param access The Access Modes to grant to the Group.
 * @returns A new default ACL initialised with the given `aclDataset` and `access` for the `group`.
 * @since 1.4.0
 */
function setGroupDefaultAccess(aclDataset, group, access) {
    return internal_setActorAccess(aclDataset, access, acl.agentGroup, "default", group);
}

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
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes granted to the public in general for a Resource.
 *
 * This function does not return Access Modes granted to specific Agents
 * through other ACL (Access Control List) rules, e.g., agent- or group-specific permissions.
 *
 * @param resourceInfo Information about the Resource to which the given Agent may have been granted access.
 * @returns Access Modes granted to the public in general for the Resource, or `null` if it could not be determined (e.g. because the current user does not have Control Access to a given Resource or its Container).
 */
function getPublicAccess$3(resourceInfo) {
    if (hasResourceAcl(resourceInfo)) {
        return getPublicResourceAccess(resourceInfo.internal_acl.resourceAcl);
    }
    if (hasFallbackAcl(resourceInfo)) {
        return getPublicDefaultAccess(resourceInfo.internal_acl.fallbackAcl);
    }
    return null;
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes granted to the public in general for the Resource
 * associated with an ACL (Access Control List).
 *
 * This function does not return:
 * - Access Modes granted to specific Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to child Resources if the associated Resource is a Container (see [[getPublicDefaultAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @returns Access Modes granted to the public in general for the Resource associated with the `aclDataset`.
 */
function getPublicResourceAccess(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getResourceAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const publicResourceRules = getClassAclRulesForClass(resourceRules, foaf.Agent);
    const publicAccessModes = publicResourceRules.map(internal_getAccess);
    return internal_combineAccessModes(publicAccessModes);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Returns the Access Modes granted to the public in general for the child Resources
 * of the Container associated with an ACL (Access Control List).
 *
 * This function does not return:
 * - Access Modes granted to Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to the Container Resource itself (see [[getPublicResourceAccess]] instead).
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules for a certain Container.
 * @returns Access Modes granted to the public in general for the children of the Container associated with the given `aclDataset`.
 */
function getPublicDefaultAccess(aclDataset) {
    const allRules = internal_getAclRules(aclDataset);
    const resourceRules = internal_getDefaultAclRulesForResource(allRules, aclDataset.internal_accessTo);
    const publicResourceRules = getClassAclRulesForClass(resourceRules, foaf.Agent);
    const publicAccessModes = publicResourceRules.map(internal_getAccess);
    return internal_combineAccessModes(publicAccessModes);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the public.
 * Specifically, the function returns a new resource ACL (Access Control List) initialised
 * with the given resource ACL and new rules for the given public access.
 *
 * If rules for public access already exist in the given ACL, in the *returned* ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted to Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @param access The Access Modes to grant to the public.
 * @returns A new resource ACL initialised with the given `aclDataset` and public `access`.
 */
function setPublicResourceAccess$1(aclDataset, access) {
    return internal_setActorAccess(aclDataset, access, acl.agentClass, "resource", foaf.Agent);
}
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Modifies the default ACL (Access Control List) to set the public's default Access Modes
 * to child resources. Specifically, the function returns a new default ACL initialised
 * with the given default ACL and new rules for the given public access.
 *
 * If rules for public access already exist in the given ACL, in the *returned* ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 * - Access Modes granted to Agents through other ACL rules, e.g., agent- or group-specific permissions.
 * - Access Modes to Container Resource itself.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access Control List rules.
 * @param access The Access Modes to grant to the public.
 * @returns A new default ACL initialised with the given `aclDataset` and public `access`.
 */
function setPublicDefaultAccess(aclDataset, access) {
    return internal_setActorAccess(aclDataset, access, acl.agentClass, "default", foaf.Agent);
}
function getClassAclRulesForClass(aclRules, agentClass) {
    return aclRules.filter((rule) => appliesToClass(rule, agentClass));
}
function appliesToClass(aclRule, agentClass) {
    return getIriAll(aclRule, acl.agentClass).includes(agentClass);
}

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
function setMockAclUrl(resource, aclUrl) {
    const resourceWithAclUrl = Object.assign(internal_cloneResource(resource), {
        internal_resourceInfo: {
            ...resource.internal_resourceInfo,
            aclUrl,
        },
    });
    return resourceWithAclUrl;
}

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
 * ```{warning}
 * Do not use this function in production code. For use in **unit tests** that
 * require a [[SolidDataset]] with a resource ACL (Access Control List).
 * ```
 *
 * Initialises a new empty ACL and attaches it to a given [[SolidDataset]] for use
 * in **unit tests**; e.g., unit tests that call [[getResourceAcl]].
 *
 * @param resource The Resource to mock up with a new resource ACL.
 * @returns The input Resource with an empty resource ACL attached.
 * @since 0.2.0
 */
function addMockResourceAclTo(resource) {
    var _a;
    const aclUrl = (_a = resource.internal_resourceInfo.aclUrl) !== null && _a !== void 0 ? _a : "https://your.pod/mock-acl.ttl";
    const resourceWithAclUrl = Object.assign(internal_cloneResource(resource), {
        internal_resourceInfo: {
            ...resource.internal_resourceInfo,
            aclUrl,
        },
    });
    const aclDataset = createAcl(resourceWithAclUrl);
    const resourceWithResourceAcl = internal_setAcl(resourceWithAclUrl, {
        resourceAcl: aclDataset,
        fallbackAcl: null,
    });
    return resourceWithResourceAcl;
}
/**
 *
 * ```{warning}
 * Do not use this function in production code.  For use in **unit tests** that require a
 * [[SolidDataset]] with a fallback ACL (Access Control List).
 * ```
 *
 * Initialises a new empty fallback ACL and attaches it to a given [[SolidDataset]] for use
 * in **unit tests**; e.g., unit tests that call [[getFallbackAcl]].
 *
 * @param resource The Resource to mock up with new fallback ACL.
 * @returns The input Resource with an empty fallback ACL attached.
 * @since 0.2.0
 */
function addMockFallbackAclTo(resource) {
    const containerUrl = internal_getContainerPath(getSourceIri(resource));
    const aclUrl = `${containerUrl}.acl`;
    const mockContainer = setMockAclUrl(mockContainerFrom(containerUrl), aclUrl);
    const aclDataset = createAcl(mockContainer);
    const resourceWithFallbackAcl = internal_setAcl(internal_cloneResource(resource), {
        resourceAcl: null,
        fallbackAcl: aclDataset,
    });
    return resourceWithFallbackAcl;
}

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
function getProfileFromProfileDoc(profileDataset, webId) {
    const profile = getThing(profileDataset, webId);
    if (profile === null) {
        throw new Error(`Profile document [${getSourceUrl(profileDataset)}] does not include WebID [${webId}]`);
    }
    return profile;
}
/**
 * Set a JWKS IRI associated with a WebID in a profile document.
 *
 * @param profileDocument The profile document dataset.
 * @param webId The WebID associated with the profile document.
 * @param jwksIri The JWKS IRI to be set.
 * @returns A modified copy of the profile document, with the JWKS IRI set.
 * @since 1.12.0
 */
function setProfileJwks(profileDocument, webId, jwksIri) {
    return setThing(profileDocument, setIri(getProfileFromProfileDoc(profileDocument, webId), security.publicKey, jwksIri));
}
/**
 * Look for a JWKS IRI optionally advertized from a profile document.
 *
 * @param profileDocument The profile document.
 * @param webId The WebID featured in the profile document.
 * @returns The JWKS IRI associated with the WebID, if any.
 * @since 1.12.0
 */
function getProfileJwksIri(profileDocument, webId) {
    return getUrl(getProfileFromProfileDoc(profileDocument, webId), security.publicKey);
}
const isJwks = (jwksDocument) => {
    return typeof jwksDocument.keys !== "undefined";
};
/**
 * Fetch a JWKS at a given IRI, and add the given JWK to the obtained key set.
 *
 * @param jwk The JWK to add to the set.
 * @param jwksIri The IRI where the key set should be looked up.
 * @param options @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Promise resolving to a JWKS where the given key has been added.
 * @since 1.12.0
 */
async function addJwkToJwks(jwk, jwksIri, options) {
    var _a;
    const jwksResponse = await ((_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch)(jwksIri);
    if (!jwksResponse.ok) {
        throw new Error(`Fetching [${jwksIri}] returned an error: ${jwksResponse.status} ${jwksResponse.statusText}`);
    }
    try {
        const jwksDocument = await jwksResponse.json();
        if (!isJwks(jwksDocument)) {
            throw new Error(`[${jwksIri}] does not dereference to a valid JWKS: ${JSON.stringify(jwksDocument)}`);
        }
        return {
            keys: [...jwksDocument.keys, jwk],
        };
    }
    catch (e) {
        throw new Error(`Parsing the document at [${jwksIri}] failed: ${e}`);
    }
}
/**
 * Adds a public key to the JWKS listed in the profile associated to the given WebID.
 * Retrieves the profile document for the specified WebID and looks up the associated
 * JWKS. Having added the given key to the JWKS, this function overwrites the
 * previous JWKS so that the new version is saved. This assumes the JWKS is hosted
 * at a read-write IRI, such as in a Solid Pod.
 *
 * @param publicKey The public key value to set.
 * @param webId The WebID whose profile document references the key set to which we wish to add the specified public key.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @since 1.12.0
 */
async function addPublicKeyToProfileJwks(publicKey, webId, options = {}) {
    const profileDataset = await getSolidDataset(webId, options);
    if (profileDataset === null) {
        throw new Error(`The profile document associated with WebID [${webId}] could not be retrieved.`);
    }
    const jwksIri = getProfileJwksIri(profileDataset, webId);
    if (jwksIri === null) {
        throw new Error(`No key set is declared for the property [${security.publicKey}] in the profile of [${webId}]`);
    }
    const updatedJwks = await addJwkToJwks(publicKey, jwksIri, options);
    return overwriteFile(jwksIri, new Blob([JSON.stringify(updatedJwks)]), {
        contentType: "application/json",
        fetch: options.fetch,
    });
}

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
 * List all the alternative profiles IRI found in a given WebID profile.
 *
 * Note that some of these profiles may be private, and you may not have access to
 * the resulting resource.
 *
 * @param webId The WebID of the user's whose alternative profiles you are discovering.
 * @param webIdProfile The WebID profile obtained dereferencing the provided WebID.
 * @returns A list of URLs of the user's alternative profiles.
 * @since 1.20.0
 */
function getAltProfileUrlAllFrom(webId, webIdProfile) {
    const webIdThing = getThing(webIdProfile, webId);
    const altProfileUrlAll = getThingAll(webIdProfile)
        .filter((thing) => getIriAll(thing, foaf.primaryTopic).length > 0)
        .map(asIri)
        .concat(webIdThing ? getIriAll(webIdThing, rdfs.seeAlso) : [])
        .concat(webIdThing ? getIriAll(webIdThing, foaf.isPrimaryTopicOf) : [])
        .filter((profileIri) => profileIri !== getSourceIri(webIdProfile));
    // Deduplicate the results.
    return Array.from(new Set(altProfileUrlAll));
}
async function getProfileAll(webId, options) {
    var _a, _b;
    const authFetch = (_a = options === null || options === void 0 ? void 0 : options.fetch) !== null && _a !== void 0 ? _a : fetch;
    const webIdProfile = (_b = options === null || options === void 0 ? void 0 : options.webIdProfile) !== null && _b !== void 0 ? _b : 
    // This should always use an unauthenticated fetch.
    (await getSolidDataset(webId));
    const altProfileAll = (await Promise.allSettled(getAltProfileUrlAllFrom(webId, webIdProfile).map((uniqueProfileIri) => getSolidDataset(uniqueProfileIri, { fetch: authFetch }))))
        // Ignore the alternative profiles lookup which failed.
        .filter((result) => result.status === "fulfilled")
        .map((successfulResult) => successfulResult.value);
    return {
        webIdProfile,
        altProfileAll,
    };
}
/**
 * Discover the Pods an agent advertises for in their profile resources. Both the
 * agent's WebID and alternative profiles are fetched. Note that this function will
 * only return URLs of Pods linked to using the `pim:storage`, i.e. a triple
 * looking like <myWebid, pim:storage, myPodUrl> should appear in the profile
 * resources.
 *
 * @param webId The WebID of the agent whose Pods should be discovered
 * @param options Optional parameter
 * - `options.fetch`: An alternative `fetch` function to make the HTTP request,
 *    compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns a Promise resolving to an array containing the URLs of all the Pods
 * linked from the agent's profile resource using the `pim:storage` predicate.
 * @since 1.18.0
 */
async function getPodUrlAll(webId, options) {
    const profiles = await getProfileAll(webId, options);
    return getPodUrlAllFrom(profiles, webId);
}
/**
 * Discover the Pods advertised for in the provided profile resources. Note that
 * this function will only return URLs of Pods linked to using the `pim:storage`
 * predicate, i.e. a triple looking like <myWebid, pim:storage, myPodUrl>
 * should appear in the profile resources.
 *
 * @param profiles The profile resources in which the Pods should be discovered
 * @param webId The WebID of the agent whose Pods should be discovered
 * @returns An array containing the URLs of all the Pods linked from the agent's
 * profile resource using the `pim:storage` predicate.
 * @since 1.18.0
 */
function getPodUrlAllFrom(profiles, webId) {
    const result = new Set();
    [profiles.webIdProfile, ...profiles.altProfileAll].forEach((profileResource) => {
        const webIdThing = getThing(profileResource, webId);
        if (webIdThing !== null) {
            getIriAll(webIdThing, pim.storage).forEach((podIri) => result.add(podIri));
        }
    });
    return Array.from(result);
}
/**
 * Get the WebID Profile document dataset.
 *
 * @example
 * ```
 * const webId = "https://example.org/people/me";
 * const profile = await getWebIdDataset(webId);
 * const podRoot = getPodUrlAllFrom({ webIdProfile: profile, altProfileAll: [] }, webId);
 * const profileThing = getThing(profile, webId);
 * const name = getStringNoLocale(profileThing, FOAF.name);
 * ```
 *
 * @param webId The WebID of the agent whose WebID Profile dataset is to be fetched.
 * @returns a SolidDataset for the WebID Profile document.
 * @since 1.24.0
 */
async function getWebIdDataset(webId) {
    return getSolidDataset(webId);
}

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
 * Retrieve the Server Resource Info of Resource expressing access control over
 * another resource it is linked to. It applies in both ACP and WAC contexts:
 * the Access Control Resource is discovered consistently using a Link header
 * with `rel=acl`.
 *
 * @param {WithServerResourceInfo} resource The Resource for which ACL we want
 * to retrieve the Server Resource Info.
 * @param {DefaultOptions} options
 * @returns The Server Resource Info if available, null otherwise.
 * @since 1.19.0
 */
async function getAclServerResourceInfo(resource, options) {
    if (typeof resource.internal_resourceInfo.aclUrl !== "string") {
        return null;
    }
    try {
        return await getResourceInfo(resource.internal_resourceInfo.aclUrl, options);
    }
    catch (_a) {
        // A WAC-governed resource may have a link to a non-existant ACL (by design).
        // The absence of an ACL at the target URL is a useful information that is
        // used by the universal API to pick between ACR and WAC.
        return null;
    }
}

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
/** @hidden */
const ACP_NAMESPACE = "http://www.w3.org/ns/solid/acp#";
/** @hidden */
const ACP = {
    AccessControl: ACP_NAMESPACE.concat("AccessControl"),
    AccessControlResource: ACP_NAMESPACE.concat("AccessControlResource"),
    AuthenticatedAgent: ACP_NAMESPACE.concat("AuthenticatedAgent"),
    CreatorAgent: ACP_NAMESPACE.concat("CreatorAgent"),
    Matcher: ACP_NAMESPACE.concat("Matcher"),
    Policy: ACP_NAMESPACE.concat("Policy"),
    PublicAgent: ACP_NAMESPACE.concat("PublicAgent"),
    access: ACP_NAMESPACE.concat("access"),
    accessControl: ACP_NAMESPACE.concat("accessControl"),
    agent: ACP_NAMESPACE.concat("agent"),
    allOf: ACP_NAMESPACE.concat("allOf"),
    allow: ACP_NAMESPACE.concat("allow"),
    anyOf: ACP_NAMESPACE.concat("anyOf"),
    apply: ACP_NAMESPACE.concat("apply"),
    client: ACP_NAMESPACE.concat("client"),
    deny: ACP_NAMESPACE.concat("deny"),
    memberAccessControl: ACP_NAMESPACE.concat("memberAccessControl"),
    noneOf: ACP_NAMESPACE.concat("noneOf"),
    vc: ACP_NAMESPACE.concat("vc"),
};
/** @hidden */
const ACL_NAMESPACE = "http://www.w3.org/ns/auth/acl#";
/** @hidden */
const ACL = {
    Append: ACL_NAMESPACE.concat("Append"),
    Control: ACL_NAMESPACE.concat("Control"),
    Read: ACL_NAMESPACE.concat("Read"),
    Write: ACL_NAMESPACE.concat("Write"),
};
/** @hidden */
const VC_ACCESS_GRANT = "http://www.w3.org/ns/solid/vc#SolidAccessGrant";

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
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a Resource, check whether it is governed by Access Policies.
 * (Specifically, a Resource that is governed by Access Policies will refer to exactly one Access
 * Control Resource, and expose that to users who are allowed to see or modify access to the given
 * Resource.)
 *
 * @param resource Resource which may or may not be governed by Access Policies.
 * @returns True if the Resource refers to an Access Control Resource and is hence governed by Access Policies, or false if it does not.
 * @since 1.6.0
 */
function hasLinkedAcr(resource) {
    return (hasServerResourceInfo(resource) &&
        Array.isArray(resource.internal_resourceInfo.linkedResources[acp.accessControl]) &&
        resource.internal_resourceInfo.linkedResources[acp.accessControl].length ===
            1);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to an Access Control Resource itself, rather than
 * to the Resource it governs.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to it.
 * @returns URLs of the Policies that govern access to the given Access Control Resource.
 * @since 1.6.0
 */
function getAcrPolicyUrlAll$1(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const acrThing = getThing(acr, acrUrl);
    if (acrThing === null) {
        return [];
    }
    return getIriAll(acrThing, acp.access);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to the Access Control Resources of the Resource's
 * children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to its children.
 * @returns URLs of the Policies that govern access to the Access Control Resources of the given Resource's children.
 * @since 1.6.0
 */
function getMemberAcrPolicyUrlAll$1(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const acrThing = getThing(acr, acrUrl);
    if (acrThing === null) {
        return [];
    }
    return getIriAll(acrThing, acp.accessMembers);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop the URL of a given [[Policy]] from applying to an Access Control Resource itself.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource to which the given URL of a Policy should no longer apply.
 * @param policyUrl The URL of the Policy that should no longer apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given ACR Policy removed from it.
 * @since 1.6.0
 */
function removeAcrPolicyUrl$1(resourceWithAcr, policyUrl) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const acrThing = getThing(acr, acrUrl);
    if (acrThing === null) {
        return resourceWithAcr;
    }
    const updatedAcrThing = removeIri(acrThing, acp.access, policyUrl);
    const updatedAcr = setThing(acr, updatedAcrThing);
    return internal_setAcr(resourceWithAcr, updatedAcr);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to an Access Control Resource itself.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource to which no more Policies should apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to it.
 * @since 1.6.0
 */
function removeAcrPolicyUrlAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const acrThing = getThing(acr, acrUrl);
    if (acrThing === null) {
        return resourceWithAcr;
    }
    const updatedAcrThing = removeAll(acrThing, acp.access);
    const updatedAcr = setThing(acr, updatedAcrThing);
    return internal_setAcr(resourceWithAcr, updatedAcr);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to the Access Control Resources of the Resource's
 * children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource that should no longer apply Policies to its children's ACRs.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to its children's ACRs.
 * @since 1.6.0
 */
function removeMemberAcrPolicyUrlAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const acrThing = getThing(acr, acrUrl);
    if (acrThing === null) {
        return resourceWithAcr;
    }
    const updatedAcrThing = removeAll(acrThing, acp.accessMembers);
    const updatedAcr = setThing(acr, updatedAcrThing);
    return internal_setAcr(resourceWithAcr, updatedAcr);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to a Resource.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to it.
 * @returns URLs of the Policies that govern access to the given Resource.
 * @since 1.6.0
 */
function getPolicyUrlAll$1(resourceWithAcr) {
    const controls = internal_getControlAll(resourceWithAcr);
    const policyUrlsByControl = controls.map((control) => internal_getPolicyUrlAll(control));
    const uniquePolicyUrls = new Set();
    policyUrlsByControl.forEach((policyUrls) => {
        policyUrls.forEach((url) => uniquePolicyUrls.add(url));
    });
    return Array.from(uniquePolicyUrls);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the URLs of the Access Policies that apply to a Resource's children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource of which to get the URLs of the Policies that govern access to its children.
 * @returns URLs of the Policies that govern access to the given Resource's children.
 * @since 1.6.0
 */
function getMemberPolicyUrlAll$1(resourceWithAcr) {
    const controls = internal_getControlAll(resourceWithAcr);
    const memberPolicyUrlsByControl = controls.map((control) => internal_getMemberPolicyUrlAll(control));
    const uniquePolicyUrls = new Set();
    memberPolicyUrlsByControl.forEach((policyUrls) => {
        policyUrls.forEach((url) => uniquePolicyUrls.add(url));
    });
    return Array.from(uniquePolicyUrls);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop the URL of a given [[Policy]] from applying to a Resource.
 *
 * @param resourceWithAcr The Resource, with its Access Control Resource, to which the given URL of a Policy should no longer apply.
 * @param policyUrl The URL of the Policy that should no longer apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but with the given Policy removed from it.
 * @since 1.6.0
 */
function removePolicyUrl$1(resourceWithAcr, policyUrl) {
    const controls = internal_getControlAll(resourceWithAcr);
    const updatedControls = controls.map((control) => internal_removePolicyUrl(control, policyUrl));
    const updatedResource = updatedControls.reduce(internal_setControl, resourceWithAcr);
    return updatedResource;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to a Resource.
 *
 * @param resourceWithAcr The Resource, with its Access Control Resource, to which no more Policies should apply.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to the Resource.
 * @since 1.6.0
 */
function removePolicyUrlAll(resourceWithAcr) {
    const controls = internal_getControlAll(resourceWithAcr);
    const updatedControls = controls.map((control) => internal_removePolicyUrlAll(control));
    const updatedResource = updatedControls.reduce(internal_setControl, resourceWithAcr);
    return updatedResource;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Stop all URL of Access Policies from applying to the Resource's children.
 *
 * @param resourceWithAcr The Resource with the Access Control Resource that should no longer apply Policies to its children.
 * @returns A Resource with a new Access Control Resource equal to the original ACR, but without any Policy applying to the Resource's children.
 * @since 1.6.0
 */
function removeMemberPolicyUrlAll(resourceWithAcr) {
    const controls = internal_getControlAll(resourceWithAcr);
    const updatedControls = controls.map((control) => internal_removeMemberPolicyUrlAll(control));
    const updatedResource = updatedControls.reduce(internal_setControl, resourceWithAcr);
    return updatedResource;
}

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
/** @hidden */
const DEFAULT_ACCESS_CONTROL = "defaultAccessControl";
/** @hidden */
const DEFAULT_ACR_ACCESS_CONTROL = "defaultAcrAccessControl";
/** @hidden */
const DEFAULT_MEMBER_ACCESS_CONTROL = "defaultMemberAccessControl";
/** @hidden */
const DEFAULT_MEMBER_ACR_ACCESS_CONTROL = "defaultMemberAcrAccessControl";
/** @hidden */
function getDefaultAccessControlUrl(resource, name) {
    const acr = internal_getAcr(resource);
    const acrUrl = getSourceUrl(acr);
    return acrUrl.concat("#").concat(name);
}

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
/** @hidden */
function getDefaultAccessControlThing(resource, name) {
    const acr = internal_getAcr(resource);
    const defaultAccessControlUrl = getDefaultAccessControlUrl(resource, name);
    const accessControlThing = getThing(acr, defaultAccessControlUrl);
    if (accessControlThing === null ||
        typeof accessControlThing === "undefined") {
        return createThing({ url: defaultAccessControlUrl });
    }
    return accessControlThing;
}

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
/** @hidden */
function getModes(policy, type) {
    const modes = getIriAll(policy, type);
    return {
        read: modes.includes(ACL.Read),
        append: modes.includes(ACL.Append),
        write: modes.includes(ACL.Write),
        controlRead: false,
        controlWrite: false,
    };
}

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
 * @hidden
 *
 * Internal function that attaches an ACR to a Resource. Prefer using this than
 * setting the internal values manually (easier to refactor when changing the internals).
 */
function setAcr(resource, acr) {
    return Object.assign(internal_cloneResource(resource), {
        internal_acp: {
            acr,
        },
    });
}

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
/** @hidden */
function setModes(policy, modes, type) {
    let newPolicy = removeAll(policy, type);
    if (modes.read || modes.controlRead) {
        newPolicy = addIri(newPolicy, type, ACL.Read);
    }
    if (modes.append) {
        newPolicy = addIri(newPolicy, type, ACL.Append);
    }
    if (modes.write || modes.controlWrite) {
        newPolicy = addIri(newPolicy, type, ACL.Write);
    }
    return newPolicy;
}

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
const DEFAULT_VC_POLICY_NAME = "defaultVcPolicy";
const DEFAULT_VC_MATCHER_NAME = "defaultVcMatcher";
function createVcPolicy(acr, policyIri, matcherIri, access) {
    var _a;
    let vcPolicy = getThing(acr, policyIri);
    if (vcPolicy === null) {
        // If the policy does not exist, create it and link the default Access Control to it.
        vcPolicy = buildThing({ url: policyIri })
            .addIri(rdf.type, ACP.Policy)
            .addIri(ACP.anyOf, matcherIri)
            .build();
    }
    const vcMatcher = (_a = getThing(acr, matcherIri)) !== null && _a !== void 0 ? _a : buildThing({ url: matcherIri })
        .addIri(rdf.type, ACP.Matcher)
        .addIri(ACP.vc, VC_ACCESS_GRANT)
        .build();
    const currentModes = getModes(vcPolicy, ACP.allow);
    // Only change the modes which are set in `access`, and preserve the others.
    vcPolicy = setModes(vcPolicy, { ...currentModes, ...access }, ACP.allow);
    return {
        matcher: vcMatcher,
        policy: vcPolicy,
    };
}
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Set the maximum access modes that are allowed for a VC holder for a given resource.
 * If the resource owner issued an Access Grant for the resource, the agent that
 * has been granted access will have at most the permissions set by this function.
 * The Access Grant may be more restrictive.
 *
 * Note that additional access may have been set if the ACR has been manipulated
 * not using this library, which is currently out of scope. In this case, the access
 * set by this function may not apply.
 *
 * @param resourceWithAcr The resource for which the access modes are being set for VC holders.
 * @param access The access modes to set. Setting a mode to `true` will enable it, to `false`
 * will disable it, and to `undefined` will leave it unchanged compared to what was previously
 * set.
 * @param options An option object to customize the function behavior:
 *  - inherit: if set to `true`, the access set to the target resource cascades
 *    to its contained resources.
 * @returns A copy of the resource and its attached ACR, updated to the new access modes.
 * @since 1.17.0
 */
function setVcAccess(resourceWithAcr, access, options = { inherit: false }) {
    var _a;
    let acr = internal_getAcr(resourceWithAcr);
    const defaultVcPolicyIri = `${getSourceIri(acr)}#${DEFAULT_VC_POLICY_NAME}`;
    const defaultVcMatcherIri = `${getSourceIri(acr)}#${DEFAULT_VC_MATCHER_NAME}`;
    const { policy, matcher } = createVcPolicy(acr, defaultVcPolicyIri, defaultVcMatcherIri, access);
    let accessControl = getDefaultAccessControlThing(resourceWithAcr, "defaultAccessControl");
    if (!getIriAll(accessControl, ACP.apply).includes(asIri(policy))) {
        // Case when the ACR Thing existed, but did not include a link to the default Access Control.
        accessControl = addIri(accessControl, ACP.apply, policy);
    }
    let memberAccessControl = getDefaultAccessControlThing(resourceWithAcr, "defaultMemberAccessControl");
    let acrThing = (_a = getAccessControlResourceThing(resourceWithAcr)) !== null && _a !== void 0 ? _a : createThing({ url: getSourceIri(acr) });
    if (!getIriAll(acrThing, ACP.accessControl).includes(asIri(accessControl))) {
        // Case when the ACR Thing existed, but did not include a link to the default Access Control.
        acrThing = addIri(acrThing, ACP.accessControl, accessControl);
    }
    // Write the changed access control, policy and matchers in the ACR
    acr = [acrThing, accessControl, policy, matcher].reduce(setThing, acr);
    if (options.inherit) {
        // Add triples to the member access control and link it to the ACR only
        // if the VC access is recursive if they don't exist already.
        if (!getIriAll(memberAccessControl, ACP.apply).includes(asIri(policy))) {
            memberAccessControl = addIri(memberAccessControl, ACP.apply, policy);
        }
        if (!getIriAll(acrThing, ACP.memberAccessControl).includes(asIri(memberAccessControl))) {
            acrThing = addIri(acrThing, ACP.memberAccessControl, memberAccessControl);
        }
        acr = [acrThing, memberAccessControl].reduce(setThing, acr);
    }
    return setAcr(resourceWithAcr, acr);
}

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
const DEFAULT_NO_ACCESS = {
    read: false,
    append: false,
    write: false,
    controlRead: false,
    controlWrite: false,
};
const linkExists = (subject, predicate, object) => getIriAll(subject, predicate).includes(asIri(object));
// TODO: It should be possible to write a `chainExists` function, taking in a chain
// of Thing, predicate, Thing, predicate... and checks whether such chain exists
// in a given dataset. It would make the following function much easier to read,
// instead of checking at each link that it isn't null and it is connected to the
// next link.
/**
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the maximum access modes that are allowed for a VC holder for a given resource.
 * If the resource owner issued an Access Grant for the resource, the agent that
 * has been granted access will have at most the permissions returned by this function.
 * The Access Grant may be more restrictive.
 *
 * Note that only the modes set using [[setVcAccess]] will be returned by this function.
 * Additional access may have been set if the ACR has been manipulated not using this
 * library, which is currently out of scope.
 *
 * @param resourceWithAcr The resource for which the VC access modes are looked up.
 * @returns The access modes available to a VC holder.
 * @since 1.17.0
 */
function getVcAccess(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const accessControl = getDefaultAccessControlThing(resourceWithAcr, "defaultAccessControl");
    const acrThing = getAccessControlResourceThing(resourceWithAcr);
    if (acrThing === null ||
        !linkExists(acrThing, ACP.accessControl, accessControl)) {
        return DEFAULT_NO_ACCESS;
    }
    const defaultVcPolicyIri = `${getSourceIri(acr)}#${DEFAULT_VC_POLICY_NAME}`;
    const vcPolicy = getThing(acr, defaultVcPolicyIri);
    if (vcPolicy === null || !linkExists(accessControl, ACP.apply, vcPolicy)) {
        return DEFAULT_NO_ACCESS;
    }
    const defaultVcMatcherIri = `${getSourceIri(acr)}#${DEFAULT_VC_MATCHER_NAME}`;
    const vcMatcher = getThing(acr, defaultVcMatcherIri);
    if (vcMatcher === null || !linkExists(vcPolicy, ACP.anyOf, vcMatcher)) {
        return DEFAULT_NO_ACCESS;
    }
    return getModes(vcPolicy, ACP.allow);
}

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
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a SolidDataset and its associated Access Control Resource (if available to the current user).
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A SolidDataset and the ACR that applies to it, if available to the authenticated user.
 * @since 1.6.0
 */
async function getSolidDatasetWithAcr(url, options) {
    const urlString = internal_toIriString(url);
    const solidDataset = await getSolidDataset(urlString, options);
    const acp = await fetchAcr(solidDataset, options);
    return { ...solidDataset, ...acp };
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a file and its associated Access Control Resource (if available to the current user).
 *
 * @param url URL of the file to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A file and the ACR that applies to it, if available to the authenticated user.
 * @since 1.6.0
 */
async function getFileWithAcr(url, options) {
    const urlString = internal_toIriString(url);
    const file = await getFile(urlString, options);
    const acp = await fetchAcr(file, options);
    return Object.assign(file, acp);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Retrieve information about a Resource and its associated Access Control Resource (if available to
 * the current user), without fetching the Resource itself.
 *
 * @param url URL of the Resource about which to fetch its information.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Metadata describing a Resource, and the ACR that applies to it, if available to the authenticated user.
 * @since 1.6.0
 */
async function getResourceInfoWithAcr(url, options) {
    const urlString = internal_toIriString(url);
    const resourceInfo = await getResourceInfo(urlString, options);
    const acp = await fetchAcr(resourceInfo, options);
    return { ...resourceInfo, ...acp };
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a SolidDataset, and:
 * - if the Resource is governed by an ACR: its associated Access Control Resource (if available to
 *                                          the current user), and all the Access Control Policies
 *                                          referred to therein, if available to the current user.
 * - if the Resource is governed by an ACL: its associated Resource ACL (if available to the current
 *                                          user), or its Fallback ACL if it does not exist.
 *
 * @param url URL of the SolidDataset to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A SolidDataset and either the ACL access data or the ACR access data, if available to the current user.
 * @since 1.6.0
 */
async function getSolidDatasetWithAccessDatasets(url, options) {
    const urlString = internal_toIriString(url);
    const solidDataset = await getSolidDataset(urlString, options);
    if (hasAccessibleAcl(solidDataset)) {
        const acl = await internal_fetchAcl(solidDataset, options);
        return internal_setAcl(solidDataset, acl);
    }
    const acr = await fetchAcr(solidDataset, options);
    return { ...solidDataset, ...acr };
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch a File, and:
 * - if the Resource is governed by an ACR: its associated Access Control Resource (if available to
 *                                          the current user), and all the Access Control Policies
 *                                          referred to therein, if available to the current user.
 * - if the Resource is governed by an ACL: its associated Resource ACL (if available to the current
 *                                          user), or its Fallback ACL if it does not exist.
 *
 * @param url URL of the File to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A File and either the ACL access data or the ACR access data, if available to the current user.
 * @since 1.6.0
 */
async function getFileWithAccessDatasets(url, options) {
    const urlString = internal_toIriString(url);
    const file = await getFile(urlString, options);
    if (hasAccessibleAcl(file)) {
        const acl = await internal_fetchAcl(file, options);
        return internal_setAcl(file, acl);
    }
    const acr = await fetchAcr(file, options);
    return Object.assign(file, acr);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Fetch information about a Resource, and:
 * - if the Resource is governed by an ACR: its associated Access Control Resource (if available to
 *                                          the current user), and all the Access Control Policies
 *                                          referred to therein, if available to the current user.
 * - if the Resource is governed by an ACL: its associated Resource ACL (if available to the current
 *                                          user), or its Fallback ACL if it does not exist.
 *
 * @param url URL of the Resource information about which to fetch.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Information about a Resource and either the ACL access data or the ACR access data, if available to the current user.
 * @since 1.6.0
 */
async function getResourceInfoWithAccessDatasets(url, options) {
    const urlString = internal_toIriString(url);
    const resourceInfo = await getResourceInfo(urlString, options);
    if (hasAccessibleAcl(resourceInfo)) {
        const acl = await internal_fetchAcl(resourceInfo, options);
        return internal_setAcl(resourceInfo, acl);
    }
    const acr = await fetchAcr(resourceInfo, options);
    return { ...resourceInfo, ...acr };
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Save a Resource's Access Control Resource.
 *
 * @param resource Resource with an Access Control Resource that should be saved.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @since 1.6.0
 */
async function saveAcrFor(resource, options) {
    const acr = internal_getAcr(resource);
    const savedAcr = await saveSolidDatasetAt(getSourceUrl(acr), acr, options);
    return internal_setAcr(resource, savedAcr);
}
/**
 * @param resource Resource of which to check whether it has an Access Control Resource attached.
 * @returns Boolean representing whether the given Resource has an Access Control Resource attached for use in e.g. [[getPolicyUrlAll]].
 * @since 1.6.0
 */
function hasAccessibleAcr(resource) {
    return (typeof resource.internal_acp === "object" &&
        resource.internal_acp !== null &&
        typeof resource.internal_acp.acr === "object" &&
        resource.internal_acp.acr !== null);
}
async function fetchAcr(resource, options) {
    let acrUrl;
    if (hasLinkedAcr(resource)) {
        // Whereas a Resource can generally have multiple linked Resources for the same relation,
        // it can only have one Access Control Resource for that ACR to be valid.
        // Hence the accessing of [0] directly:
        const { linkedResources } = resource.internal_resourceInfo;
        [acrUrl] = linkedResources[acp.accessControl];
    }
    else if (hasAccessibleAcl(resource)) {
        // The ACP proposal will be updated to expose the Access Control Resource
        // via a Link header with rel="acl", just like WAC. That means that if
        // an ACL is advertised, we can still fetch its metadata — if that indicates
        // that it's actually an ACP Access Control Resource, then we can fetch that
        // instead.
        let aclResourceInfo;
        try {
            aclResourceInfo = await getResourceInfo(resource.internal_resourceInfo.aclUrl, options);
        }
        catch (e) {
            // Since both ACL and ACR will be discovered through the same header, we
            // need to ignore errors here so that in the case of ACL not found, the
            // code can resume and a new ACL can be initialized. The case for ACR is
            // covered in the code below, since in this case the ACR is always present
        }
        if (aclResourceInfo && isAcr(aclResourceInfo)) {
            acrUrl = getSourceUrl(aclResourceInfo);
        }
    }
    // If the Resource doesn't advertise an ACR via the old Link header,
    // nor via a rel="acl" header, then return, indicating that no ACR could be
    // fetched:
    if (typeof acrUrl !== "string") {
        return {
            internal_acp: {
                acr: null,
            },
        };
    }
    let acr;
    try {
        acr = await getSolidDataset(acrUrl, options);
    }
    catch (e) {
        return {
            internal_acp: {
                acr: null,
            },
        };
    }
    const acrDataset = {
        ...acr,
        accessTo: getSourceUrl(resource),
    };
    const acpInfo = {
        internal_acp: {
            acr: acrDataset,
        },
    };
    return acpInfo;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * To make it easy to fetch all the relevant Access Policy Resources,
 * this function returns all referenced Access Policy Resources referenced in an
 * Access Control Resource.
 * In other words, if Access Controls refer to different Policies in the same
 * Access Policy Resource, this function will only return that Access Policy
 * Resource's URL once.
 *
 * @param withAcr A Resource with an Access Control Resource attached.
 * @returns List of all unique Access Policy Resources that are referenced in the given Access Control Resource.
 * @since 1.6.0
 */
function getReferencedPolicyUrlAll(withAcr) {
    const policyUrls = getPolicyUrlAll$1(withAcr)
        .map(normalizeServerSideIri)
        .concat(getMemberPolicyUrlAll$1(withAcr).map(normalizeServerSideIri))
        .concat(getAcrPolicyUrlAll$1(withAcr).map(normalizeServerSideIri))
        .concat(getMemberAcrPolicyUrlAll$1(withAcr).map(normalizeServerSideIri));
    const uniqueUrls = Array.from(new Set(policyUrls));
    return uniqueUrls;
}
/**
 * Verify whether the access to the given resource is controlled using the ACP
 * system.
 * @param resource The target resource
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns True if the access to the resource is controlled using ACP, false otherwise.
 * @since 1.14.0.
 */
async function isAcpControlled(resource, options) {
    const urlString = internal_toIriString(resource);
    const resourceInfo = await getResourceInfo(urlString, options);
    return hasAccessibleAcr(await fetchAcr(resourceInfo, options));
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a Resource, find out the URL of its governing Access Control Resource.
 *
 * @param resource Resource which should be governed by Access Policies.
 * @returns The URL of the Access Control Resource, or undefined if not ACR is found.
 * @since 1.15.0
 */
function getLinkedAcrUrl(resource) {
    if (!hasServerResourceInfo(resource)) {
        return undefined;
    }
    // Two rels types are acceptable to indicate a link to an ACR.
    const acrLinks = [acp.accessControl, "acl"].map((rel) => {
        if (Array.isArray(resource.internal_resourceInfo.linkedResources[rel]) &&
            resource.internal_resourceInfo.linkedResources[rel].length === 1) {
            return resource.internal_resourceInfo.linkedResources[rel][0];
        }
        return undefined;
    });
    return acrLinks.find((x) => x !== undefined);
}

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
/** @hidden */
function internal_getAcr(resource) {
    if (!hasAccessibleAcr(resource)) {
        throw new Error(`An Access Control Resource for [${getSourceUrl(resource)}] is not available. This could be because the current user is not allowed to see it, or because their Pod Server does not support Access Control Resources.`);
    }
    return resource.internal_acp.acr;
}
/** @hidden */
function internal_setAcr(resource, acr) {
    return Object.assign(internal_cloneResource(resource), {
        internal_acp: {
            ...resource.internal_acp,
            acr,
        },
    });
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[Control]]s in the Access Control Resource of a given Resource.
 * @hidden Developers don't need to care about initialising Controls - they can just add Policies directly.
 * @deprecated
 */
function internal_getControlAll(withAccessControlResource, options) {
    const acr = internal_getAcr(withAccessControlResource);
    const foundThings = getThingAll(acr, options);
    const explicitAccessControl = foundThings.filter((foundThing) => getIriAll(foundThing, rdf.type).includes(acp.AccessControl));
    const implicitAccessControl = foundThings
        .filter((foundThing) => getIriAll(foundThing, acp.accessControl).length > 0)
        .map((thingWithAccessControl) => {
        // The initial filter ensures that at least one AccessControl will be found.
        const controlIri = getIriAll(thingWithAccessControl, acp.accessControl)[0];
        // The found control is only an object in the current dataset, so we create the
        // associated thing in order to possibly make it a subject.
        return createThing({ url: controlIri });
    });
    return explicitAccessControl.concat(implicitAccessControl);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert an [[Control]] into the [[AccessControlResource]] of a Resource, replacing previous
 * instances of that Access Control.
 *
 * @param withAccessControlResource A Resource with the Access Control Resource into which to insert an Access Control.
 * @param control The Control to insert into the Access Control Resource.
 * @returns The given Resource with a new Access Control Resource equal to the original Access Control Resource, but with the given Access Control.
 * @hidden Developers don't need to care about initialising Controls - they can just add Policies directly.
 * @deprecated
 */
function internal_setControl(withAccessControlResource, control) {
    const acr = internal_getAcr(withAccessControlResource);
    const updatedAcr = setThing(acr, control);
    const updatedResource = internal_setAcr(withAccessControlResource, updatedAcr);
    return updatedResource;
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all Policies that apply to the Resource to which the given [[Control]] is linked, and
 * which can be removed by anyone with Write access to the Access Control Resource that contains the
 * [[Control]].
 *
 * @param accessControl The [[Control]] of which to get the Policies.
 * @returns The Policies that are listed in this [[Control]] as applying to the Resource it is linked to, and as removable by anyone with Write access to the Access Control Resource.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
function internal_getPolicyUrlAll(accessControl) {
    return getIriAll(accessControl, acp.apply);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove a given Policy that applies to the Resource to which the given [[Control]] is linked,
 * and which can be removed by anyone with Write access to the Access Control Resource that contains
 * the Access Control.
 *
 * @param accessControl The [[Control]] of which to remove the Policies.
 * @param policyUrl URL of the Policy that should no longer apply to the Resource to which the [[Control]] is linked.
 * @returns A new [[Control]] equal to the given [[Control]], but with the given Policy removed from it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
function internal_removePolicyUrl(accessControl, policyUrl) {
    return removeIri(accessControl, acp.apply, policyUrl);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove all Policies that apply to the Resource to which the given [[Control]] is linked, and
 * which can be removed by anyone with Write access to the Access Control Resource that contains the
 * [[Control]].
 *
 * @param accessControl The [[Control]] of which to remove the Policies.
 * @returns A new [[Control]] equal to the given [[Control]], but with all Policies removed from it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
function internal_removePolicyUrlAll(accessControl) {
    return removeAll(accessControl, acp.apply);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all Policies that apply to the children of the Resource to which the given [[Control]] is
 * linked, and which can be removed by anyone with Write access to the Access Control Resource that
 * contains the [[Control]].
 *
 * @param accessControl The [[Control]] of which to get the Policies.
 * @returns The Policies that are listed in this [[Control]] as applying to the children of the Resource it is linked to, and as removable by anyone with Write access to the Access Control Resource.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
function internal_getMemberPolicyUrlAll(accessControl) {
    return getIriAll(accessControl, acp.applyMembers);
}
/**
 * ```{note} The Web Access Control specification is not yet finalised. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove all Policies that apply to the children of the Resource to which the given Access Control
 * is linked, and which can be removed by anyone with Write access to the Access Control Resource
 * that contains the Access Control.
 *
 * @param accessControl The [[Control]] of which to remove the Member Policies.
 * @returns A new [[Control]] equal to the given [[Control]], but with all Member Policies removed from it.
 * @hidden Developers don't need to care about working with Controls - they can just add Policies to the Resource directly.
 * @deprecated
 */
function internal_removeMemberPolicyUrlAll(accessControl) {
    return removeAll(accessControl, acp.applyMembers);
}

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
/** @hidden */
function getAccessControlResourceThing(resource) {
    const acr = internal_getAcr(resource);
    const acrUrl = getSourceUrl(acr);
    return getThing(acr, acrUrl);
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URL of all access controls linked to the given resource's ACR.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs of access
 * controls applying to it.
 * @returns Access Control URL array
 * @since 1.6.0
 */
function getAccessControlUrlAll(resourceWithAcr) {
    const acrThing = getAccessControlResourceThing(resourceWithAcr);
    if (acrThing === null) {
        return [];
    }
    return getIriAll(acrThing, ACP.accessControl);
}

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
/** @hidden */
function getPolicyUrls(resource, accessControlUrls, type) {
    const acr = internal_getAcr(resource);
    return Array.from(new Set(accessControlUrls
        .map((accessControlUrl) => {
        const accessControlThing = getThing(acr, accessControlUrl);
        // istanbul ignore next
        if (accessControlThing !== null) {
            return getIriAll(accessControlThing, type);
        }
        // istanbul ignore next
        return [];
    })
        .reduce((previousValue, currentValue) => previousValue.concat(currentValue), [])));
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URLs of policies applying to the given resource.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs of policies
 * applying to it.
 * @returns Policy URL array.
 * @since 1.16.1
 */
function getPolicyUrlAll(resourceWithAcr) {
    return getPolicyUrls(resourceWithAcr, getAccessControlUrlAll(resourceWithAcr), ACP.apply);
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URLs of policies applying to the ACR of the given resource.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs of policies
 * applying to its access control resource.
 * @returns Policy URL array.
 * @since 1.16.1
 */
function getAcrPolicyUrlAll(resourceWithAcr) {
    return getPolicyUrls(resourceWithAcr, getAccessControlUrlAll(resourceWithAcr), ACP.access);
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Policies allow or deny access modes over resources and their associated
 * access control resource.
 *
 * @param policy The Policy Thing which allows retrieved access modes.
 * @returns Policy URL array.
 * @since 1.16.1
 */
function getAllowModes(policy) {
    return getModes(policy, ACP.allow);
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Policies allow or deny access modes over resources and their associated
 * access control resource.
 *
 * @param policy The Policy Thing which denies retrieved access modes.
 * @returns Policy URL array.
 * @since 1.16.1
 */
function getDenyModes(policy) {
    return getModes(policy, ACP.deny);
}

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
/** @hidden */
function isAgentMatched(acr, policy, webId) {
    // TODO: Proper solution
    // Finalise, release and use the TypeScript ACP Solid library
    // internal_getActorAccess in acp_v2:96 doesn't reduce the policies properly
    // policyAppliesTo in acp_v2:256 assumes that every matcher is an agent matcher
    //
    // TODO: Stopgap solution
    // Implement a simplistic reduce function that
    // matches policies where the agent is present in the matchers
    const allOfMatchers = getUrlAll(policy, ACP.allOf)
        .map((url) => getThing(internal_getAcr(acr), url))
        .filter((thing) => thing !== null);
    const allOfMatched = allOfMatchers.every((thing) => {
        return getUrlAll(thing, ACP.agent).includes(webId);
    });
    const anyOfMatchers = getUrlAll(policy, ACP.anyOf)
        .map((url) => getThing(internal_getAcr(acr), url))
        .filter((thing) => thing !== null);
    const anyOfMatched = anyOfMatchers.some((thing) => {
        return getUrlAll(thing, ACP.agent).includes(webId);
    });
    const noneOfMatchers = getUrlAll(policy, ACP.noneOf)
        .map((url) => getThing(internal_getAcr(acr), url))
        .filter((thing) => thing !== null);
    const noneOfMatched = noneOfMatchers.some((thing) => {
        return getUrlAll(thing, ACP.agent).includes(webId);
    });
    return (allOfMatchers.length + anyOfMatchers.length > 0 &&
        (allOfMatchers.length === 0 || allOfMatched) &&
        (anyOfMatchers.length === 0 || anyOfMatched) &&
        (noneOfMatchers.length === 0 || !noneOfMatched));
}
/** @hidden */
function reduceModes(policy, modes, type) {
    const allowed = getAllowModes(policy);
    const denied = getDenyModes(policy);
    if (type === "control") {
        return {
            read: modes.read,
            append: modes.append,
            write: modes.write,
            controlRead: (modes.controlRead || allowed.read) && !denied.read,
            controlWrite: (modes.controlWrite || allowed.write) && !denied.write,
        };
    }
    return {
        read: (modes.read || allowed.read) && !denied.read,
        append: (modes.append || allowed.append) && !denied.append,
        write: (modes.write || allowed.write) && !denied.write,
        controlRead: modes.controlRead,
        controlWrite: modes.controlWrite,
    };
}
/**
 * Get an overview of what access is defined for a given Agent.
 *
 * @param resourceWithAcr URL of the Resource you want to read the access for.
 * @param webId WebID of the Agent you want to get the access for.
 * @since 1.16.0
 */
async function getAgentAccess$2(resourceWithAcr, webId) {
    // TODO: add support for external resources
    let resourceAccess = {
        read: false,
        append: false,
        write: false,
        controlRead: false,
        controlWrite: false,
    };
    const policyAll = getPolicyUrlAll(resourceWithAcr)
        .map((url) => getThing(internal_getAcr(resourceWithAcr), url))
        .filter((policy) => policy !== null);
    policyAll.forEach((policy) => {
        if (isAgentMatched(resourceWithAcr, policy, webId)) {
            resourceAccess = reduceModes(policy, resourceAccess, "resource");
        }
    });
    const acrPolicyAll = getAcrPolicyUrlAll(resourceWithAcr)
        .map((url) => getThing(internal_getAcr(resourceWithAcr), url))
        .filter((policy) => policy !== null);
    acrPolicyAll.forEach((policy) => {
        if (isAgentMatched(resourceWithAcr, policy, webId)) {
            resourceAccess = reduceModes(policy, resourceAccess, "control");
        }
    });
    return resourceAccess;
}

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
function universalAccessToAcl(newAccess, previousAccess) {
    var _a, _b, _c, _d;
    // Universal access is aligned on ACP, which means there is a distinction between
    // controlRead and controlWrite. This split doesn't exist in WAC, which is why
    // the type for the input variable of this function is a restriction on the
    // universal Access type.
    if (newAccess.controlRead !== newAccess.controlWrite) {
        throw new Error("For Pods using Web Access Control, controlRead and controlWrite must be equal.");
    }
    return {
        read: (_a = newAccess.read) !== null && _a !== void 0 ? _a : previousAccess.read,
        append: (_b = newAccess.append) !== null && _b !== void 0 ? _b : previousAccess.append,
        write: (_c = newAccess.write) !== null && _c !== void 0 ? _c : previousAccess.write,
        control: (_d = newAccess.controlRead) !== null && _d !== void 0 ? _d : previousAccess.control,
    };
}
function aclAccessToUniversal(access) {
    // In ACL, denying access to an actor is a notion that doesn't exist, so an
    // access is either granted or not for a given mode.
    // This creates a misalignment with the ACP notion of an access being granted,
    // denied, or simply not mentioned. Here, we convert the boolean vision of
    // ACL into the boolean or undefined vision of ACP.
    return {
        read: access.read,
        write: access.write,
        append: access.append,
        controlRead: access.control,
        controlWrite: access.control,
    };
}
async function getActorAccess(resource, actor, accessEvaluationCallback, options) {
    const resourceAcl = await internal_fetchAcl(resource, options);
    const wacAccess = accessEvaluationCallback(internal_setAcl(resource, resourceAcl), actor);
    if (wacAccess === null) {
        return null;
    }
    return aclAccessToUniversal(wacAccess);
}
async function getActorClassAccess(resource, accessEvaluationCallback, options) {
    const resourceAcl = await internal_fetchAcl(resource, options);
    const wacAccess = accessEvaluationCallback(internal_setAcl(resource, resourceAcl));
    if (wacAccess === null) {
        return null;
    }
    return aclAccessToUniversal(wacAccess);
}
async function getActorAccessAll(resource, accessEvaluationCallback, options) {
    const resourceAcl = await internal_fetchAcl(resource, options);
    const wacAgentAccess = accessEvaluationCallback(internal_setAcl(resource, resourceAcl));
    if (wacAgentAccess === null) {
        return null;
    }
    const result = {};
    for (const [webId, wacAccess] of Object.entries(wacAgentAccess)) {
        result[webId] = aclAccessToUniversal(wacAccess);
    }
    return result;
}
/**
 * For a given Resource, look up its metadata, and read the Access permissions
 * granted to the given Agent.
 *
 * Note that this only lists permissions granted to the given Agent individually,
 * and will not exhaustively list modes the given Agent may have access to because
 * they apply to everyone, or because they apply to the Agent through a group for
 * instance.
 *
 * @param resource The URL of the Resource for which we want to list Access
 * @param agent The Agent for which the Access is granted
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns What Access modes are granted to the given Agent explicitly, or null if it could not be determined.
 */
function getAgentAccess$1(resource, agent, options) {
    return getActorAccess(resource, agent, getAgentAccess$3, options);
}
/**
 * For a given Resource, look up its metadata, and read the Access permissions
 * granted to everyone.
 *
 * Note that this only lists permissions explicitly granted to everyone as a whole,
 * and will not exhaustively list modes any individual Agent or Group may have
 * access to because they specifically apply to them only.
 *
 * @param resource The URL of the Resource for which we want to list public Access
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns What Access modes are granted to the everyone explicitly, or null if it could not be determined.
 */
function getPublicAccess$2(resource, options) {
    return getActorClassAccess(resource, getPublicAccess$3, options);
}
/**
 * For a given Resource, look up its metadata, and read the Access permissions
 * granted explicitly to each individual Agent.
 *
 * Note that this only lists permissions granted to each Agent individually,
 * and will not exhaustively list modes any Agent may have access to because
 * they apply to everyone, or because they apply to an Agent through a group for
 * instance.
 *
 * @param resource The URL of the Resource for which we want to list Agents Access
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A map of Agent WebIDs and the access granted to them, or null if it could not be determined.
 */
function getAgentAccessAll$2(resource, options) {
    return getActorAccessAll(resource, getAgentAccessAll$3, options);
}
async function prepareResourceAcl(resource, options) {
    if (!hasAccessibleAcl(resource)) {
        return null;
    }
    const acl = await internal_fetchAcl(resource, options);
    const resourceWithAcl = internal_setAcl(resource, acl);
    let resourceAcl;
    if (hasResourceAcl(resourceWithAcl)) {
        // This is the simple case, where the Resource ACL we need to update already
        // exists.
        resourceAcl = internal_getResourceAcl(resourceWithAcl);
    }
    else if (hasFallbackAcl(resourceWithAcl)) {
        // In this case, the Resource ACL needs to be created first, and then updated.
        resourceAcl = createAclFromFallbackAcl(resourceWithAcl);
    }
    else {
        return null;
    }
    return internal_setResourceAcl(resourceWithAcl, resourceAcl);
}
async function saveUpdatedAcl(resource, acl, options) {
    let savedAcl = null;
    try {
        savedAcl = await saveAclFor(resource, acl, options);
        return internal_setResourceAcl(resource, savedAcl);
    }
    catch (e) {
        return null;
    }
}
async function setActorClassAccess(resource, access, getAccess, setAccess, options) {
    const resourceWithOldAcl = await prepareResourceAcl(resource, options);
    if (resourceWithOldAcl === null) {
        return null;
    }
    const resourceAcl = getResourceAcl(resourceWithOldAcl);
    const currentAccess = getAccess(resourceWithOldAcl);
    const wacAccess = universalAccessToAcl(access, currentAccess);
    const updatedResourceAcl = setAccess(resourceAcl, wacAccess);
    return saveUpdatedAcl(resourceWithOldAcl, updatedResourceAcl, options);
}
async function setActorAccess(resource, actor, access, getAccess, setAccess, options) {
    const resourceWithOldAcl = await prepareResourceAcl(resource, options);
    if (resourceWithOldAcl === null) {
        return null;
    }
    const currentAccess = getAccess(resourceWithOldAcl, actor);
    const resourceAcl = getResourceAcl(resourceWithOldAcl);
    const wacAccess = universalAccessToAcl(access, currentAccess);
    const updatedResourceAcl = setAccess(resourceAcl, actor, wacAccess);
    return saveUpdatedAcl(resourceWithOldAcl, updatedResourceAcl, options);
}
/**
 * Set the Access modes for a given Agent to a given Resource.
 *
 * Important note: if the target resource did not have a Resource ACL, and its
 * Access was regulated by its Fallback ACL, said Fallback ACL is copied to create
 * a new Resource ACL. This has the side effect that the next time the Fallback
 * ACL is updated, the changes _will not impact_ the target resource.
 *
 * If the target Resource's Access mode cannot be determined, e.g. the user does
 * not have Read and Write access to the target Resource's ACL, or to its
 * fallback ACL if it does not have a Resource ACL, then `null` is returned.
 *
 * @param resource The Resource for which Access is being set
 * @param agent The Agent for whom Access is being set
 * @param access The Access being set
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns The Resource, with its ACL updated, or null if the new Access could not
 * be set.
 */
async function setAgentResourceAccess(resource, agent, access, options) {
    return setActorAccess(resource, agent, access, getAgentAccess$3, setAgentResourceAccess$1, options);
}
/**
 * Set the Access modes for everyone to a given Resource.
 *
 * Important note: if the target resource did not have a Resource ACL, and its
 * Access was regulated by its Fallback ACL, said Fallback ACL is copied to create
 * a new Resource ACL. This has the side effect that the next time the Fallback
 * ACL is updated, the changes _will not impact_ the target resource.
 *
 * If the target Resource's Access mode cannot be determined, e.g. the user does
 * not have Read and Write access to the target Resource's ACL, or to its
 * fallback ACL if it does not have a Resource ACL, then `null` is returned.
 *
 * @param resource The Resource for which Access is being set
 * @param access The Access being set
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns The Resource, with its ACL updated, or null if the new Access could not
 * be set.
 */
async function setPublicResourceAccess(resource, access, options) {
    return setActorClassAccess(resource, access, getPublicAccess$3, setPublicResourceAccess$1, options);
}

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
 * Retrieve the URL of an Access Control Resource as per the ACP Draft
 * specification.
 *
 * @param resource The Resource for which to retrieve the URL of the Access
 * Control Resource if it is accessible.
 * @returns The URL of the ACR or null.
 */
async function getAcrUrl(resource, options) {
    // The ACP Draft mandates a link rel="type" header identifies Access Control Resources
    const aclServerResourceInfo = await getAclServerResourceInfo(resource, options);
    if (aclServerResourceInfo === null) {
        return null;
    }
    const relTypeLinks = getLinkedResourceUrlAll(aclServerResourceInfo).type;
    if (Array.isArray(relTypeLinks) &&
        relTypeLinks.includes(ACP.AccessControlResource)) {
        return getSourceUrl(aclServerResourceInfo);
    }
    return null;
}

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
 * Retrieve the Access Control Resource of a Resource as per the ACP Draft
 * specification.
 *
 * @param resource The Resource for which to retrieve the URL of the Access
 * Control Resource if it is accessible.
 * @param options Default Options such as a fetch function.
 * @returns The URL of the ACR or null.
 */
async function getResourceAcr(resource, options) {
    const acrUrl = await getAcrUrl(resource, options);
    if (acrUrl === null) {
        return null;
    }
    let acr;
    try {
        acr = await getSolidDataset(acrUrl, options);
    }
    catch (e) {
        return null;
    }
    return {
        ...resource,
        internal_acp: {
            acr: {
                ...acr,
                accessTo: getSourceUrl(resource),
            },
        },
    };
}

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
 * Get an overview of what access is defined for a given Agent.
 *
 * This function works with Solid Pods that implement either the Web Access
 * Control spec or the Access Control Policies proposal, with some caveats:
 *
 * - If access to the given Resource has been set using anything other than the
 *   functions in this module, it is possible that it has been set in a way that
 *   prevents this function from reliably reading access.
 * - It will only return access specified explicitly for the given Agent within
 *   the ACL linked to the resource. If additional restrictions or external
 *   resources are used, those will not be reflected in the return value of this
 *   function.
 * - It will only return access specified explicitly for the given Resource.
 *   In other words, if the Resource is a Container, the returned Access may not
 *   apply to contained Resources.
 * - If the current user does not have permission to view access for the given
 *   Resource, this function will resolve to `null`.
 *
 * @param resourceUrl URL of the Resource you want to read the access for.
 * @param webId WebID of the Agent you want to get the access for.
 * @param options Default Options such as a fetch function.
 * @since 1.19.0
 */
async function getAgentAccess(resourceUrl, webId, options) {
    const resourceInfo = await getResourceInfo(resourceUrl, options);
    const acr = await getResourceAcr(resourceInfo, options);
    if (acr === null) {
        return getAgentAccess$1(resourceInfo, webId, options);
    }
    return getAgentAccess$2(acr, webId);
}

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
/** @hidden */
function getAgentUrlAll(acr) {
    return Array.from(new Set(getThingAll(internal_getAcr(acr))
        .map((thing) => {
        return getUrlAll(thing, ACP.agent);
    })
        .reduce((flatArray, agentArray) => {
        return flatArray.concat(agentArray);
    }, [])));
}

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
 * Get an overview of what access is defined for agents.
 *
 * This function works with Solid Pods that implement either the Web Access
 * Control spec or the Access Control Policies proposal, with some caveats:
 *
 * - If access to the given Resource has been set using anything other than the
 *   functions in this module, it is possible that it has been set in a way that
 *   prevents this function from reliably reading access.
 * - It will only return access specified explicitly for the given Agent within
 *   the ACL linked to the resource. If additional restrictions or external
 *   resources are used, those will not be reflected in the return value of this
 *   function.
 * - It will only return access specified explicitly for the given Resource.
 *   In other words, if the Resource is a Container, the returned Access may not
 *   apply to contained Resources.
 * - If the current user does not have permission to view access for the given
 *   Resource, this function will resolve to `null`.
 *
 * @param resourceUrl URL of the Resource you want to read the access for.
 * @param options Default Options such as a fetch function.
 * @since 1.21.0
 */
async function getAgentAccessAll$1(resourceWithAcr) {
    return (await Promise.all(getAgentUrlAll(resourceWithAcr).map(async (agent) => ({
        [agent]: await getAgentAccess$2(resourceWithAcr, agent),
    })))).reduce((agentAccessAll, currentAgentAccess) => ({
        ...agentAccessAll,
        ...currentAgentAccess,
    }), {});
}

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
 * Get an overview of what access is defined for agents.
 *
 * This function works with Solid Pods that implement either the Web Access
 * Control spec or the Access Control Policies proposal, with some caveats:
 *
 * - If access to the given Resource has been set using anything other than the
 *   functions in this module, it is possible that it has been set in a way that
 *   prevents this function from reliably reading access.
 * - It will only return access specified explicitly for the given Agent within
 *   the ACL linked to the resource. If additional restrictions or external
 *   resources are used, those will not be reflected in the return value of this
 *   function.
 * - It will only return access specified explicitly for the given Resource.
 *   In other words, if the Resource is a Container, the returned Access may not
 *   apply to contained Resources.
 * - If the current user does not have permission to view access for the given
 *   Resource, this function will resolve to `null`.
 *
 * @param resourceUrl URL of the Resource you want to read the access for.
 * @param options Default Options such as a fetch function.
 * @since 1.21.0
 */
async function getAgentAccessAll(resourceUrl, options) {
    const resourceInfo = await getResourceInfo(resourceUrl, options);
    const acr = await getResourceAcr(resourceInfo, options);
    if (acr === null) {
        return getAgentAccessAll$2(resourceInfo, options);
    }
    return getAgentAccessAll$1(acr);
}

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
 * Get an overview of what access is given to the public.
 *
 * @param resourceWithAcr URL of the Resource you want to read the access for.
 * @since 1.16.0
 */
async function getPublicAccess$1(resourceWithAcr) {
    return getAgentAccess$2(resourceWithAcr, ACP.PublicAgent);
}

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
 * Get an overview of what access is defined for the Public.
 *
 * This function works with Solid Pods that implement either the Web Access
 * Control spec or the Access Control Policies proposal, with some caveats:
 *
 * - If access to the given Resource has been set using anything other than the
 *   functions in this module, it is possible that it has been set in a way that
 *   prevents this function from reliably reading access.
 * - It will only return access specified explicitly for the given Agent within
 *   the ACL linked to the resource. If additional restrictions or external
 *   resources are used, those will not be reflected in the return value of this
 *   function.
 * - It will only return access specified explicitly for the given Resource.
 *   In other words, if the Resource is a Container, the returned Access may not
 *   apply to contained Resources.
 * - If the current user does not have permission to view access for the given
 *   Resource, this function will resolve to `null`.
 *
 * @param resourceUrl URL of the Resource you want to read the access for.
 * @param options Default Options such as a fetch function.
 * @since 1.19.0
 */
async function getPublicAccess(resourceUrl, options) {
    const resourceInfo = await getResourceInfo(resourceUrl, options);
    const acr = await getResourceAcr(resourceInfo, options);
    if (acr === null) {
        return getPublicAccess$2(resourceInfo, options);
    }
    return getPublicAccess$1(acr);
}

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
/** @hidden */
function setAccessControlResourceThing(resource, thing) {
    return Object.assign(internal_cloneResource(resource), {
        internal_acp: {
            ...resource.internal_acp,
            acr: setThing(resource.internal_acp.acr, thing),
        },
    });
}

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
/** @hidden */
function getDefaultAgentMatcherPolicyUrl(resource, name, mode) {
    return getDefaultAccessControlUrl(resource, name)
        .concat("AgentMatcher")
        .concat(mode.charAt(0).toUpperCase() + mode.slice(1))
        .concat("Policy");
}

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
function getAccessControlTypeFromDefaultAccessControlName(name) {
    if (name.includes("Member")) {
        return ACP.memberAccessControl;
    }
    return ACP.accessControl;
}
/** @hidden */
function setDefaultAccessControlThingIfNotExist(resource, name) {
    const defaultAccessControlThingUrl = getDefaultAccessControlUrl(resource, name);
    const acr = internal_getAcr(resource);
    // Get the Access Control Resource Thing or create it
    let accessControlResourceThing = getAccessControlResourceThing(resource);
    if (accessControlResourceThing === null ||
        typeof accessControlResourceThing === "undefined") {
        accessControlResourceThing = createThing({ url: getSourceUrl(acr) });
    }
    // Get the Default Access Control Thing or create it and return
    const accessControlUrlAll = getIriAll(accessControlResourceThing, getAccessControlTypeFromDefaultAccessControlName(name));
    if (!accessControlUrlAll.includes(defaultAccessControlThingUrl)) {
        accessControlResourceThing = buildThing(accessControlResourceThing)
            .addUrl(getAccessControlTypeFromDefaultAccessControlName(name), defaultAccessControlThingUrl)
            .build();
        return setAccessControlResourceThing(resource, accessControlResourceThing);
    }
    // Return the original resource if the ACR and Default AC exist
    return resource;
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Add a policy applying to the ACR of the given resource.
 *
 * @param resourceWithAcr The resource for which to add the URL of a policy
 * applying to its access control resource.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function addAcrPolicyUrl(resourceWithAcr, policyUrl) {
    const resourceWithAcrContainingDefaultAccessControl = setDefaultAccessControlThingIfNotExist(resourceWithAcr, DEFAULT_ACR_ACCESS_CONTROL);
    const defaultAccessControlThing = getDefaultAccessControlThing(resourceWithAcrContainingDefaultAccessControl, DEFAULT_ACR_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcrContainingDefaultAccessControl, buildThing(defaultAccessControlThing).addUrl(ACP.access, policyUrl).build());
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Add a policy applying to the given resource.
 *
 * @param resourceWithAcr The resource for which to add the URL of a policy
 * applying to it.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function addPolicyUrl(resourceWithAcr, policyUrl) {
    const resourceWithAcrContainingDefaultAccessControl = setDefaultAccessControlThingIfNotExist(resourceWithAcr, DEFAULT_ACCESS_CONTROL);
    const defaultAccessControlThing = getDefaultAccessControlThing(resourceWithAcrContainingDefaultAccessControl, DEFAULT_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcrContainingDefaultAccessControl, buildThing(defaultAccessControlThing).addUrl(ACP.apply, policyUrl).build());
}

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
/** @hidden */
function setDefaultAgentMatcherPolicyThingIfNotExist(resource, name, mode) {
    const policyUrl = getDefaultAgentMatcherPolicyUrl(resource, name, mode);
    // TODO: Re-enable when we support setting agent access on member resources
    // if (policyUrl.includes("Member") && policyUrl.includes("Acr")) {
    //   return addMemberAcrPolicyUrl(resource, policyUrl);
    // }
    // if (policyUrl.includes("Member")) {
    //   return addMemberPolicyUrl(resource, policyUrl);
    // }
    if (policyUrl.includes("Acr")) {
        return addAcrPolicyUrl(resource, policyUrl);
    }
    return addPolicyUrl(resource, policyUrl);
}

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
/** @hidden */
function getDefaultAgentMatcherPolicyMatcherUrl(resource, name, mode) {
    return getDefaultAgentMatcherPolicyUrl(resource, name, mode).concat("Matcher");
}

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
/** @hidden */
const DEFAULT_POLICY_MATCHER_PREDICATE = ACP.anyOf;
/**
 * This functions scaffolds the default elements required for giving access to
 * an agent:
 * 1. If the Access Control Resource is empty, create the AccessControlResource
 *    element;
 * 2. If the current default Access Control doesn't exist (the one applying to
 *    one of: the Resource, the ACR, the Member Resources or the ACR of members)
 *    create it;
 * 3. If the default Policy for allowing the Access Modes for the current
 *    default Access Control doesn't exist, create it;
 * 4. If the default "anyOf" Agent Matcher for the current Policy creates it;
 * 5. Returns an ACR with a Matcher ready to add to.
 * @hidden
 * */
function setDefaultAgentMatcherPolicyMatcherThingIfNotExist(resource, name, mode) {
    const policyUrl = getDefaultAgentMatcherPolicyUrl(resource, name, mode);
    const matcherUrl = getDefaultAgentMatcherPolicyMatcherUrl(resource, name, mode);
    let defaultAgentMatcherPolicyThing = getThing(internal_getAcr(resource), policyUrl);
    if (!defaultAgentMatcherPolicyThing) {
        resource = setDefaultAgentMatcherPolicyThingIfNotExist(resource, name, mode);
        defaultAgentMatcherPolicyThing = createThing({ url: policyUrl });
        defaultAgentMatcherPolicyThing = setModes(defaultAgentMatcherPolicyThing, { [mode]: true }, ACP.allow);
    }
    // Get the Default Access Control Agent Matcher Policy Matcher Thing or create it and return
    const agentMatcherPolicyUrlAll = getIriAll(defaultAgentMatcherPolicyThing, DEFAULT_POLICY_MATCHER_PREDICATE);
    if (!agentMatcherPolicyUrlAll.includes(matcherUrl)) {
        defaultAgentMatcherPolicyThing = buildThing(defaultAgentMatcherPolicyThing)
            .addUrl(DEFAULT_POLICY_MATCHER_PREDICATE, matcherUrl)
            .build();
        return setAccessControlResourceThing(resource, defaultAgentMatcherPolicyThing);
    }
    return resource;
}

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
 * @param thing the [[Thing]] to check to see if it's an ACP Matcher or not
 */
function isMatcher(thing) {
    return getIriAll(thing, rdf.type).includes(acp.Matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a Matcher that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" Matchers,
 * they will not be granted access.
 *
 * Also see [[addAnyOfMatcherUrl]] and [[addNoneOfMatcherUrl]].
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new Matcher added.
 * @since Not released yet.
 */
function addAllOfMatcherUrl(policy, matcher) {
    return addIri(policy, acp.allOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a Matcher that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" Matchers,
 * they will not be granted access.
 * @param policy The [[Policy]] from which the Matcher should be removed.
 * @param matcher The Matcher to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the Matcher removed.
 * @since Not released yet.
 */
function removeAllOfMatcherUrl(policy, matcher) {
    return removeIri(policy, acp.allOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrites the Matcher refining the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the "All Of" Matchers,
 * they will not be granted access.
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to set for the Policy.
 * @returns A new [[Policy]] clone of the original one, with the "All Of" Matchers replaced.
 * @since Not released yet.
 */
function setAllOfMatcherUrl(policy, matcher) {
    return setIri(policy, acp.allOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "All Of" [[Matcher]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the Matchers should be read.
 * @returns A list of the "All Of" [[Matcher]]s
 * @since Not released yet.
 */
function getAllOfMatcherUrlAll(policy) {
    return getIriAll(policy, acp.allOf);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a Matcher that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" Matchers,
 * they will be granted access.
 *
 * Also see [[addAllOfMatcherUrl]] and [[addNoneOfMatcherUrl]].
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new Matcher added.
 * @since Not released yet.
 */
function addAnyOfMatcherUrl(policy, matcher) {
    return addIri(policy, acp.anyOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a Matcher that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" Matchers,
 * they will be granted access.
 * @param policy The [[Policy]] from which the Matcher should be removed.
 * @param matcher The Matcher to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the Matcher removed.
 * @since Not released yet.
 */
function removeAnyOfMatcherUrl(policy, matcher) {
    return removeIri(policy, acp.anyOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the Matcher extending the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the "Any Of" Matchers,
 * they will be granted access.
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to set for the Policy.
 * @returns A new [[Policy]] clone of the original one, with the "Any Of" Matchers replaced.
 * @since Not released yet.
 */
function setAnyOfMatcherUrl(policy, matcher) {
    return setIri(policy, acp.anyOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "Any Of" [[Matcher]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the Matchers should be read.
 * @returns A list of the "Any Of" [[Matcher]]s
 * @since Not released yet.
 */
function getAnyOfMatcherUrlAll(policy) {
    return getIriAll(policy, acp.anyOf);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a Matcher that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is matched by another Matcher, but **also**
 * by the given Matcher, they will **not** be granted access.
 *
 * Also see [[addAllOfMatcherUrl]] and [[addAnyOfMatcherUrl]].
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new Matcher added.
 * @since Not released yet.
 */
function addNoneOfMatcherUrl(policy, matcher) {
    return addIri(policy, acp.noneOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a Matcher that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is matched by another Matcher, but **also**
 * in any of the "None Of" Matchers, they will **not** be granted access.
 *
 * @param policy The [[Policy]] from which the Matcher should be removed.
 * @param matcher The Matcher to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the Matcher removed.
 * @since Not released yet.
 */
function removeNoneOfMatcherUrl(policy, matcher) {
    return removeIri(policy, acp.noneOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set the Matchers restricting the scope of a given [[Policy]]. If an agent
 * requesting access to a resource is matched by another Matcher, but **also**
 * by any of the "None Of" Matchers, they will not be granted access.
 *
 * @param policy The [[Policy]] to which the Matcher should be added.
 * @param matcher The Matcher to set for the Policy.
 * @returns A new [[Policy]] clone of the original one, with the "None Of" Matchers replaced.
 * @since Not released yet.
 */
function setNoneOfMatcherUrl(policy, matcher) {
    return setIri(policy, acp.noneOf, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the "None Of" [[Matcher]]s for the given [[Policy]]
 * @param policy The [[policy]] from which the Matchers should be read.
 * @returns A list of the forbidden [[Matcher]]s
 * @since Not released yet.
 */
function getNoneOfMatcherUrlAll(policy) {
    return getIriAll(policy, acp.noneOf);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[Matcher]].
 *
 * @param url URL that identifies this [[Matcher]].
 * @since Not released yet.
 */
function createMatcher(url) {
    const stringUrl = internal_toIriString(url);
    let matcherThing = createThing({ url: stringUrl });
    matcherThing = setUrl(matcherThing, rdf.type, acp.Matcher);
    return matcherThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[ResourceMatcher]] for the given Resource.
 *
 * @param resourceWithAcr The Resource to which the new Matcher is to apply.
 * @param name Name that identifies this [[Matcher]].
 * @since Not released yet.
 */
function createResourceMatcherFor(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const url = new URL(getSourceUrl(acr));
    url.hash = `#${name}`;
    let matcherThing = createThing({ url: url.href });
    matcherThing = setUrl(matcherThing, rdf.type, acp.Matcher);
    return matcherThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Matcher]] with the given URL from an [[SolidDataset]].
 *
 * @param matcherResource The Resource that contains the given [[Matcher]].
 * @param url URL that identifies this [[Matcher]].
 * @returns The requested [[Matcher]], if it exists, or `null` if it does not.
 * @since Not released yet.
 */
function getMatcher(matcherResource, url) {
    const foundThing = getThing(matcherResource, url);
    if (foundThing === null || !isMatcher(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[ResourceMatcher]] with the given name from an Resource's Access Control
 * Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains the given [[ResourceMatcher]].
 * @param name Name that identifies this [[ResourceMatcher]].
 * @returns The requested [[ResourceMatcher]], if it exists, or `null` if it does not.
 * @since Not released yet.
 */
function getResourceMatcher(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const url = new URL(acrUrl);
    url.hash = `#${name}`;
    const foundThing = getThing(acr, url.href);
    if (foundThing === null || !isMatcher(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Gets the [[Matcher]]s from a [[SolidDataset]].
 *
 * @param matcherResource The Resource that contains (zero or more) [[Matcher]]s.
 * @returns The [[Matcher]]s contained in this resource.
 * @since Not released yet.
 */
function getMatcherAll(matcherResource) {
    const things = getThingAll(matcherResource);
    return things.filter(isMatcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Gets the [[ResourceMatcher]]s from a Resource's Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceMatcher]]s.
 * @returns The [[ResourceMatcher]]s contained in this Resource's Access Control Resource.
 * @since Not released yet.
 */
function getResourceMatcherAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const things = getThingAll(acr);
    return things.filter(isMatcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the given [[Matcher]] from the given [[SolidDataset]].
 *
 * @param matcherResource The Resource that contains (zero or more) [[Matcher]]s.
 * @returns A new SolidDataset equal to the given Matcher Resource, but without the given Matcher.
 * @since Not released yet.
 */
function removeMatcher(matcherResource, matcher) {
    return removeThing(matcherResource, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the given [[ResourceMatcher]] from the given Resource's Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceMatcher]]s.
 * @returns A new Resource equal to the given Resource, but without the given Matcher in its ACR.
 * @since Not released yet.
 */
function removeResourceMatcher(resourceWithAcr, matcher) {
    const acr = internal_getAcr(resourceWithAcr);
    let matcherToRemove;
    if (typeof matcher === "string") {
        if (internal_isValidUrl(matcher)) {
            matcherToRemove = matcher;
        }
        else {
            // If the given Matcher to remove is the name of the Matcher,
            // resolve it to its full URL — developers usually refer to either the
            // Matcher itself, or by its name, as they do not have access to the ACR
            // directly.
            const matcherUrl = new URL(getSourceUrl(acr));
            matcherUrl.hash = `#${matcher}`;
            matcherToRemove = matcherUrl.href;
        }
    }
    else if (isNamedNode(matcher)) {
        matcherToRemove = internal_toIriString(matcher);
    }
    else {
        matcherToRemove = asUrl(matcher);
    }
    // Check whether the actual Matcher (i.e. with the Matcher type) exists:
    const matchingMatcher = getResourceMatcher(resourceWithAcr, new URL(matcherToRemove).hash.substring(1));
    if (matchingMatcher === null) {
        // No such Matcher exists yet, so return the Resource+ACR unchanged:
        return resourceWithAcr;
    }
    const updatedAcr = removeThing(acr, matchingMatcher);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return updatedResource;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[Matcher]] into the given [[SolidDataset]], replacing previous
 * instances of that Matcher.
 *
 * @param matcherResource The Resource that contains (zero or more) [[Matcher]]s.
 * @returns A new SolidDataset equal to the given Matcher Resource, but with the given Matcher.
 * @since Not released yet.
 */
function setMatcher(matcherResource, matcher) {
    return setThing(matcherResource, matcher);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[ResourceMatcher]] into the given Resource's Access Control Resource,
 * replacing previous instances of that Matcher.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains (zero or more) [[ResourceMatcher]]s.
 * @returns A new Resource equal to the given Resource, but with the given Matcher in its ACR.
 * @since Not released yet.
 */
function setResourceMatcher(resourceWithAcr, matcher) {
    const acr = internal_getAcr(resourceWithAcr);
    const updatedAcr = setThing(acr, matcher);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return updatedResource;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the agents a [[Matcher]] applies **directly** to. This will not include agents
 * that are matched on a property other than their WebID.
 *
 * @param matcher The matcher from which agents are read.
 * @returns A list of the WebIDs of agents included in the matcher.
 * @since Not released yet.
 */
function getAgentAll(matcher) {
    return getIriAll(matcher, acp.agent).filter((agent) => agent !== acp.PublicAgent &&
        agent !== acp.AuthenticatedAgent &&
        agent !== acp.CreatorAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the agents the [[Matcher]] applies to with the provided agents.
 *
 * @param matcher The matcher for which agents are set.
 * @param agent The agent the matcher should apply to.
 * @returns A copy of the input matcher, applying to a different set of agents.
 * @since Not released yet.
 */
function setAgent(matcher, agent) {
    // Preserve the special agent classes authenticated and public, which we
    // don't want to overwrite with this function.
    const isPublic = hasPublic(matcher);
    const isAuthenticated = hasAuthenticated(matcher);
    const isCreator = hasCreator(matcher);
    let result = setIri(matcher, acp.agent, agent);
    // Restore public and authenticated
    if (isPublic) {
        result = setPublic(result);
    }
    if (isAuthenticated) {
        result = setAuthenticated(result);
    }
    if (isCreator) {
        result = setCreator(result);
    }
    return result;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Matcher]] to an additional agent.
 *
 * @param matcher The [[Matcher]] to be applied to an additional agent.
 * @param agent The agent the [[Matcher]] should apply to.
 * @returns A copy of the [[Matcher]], applying to an additional agent.
 * @since Not released yet.
 */
function addAgent(matcher, agent) {
    return addIri(matcher, acp.agent, agent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Matcher]] from applying to a given agent directly. This will not
 * prevent the agent from matching on other properties than its WebID.
 *
 * @param matcher The [[Matcher]] that should no longer apply to a given agent.
 * @param agent The agent the Matcher should no longer apply to.
 * @returns A copy of the Matcher, not applying to the given agent.
 * @since Not released yet.
 */
function removeAgent(matcher, agent) {
    return removeIri(matcher, acp.agent, agent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the Matcher applies to any agent.
 *
 * @param matcher The Matcher checked for public access.
 * @returns Whether the Matcher applies to any agent or not.
 * @since Not released yet.
 */
function hasPublic(matcher) {
    return (getIriAll(matcher, acp.agent).filter((agent) => agent === acp.PublicAgent)
        .length > 0);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to apply to any Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply to any agent.
 * @since Not released yet.
 */
function setPublic(matcher) {
    // The second argument should not be part of the function signature,
    // so it's not in the parameter list:
    // eslint-disable-next-line prefer-rest-params
    if (typeof arguments === "object" && typeof arguments[1] === "boolean") {
        throw new Error("The function `setPublic` no longer takes a second parameter. It is now used together with `removePublic` instead.");
    }
    return addIri(matcher, acp.agent, acp.PublicAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to no longer apply to any Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to no longer apply to any agent.
 * @since Not released yet.
 */
function removePublic(matcher) {
    return removeIri(matcher, acp.agent, acp.PublicAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the Matcher applies to any authenticated agent.
 *
 * @param matcher The Matcher checked for authenticated access.
 * @returns Whether the Matcher applies to any authenticated agent or not.
 * @since Not released yet.
 */
function hasAuthenticated(matcher) {
    return (getIriAll(matcher, acp.agent).filter((agent) => agent === acp.AuthenticatedAgent).length > 0);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to apply to any authenticated Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply to any authenticated Agent.
 * @since Not released yet.
 */
function setAuthenticated(matcher) {
    // The second argument should not be part of the function signature,
    // so it's not in the parameter list:
    // eslint-disable-next-line prefer-rest-params
    if (typeof arguments === "object" && typeof arguments[1] === "boolean") {
        throw new Error("The function `setAuthenticated` no longer takes a second parameter. It is now used together with `removeAuthenticated` instead.");
    }
    return addIri(matcher, acp.agent, acp.AuthenticatedAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to no longer apply to any authenticated Agent.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply/not apply to any authenticated agent.
 * @since Not released yet.
 */
function removeAuthenticated(matcher) {
    return removeIri(matcher, acp.agent, acp.AuthenticatedAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the Matcher applies to the creator of the Resource.
 *
 * @param matcher The Matcher checked for authenticated access.
 * @returns Whether the Matcher applies to the creator of the Resource or not.
 * @since Not released yet.
 */
function hasCreator(matcher) {
    return (getIriAll(matcher, acp.agent).filter((agent) => agent === acp.CreatorAgent)
        .length > 0);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to apply to the creator of a Resource.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply to the creator of a Resource.
 * @since Not released yet.
 */
function setCreator(matcher) {
    // The second argument should not be part of the function signature,
    // so it's not in the parameter list:
    // eslint-disable-next-line prefer-rest-params
    if (typeof arguments === "object" && typeof arguments[1] === "boolean") {
        throw new Error("The function `setCreator` no longer takes a second parameter. It is now used together with `removeCreator` instead.");
    }
    return addIri(matcher, acp.agent, acp.CreatorAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set a Matcher to no longer apply to the creator of a Resource.
 *
 * @param matcher The Matcher being modified.
 * @returns A copy of the Matcher, updated to apply/not apply to the creator of a Resource.
 * @since Not released yet.
 */
function removeCreator(matcher) {
    return removeIri(matcher, acp.agent, acp.CreatorAgent);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the clients a [[Matcher]] applies **directly** to. This will not include
 * specific client classes, such as public clients.
 *
 * @param matcher The Matcher from which clients are read.
 * @returns A list of the WebIDs of clients included in the Matcher.
 * @since Not released yet.
 */
function getClientAll(matcher) {
    return getIriAll(matcher, acp.client)
        .filter((client) => client !== solid.PublicOidcClient)
        .concat(getStringNoLocaleAll(matcher, acp.client));
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Matcher]] to an additional Client.
 *
 * @param matcher The [[Matcher]] to be applied to an additional Client.
 * @param client The Client the [[Matcher]] should apply to.
 * @returns A copy of the [[Matcher]], applying to an additional Client.
 * @since Not released yet.
 */
function addClient(matcher, client) {
    if (!internal_isValidUrl(client)) {
        return addStringNoLocale(matcher, acp.client, client);
    }
    return addIri(matcher, acp.client, client);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Matcher]] from applying to a given Client directly.
 *
 * @param matcher The [[Matcher]] that should no longer apply to a given Client.
 * @param client The Client the Matcher should no longer apply to.
 * @returns A copy of the Matcher, not applying to the given Client.
 * @since Not released yet.
 */
function removeClient(matcher, client) {
    if (!internal_isValidUrl(client)) {
        return removeStringNoLocale(matcher, acp.client, client);
    }
    return removeIri(matcher, acp.client, client);
}

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
/** @hidden */
function setAgentAccessMode(resourceWithAcr, webId, name, mode, operation) {
    var _a;
    const matcherUrl = getDefaultAgentMatcherPolicyMatcherUrl(resourceWithAcr, name, mode);
    // Set default Matcher if not exists
    const resourceWithDefaultAgentMatcher = setDefaultAgentMatcherPolicyMatcherThingIfNotExist(resourceWithAcr, name, mode);
    const defaultAgentMatcherThing = (_a = getThing(internal_getAcr(resourceWithDefaultAgentMatcher), matcherUrl)) !== null && _a !== void 0 ? _a : createThing({ url: matcherUrl });
    return setAccessControlResourceThing(resourceWithDefaultAgentMatcher, operation === "add"
        ? addAgent(defaultAgentMatcherThing, webId)
        : removeAgent(defaultAgentMatcherThing, webId));
}
/**
 * Set access for a given Agent.
 *
 * @param resourceWithAcr URL of the Resource you want to set the access for.
 * @param webId WebID of the Agent you want to set the access for.
 * @param access Access Modes you want to set for the agent.
 * @since 1.16.0
 */
async function setAgentAccess$1(resourceWithAcr, webId, access) {
    const agentAccessModes = await getAgentAccess$2(resourceWithAcr, webId);
    // Add Agent to Default Matchers (including member) if access mode is different from what exists
    if (typeof access.read === "boolean" &&
        agentAccessModes.read !== access.read) {
        resourceWithAcr = setAgentAccessMode(resourceWithAcr, webId, DEFAULT_ACCESS_CONTROL, "read", access.read ? "add" : "remove");
    }
    if (typeof access.append === "boolean" &&
        agentAccessModes.append !== access.append) {
        resourceWithAcr = setAgentAccessMode(resourceWithAcr, webId, DEFAULT_ACCESS_CONTROL, "append", access.append ? "add" : "remove");
    }
    if (typeof access.write === "boolean" &&
        agentAccessModes.write !== access.write) {
        resourceWithAcr = setAgentAccessMode(resourceWithAcr, webId, DEFAULT_ACCESS_CONTROL, "write", access.write ? "add" : "remove");
    }
    if (typeof access.controlRead === "boolean" &&
        agentAccessModes.controlRead !== access.controlRead) {
        resourceWithAcr = setAgentAccessMode(resourceWithAcr, webId, DEFAULT_ACR_ACCESS_CONTROL, "controlRead", access.controlRead ? "add" : "remove");
    }
    if (typeof access.controlWrite === "boolean" &&
        agentAccessModes.controlWrite !== access.controlWrite) {
        resourceWithAcr = setAgentAccessMode(resourceWithAcr, webId, DEFAULT_ACR_ACCESS_CONTROL, "controlWrite", access.controlWrite ? "add" : "remove");
    }
    return resourceWithAcr;
}

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
 * Set access to a resource for a given Agent.
 *
 * This function works with Solid Pods that implement either the Web Access
 * Control spec or the Access Control Policies proposal, with some caveats:
 *
 * - If access to the given Resource has been set using anything other than the
 *   functions in this module, it is possible that it has been set in a way that
 *   prevents this function from reliably setting access.
 * - It will only set access explicitly for the given Agent. In other words,
 *   additional restrictions could be present that further restrict or loosen
 *   what access the given Agent has in particular circumstances.
 * - The provided access will only apply to the given Resource. In other words,
 *   if the Resource is a Container, the configured Access will not apply to
 *   contained Resources.
 * - If the current user does not have permission to view or change access for
 *   the given Resource, this function will resolve to `null`.
 *
 * Additionally, two caveats apply to users with a Pod server that uses WAC:
 * - If the Resource did not have an ACL yet, a new one will be initialised.
 *   This means that changes to the ACL of a parent Container can no longer
 *   affect access people have to this Resource, although existing access will
 *   be preserved.
 * - Setting different values for `controlRead` and `controlWrite` is not
 *   supported, and **will throw an error**. If you expect (some of) your users
 *   to have Pods implementing WAC, be sure to pass the same value for both.
 *
 * @param resourceUrl URL of the Resource you want to set access for.
 * @param webId WebID of the Agent you want to set access for.
 * @param access The Access Modes to add (true) or remove (false).
 * @param options Default Options such as a fetch function.
 * @since 1.19.0
 */
async function setAgentAccess(resourceUrl, webId, access, options) {
    // TODO: Change the standard getAgentAccess signatures to all take a  T extends WithAcl
    const resourceInfo = await getResourceInfo(resourceUrl, options);
    const acr = await getResourceAcr(resourceInfo, options);
    if (acr === null) {
        await setAgentResourceAccess(resourceInfo, webId, access, options);
        return getAgentAccess$1(resourceInfo, webId, options);
    }
    // TODO: Make sure both setAgentAccessWac and setAgentAccessAcp don't save within the function, expose one standard saveAclFor function that is universal.
    try {
        await saveAcrFor(await setAgentAccess$1(acr, webId, access), options);
        return await getAgentAccess(resourceUrl, webId, options);
    }
    catch (e) {
        return null;
    }
}

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
 * Set access for the public.
 *
 * @param resourceWithAcr URL of the Resource you want to read the access for.
 * @param access Access Modes you want to set for the agent.
 * @since 1.16.0
 */
async function setPublicAccess$1(resourceWithAcr, access) {
    return setAgentAccess$1(resourceWithAcr, ACP.PublicAgent, access);
}

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
 * Set access to a resource for the public.
 *
 * This function works with Solid Pods that implement either the Web Access
 * Control spec or the Access Control Policies proposal, with some caveats:
 *
 * - If access to the given Resource has been set using anything other than the
 *   functions in this module, it is possible that it has been set in a way that
 *   prevents this function from reliably setting access.
 * - It will only set access explicitly for the given Agent. In other words,
 *   additional restrictions could be present that further restrict or loosen
 *   what access the given Agent has in particular circumstances.
 * - The provided access will only apply to the given Resource. In other words,
 *   if the Resource is a Container, the configured Access will not apply to
 *   contained Resources.
 * - If the current user does not have permission to view or change access for
 *   the given Resource, this function will resolve to `null`.
 *
 * Additionally, two caveats apply to users with a Pod server that uses WAC:
 * - If the Resource did not have an ACL yet, a new one will be initialised.
 *   This means that changes to the ACL of a parent Container can no longer
 *   affect access people have to this Resource, although existing access will
 *   be preserved.
 * - Setting different values for `controlRead` and `controlWrite` is not
 *   supported, and **will throw an error**. If you expect (some of) your users
 *   to have Pods implementing WAC, be sure to pass the same value for both.
 *
 * @param resourceUrl URL of the Resource you want to set access for.
 * @param access The Access Modes to add (true) or remove (false).
 * @param options Default Options such as a fetch function.
 * @since 1.19.0
 */
async function setPublicAccess(resourceUrl, access, options) {
    const resourceInfo = await getResourceInfo(resourceUrl, options);
    const acr = await getResourceAcr(resourceInfo, options);
    if (acr === null) {
        await setPublicResourceAccess(resourceInfo, access, options);
        return getPublicAccess$2(resourceInfo, options);
    }
    try {
        await saveAcrFor(await setPublicAccess$1(acr, access), options);
        return await getPublicAccess(resourceUrl, options);
    }
    catch (e) {
        return null;
    }
}

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
 * :::{admonition} Experimental API
 * :class: important
 *
 * This API is still experimental, and subject to change. It builds on top of
 * both ACP and WAC, aiming at being adaptable to any Access Control system that
 * may be implemented in Solid. That is why it is purely Resource-centric: the
 * library discovers metadata associated with the Resource itself, and calls the
 * appropriate underlying API to deal with the Access Control in place for the
 * target Resource.
 *
 * As it is still under development, the following export is *only* intended for
 * experimentation by early adopters, and is not recommended for production
 * applications.
 *
 * For more information see: [Tutorial: Managing
 * Access](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/manage-access/)
 * :::
 *
 * This module can be imported as an object from the main package, which results
 * in tree-shaking not being supported (so all the exported APIs will likely end
 * up in your bundle). This import style is used for environments such as nextjs
 * or create-react-app.
 *
 * ```typescript
 * import { universalAccess } from "@inrupt/solid-client";
 * ```
 *
 * Alternatively, if your environment supports [export
 * maps](https://nodejs.org/dist/latest-v16.x/docs/api/packages.html#exports),
 * then you can import directly:
 *
 * ```typescript
 * import * as universalAccess from "@inrupt/solid-client/universal";
 * ```
 *
 * If you're using Typescript, and receive errors about type definitions not
 * being found, please see this
 * [documentation](https://www.typescriptlang.org/docs/handbook/esm-node.html)
 *
 * @packageDocumentation
 * @module universalAccess
 */

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getAclServerResourceInfo: getAclServerResourceInfo,
    getAgentAccess: getAgentAccess,
    getAgentAccessAll: getAgentAccessAll,
    getPublicAccess: getPublicAccess,
    setAgentAccess: setAgentAccess,
    setPublicAccess: setPublicAccess
});

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Add a policy applying to the ACRs of the given resource's children.
 *
 * @param resourceWithAcr The resource for which to add the URL of a policy
 * applying to its children's access control resources.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function addMemberAcrPolicyUrl(resourceWithAcr, policyUrl) {
    const resourceWithAcrContainingDefaultAccessControl = setDefaultAccessControlThingIfNotExist(resourceWithAcr, DEFAULT_MEMBER_ACR_ACCESS_CONTROL);
    const defaultAccessControlThing = getDefaultAccessControlThing(resourceWithAcrContainingDefaultAccessControl, DEFAULT_MEMBER_ACR_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcrContainingDefaultAccessControl, buildThing(defaultAccessControlThing).addUrl(ACP.access, policyUrl).build());
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Add a policy applying to the given resource's children.
 *
 * @param resourceWithAcr The resource for which to add the URL of a policy
 * applying to its children.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function addMemberPolicyUrl(resourceWithAcr, policyUrl) {
    const resourceWithAcrContainingDefaultMemberAccessControl = setDefaultAccessControlThingIfNotExist(resourceWithAcr, DEFAULT_MEMBER_ACCESS_CONTROL);
    const defaultMemberAccessControlThing = getDefaultAccessControlThing(resourceWithAcrContainingDefaultMemberAccessControl, DEFAULT_MEMBER_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcrContainingDefaultMemberAccessControl, buildThing(defaultMemberAccessControlThing)
        .addUrl(ACP.apply, policyUrl)
        .build());
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URL of all member access controls linked to the given resource's ACR.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs of access
 * controls inherited by its children.
 * @returns Access Control URL array
 * @since 1.6.0
 */
function getMemberAccessControlUrlAll(resourceWithAcr) {
    const acrThing = getAccessControlResourceThing(resourceWithAcr);
    if (acrThing === null) {
        return [];
    }
    return getIriAll(acrThing, ACP.memberAccessControl);
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URLs of policies applying to the ACRs of the given resource's
 * children.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs of policies
 * applying to its children's access control resources.
 * @returns Policy URL array.
 * @since 1.16.1
 */
function getMemberAcrPolicyUrlAll(resourceWithAcr) {
    return getPolicyUrls(resourceWithAcr, getMemberAccessControlUrlAll(resourceWithAcr), ACP.access);
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Get the URLs of policies applying to the given resource's children.
 *
 * @param resourceWithAcr The resource for which to retrieve URLs policies
 * applying to its children.
 * @returns Policy URL array.
 * @since 1.16.1
 */
function getMemberPolicyUrlAll(resourceWithAcr) {
    return getPolicyUrls(resourceWithAcr, getMemberAccessControlUrlAll(resourceWithAcr), ACP.apply);
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Remove a policy applying to the ACR of the given resource.
 *
 * @param resourceWithAcr The resource for which to remove the URL of a policy
 * applying to its access control resource.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function removeAcrPolicyUrl(resourceWithAcr, policyUrl) {
    const defaultAccessControlThing = getDefaultAccessControlThing(resourceWithAcr, DEFAULT_ACR_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcr, removeIri(defaultAccessControlThing, ACP.access, policyUrl));
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Remove a policy applying to the ACRs of the given resource's children.
 *
 * @param resourceWithAcr The resource for which to remove the URL of a policy
 * applying to its children's access control resources.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function removeMemberAcrPolicyUrl(resourceWithAcr, policyUrl) {
    const defaultAccessControlThing = getDefaultAccessControlThing(resourceWithAcr, DEFAULT_MEMBER_ACR_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcr, removeIri(defaultAccessControlThing, ACP.access, policyUrl));
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Remove a policy applying to the given resource's children.
 *
 * @param resourceWithAcr The resource for which to remove the URL of a policy
 * applying to its children.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function removeMemberPolicyUrl(resourceWithAcr, policyUrl) {
    const defaultAccessControlThing = getDefaultAccessControlThing(resourceWithAcr, DEFAULT_MEMBER_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcr, removeIri(defaultAccessControlThing, ACP.apply, policyUrl));
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Remove a policy applying to the given resource.
 *
 * @param resourceWithAcr The resource for which to remove the URL of a policy
 * applying to it.
 * @param policyUrl A Policy URL.
 * @returns The resource with its ammended access control resource.
 * @since 1.16.1
 */
function removePolicyUrl(resourceWithAcr, policyUrl) {
    const defaultAccessControlThing = getDefaultAccessControlThing(resourceWithAcr, DEFAULT_ACCESS_CONTROL);
    return setAccessControlResourceThing(resourceWithAcr, removeIri(defaultAccessControlThing, ACP.apply, policyUrl));
}

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
 * ```{note}
 * The ACP specification is a draft. As such, this function is experimental and
 * subject to change, even in a non-major release.
 * See also: https://solid.github.io/authorization-panel/acp-specification/
 * ```
 *
 * Insert the given [[ResourcePolicy]] into the given Resource's Acccess Control
 * Resource, replacing previous instances of that Policy.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @param policy The Policy to insert into the Resource's Access Control Resource.
 * @returns A new Resource equal to the given Resource, but with the given Policy in its Access Control Resource.
 * @since 1.18.0
 */
function setResourcePolicy(resourceWithAcr, policy) {
    return setAccessControlResourceThing(resourceWithAcr, policy);
}

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
 * @param thing the [[Thing]] to check to see if it's an ACP Policy or not
 */
function isPolicy(thing) {
    return getIriAll(thing, rdf.type).includes(acp.Policy);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[Policy]].
 *
 * @param url URL that identifies this Policy.
 * @since 1.6.0
 */
function createPolicy(url) {
    const stringUrl = internal_toIriString(url);
    let policyThing = createThing({ url: stringUrl });
    policyThing = setUrl(policyThing, rdf.type, acp.Policy);
    return policyThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Policy]] with the given URL from an [[SolidDataset]].
 *
 * @param policyResource The Resource that contains the given Policy.
 * @param url URL that identifies this Policy.
 * @returns The requested Policy, if it exists, or `null` if it does not.
 * @since 1.6.0
 */
function getPolicy(policyResource, url) {
    const foundThing = getThing(policyResource, url);
    if (foundThing === null || !isPolicy(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[Policy]]'s in a given [[SolidDataset]].
 *
 * @param policyResource The Resource that contains Access Policies.
 * @since 1.6.0
 */
function getPolicyAll(policyResource) {
    const foundThings = getThingAll(policyResource);
    const foundPolicies = foundThings.filter((thing) => !isThingLocal(thing) && isPolicy(thing));
    return foundPolicies;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove the given [[Policy]] from the given [[SolidDataset]].
 *
 * @param policyResource The Resource that contains Access Policies.
 * @param policy The Policy to remove from the resource.
 * @since 1.6.0
 */
function removePolicy(policyResource, policy) {
    return removeThing(policyResource, policy);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[Policy]] into the given [[SolidDataset]], replacing previous instances of that Policy.
 *
 * @param policyResource The Resource that contains Access Policies.
 * @param policy The Policy to insert into the Resource.
 * @returns A new dataset equal to the given resource, but with the given Policy.
 * @since 1.6.0
 */
function setPolicy(policyResource, policy) {
    return setThing(policyResource, policy);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]] and a set of [[AccessModes]], return a new Policy based on the given
 * Policy, but with the given Access Modes allowed on it.
 *
 * @param policy The Policy on which to set the modes to allow.
 * @param modes Modes to allow for this Policy.
 * @since Not released yet.
 */
function setAllowModesV2(policy, modes) {
    let newPolicy = removeAll(policy, acp.allow);
    if (modes.read === true) {
        newPolicy = addIri(newPolicy, acp.allow, internal_accessModeIriStrings.read);
    }
    if (modes.append === true) {
        newPolicy = addIri(newPolicy, acp.allow, internal_accessModeIriStrings.append);
    }
    if (modes.write === true) {
        newPolicy = addIri(newPolicy, acp.allow, internal_accessModeIriStrings.write);
    }
    return newPolicy;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]], return which [[AccessModes]] it allows.
 *
 * @param policy The Policy for which you want to know the Access Modes it allows.
 * @since Not released yet.
 */
function getAllowModesV2(policy) {
    const allowedModes = getIriAll(policy, acp.allow);
    return {
        read: allowedModes.includes(internal_accessModeIriStrings.read),
        append: allowedModes.includes(internal_accessModeIriStrings.append),
        write: allowedModes.includes(internal_accessModeIriStrings.write),
    };
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]] and a set of [[AccessModes]], return a new Policy based on the given
 * Policy, but with the given Access Modes disallowed on it.
 *
 * @param policy The Policy on which to set the modes to disallow.
 * @param modes Modes to disallow for this Policy.
 * @since Not released yet.
 */
function setDenyModesV2(policy, modes) {
    let newPolicy = removeAll(policy, acp.deny);
    if (modes.read === true) {
        newPolicy = addIri(newPolicy, acp.deny, internal_accessModeIriStrings.read);
    }
    if (modes.append === true) {
        newPolicy = addIri(newPolicy, acp.deny, internal_accessModeIriStrings.append);
    }
    if (modes.write === true) {
        newPolicy = addIri(newPolicy, acp.deny, internal_accessModeIriStrings.write);
    }
    return newPolicy;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Given a [[Policy]], return which [[AccessModes]] it disallows.
 *
 * @param policy The Policy on which you want to know the Access Modes it disallows.
 * @since Not released yet.
 */
function getDenyModesV2(policy) {
    const deniedModes = getIriAll(policy, acp.deny);
    return {
        read: deniedModes.includes(internal_accessModeIriStrings.read),
        append: deniedModes.includes(internal_accessModeIriStrings.append),
        write: deniedModes.includes(internal_accessModeIriStrings.write),
    };
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[ResourcePolicy]] for the given Resource.
 *
 * @param resourceWithAcr The Resource to which the Policy is to apply.
 * @param name The name that identifies this Policy.
 * @since 1.6.0
 */
function createResourcePolicyFor(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const url = new URL(getSourceUrl(acr));
    url.hash = `#${name}`;
    let policyThing = createThing({ url: url.href });
    policyThing = setUrl(policyThing, rdf.type, acp.Policy);
    return policyThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[ResourcePolicy]] with the given name that applies to a Resource
 * from its Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose ACR contains the given Policy.
 * @param name The name that identifies this Policy.
 * @returns The requested Policy, if it exists and applies to the given Resource, or `null` if it does not.
 * @since 1.6.0
 */
function getResourcePolicy(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const url = new URL(acrUrl);
    url.hash = `#${name}`;
    const foundThing = getThing(acr, url.href);
    if (!getPolicyUrlAll$1(resourceWithAcr).includes(url.href) ||
        foundThing === null ||
        !isPolicy(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[ResourcePolicy]] with the given name that applies to a Resource's
 * Access Control Resource from that Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose ACR contains the given Policy.
 * @param name The name that identifies this Policy.
 * @returns The requested Policy, if it exists and applies to the Resource's ACR, or `null` if it does not.
 * @since 1.6.0
 */
function getResourceAcrPolicy(resourceWithAcr, name) {
    const acr = internal_getAcr(resourceWithAcr);
    const acrUrl = getSourceUrl(acr);
    const url = new URL(acrUrl);
    url.hash = `#${name}`;
    const foundThing = getThing(acr, url.href);
    if (!getAcrPolicyUrlAll$1(resourceWithAcr).includes(url.href) ||
        foundThing === null ||
        !isPolicy(foundThing)) {
        return null;
    }
    return foundThing;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[ResourcePolicy]]'s that apply to a Resource in its Access Control
 * Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies applying to it.
 * @since 1.6.0
 */
function getResourcePolicyAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const policyUrls = getPolicyUrlAll$1(resourceWithAcr);
    const foundThings = policyUrls.map((policyUrl) => getThing(acr, policyUrl));
    const foundPolicies = foundThings.filter((thing) => thing !== null && isPolicy(thing));
    return foundPolicies;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get all [[ResourcePolicy]]'s that apply to a given Resource's Access Control
 * Resource from that Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @since 1.6.0
 */
function getResourceAcrPolicyAll(resourceWithAcr) {
    const acr = internal_getAcr(resourceWithAcr);
    const policyUrls = getAcrPolicyUrlAll$1(resourceWithAcr);
    const foundThings = policyUrls.map((policyUrl) => getThing(acr, policyUrl));
    const foundPolicies = foundThings.filter((thing) => thing !== null && isPolicy(thing));
    return foundPolicies;
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove the given [[ResourcePolicy]] from the given Resource's Access Control
 * Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @param policy The Policy to remove from the Resource's Access Control Resource.
 * @since 1.6.0
 */
function removeResourcePolicy(resourceWithAcr, policy) {
    const acr = internal_getAcr(resourceWithAcr);
    let policyToRemove = policy;
    if (typeof policyToRemove === "string") {
        if (internal_isValidUrl(policyToRemove) === false) {
            // If the given Policy to remove is the name of the Policy,
            // resolve it to its full URL — developers usually refer to either the
            // Policy itself, or by its name, as they do not have access to the ACR
            // directly.
            const policyUrl = new URL(getSourceUrl(acr));
            policyUrl.hash = `#${policy}`;
            policyToRemove = policyUrl.href;
        }
    }
    let policyUrlString;
    if (typeof policyToRemove === "string") {
        policyUrlString = policyToRemove;
    }
    else if (isNamedNode(policyToRemove)) {
        policyUrlString = internal_toIriString(policyToRemove);
    }
    else {
        policyUrlString = asUrl(policyToRemove, getSourceUrl(acr));
    }
    // Check whether the actual Policy (i.e. with the Policy type) exists:
    const matchingRule = getResourcePolicy(resourceWithAcr, new URL(policyUrlString).hash.substring(1));
    if (matchingRule === null) {
        // No such Policy exists yet, so return the Resource+ACR unchanged:
        return resourceWithAcr;
    }
    const updatedAcr = removeThing(acr, policyToRemove);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return removePolicyUrl$1(updatedResource, policyUrlString);
}
/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Remove the given [[ResourcePolicy]] that applies to a given Resource's Access
 * Control Resource from that Access Control Resource.
 *
 * @param resourceWithAcr The Resource whose Access Control Resource contains Access Policies.
 * @param policy The ACR Policy to remove from the Resource's Access Control Resource.
 * @since 1.6.0
 */
function removeResourceAcrPolicy(resourceWithAcr, policy) {
    const acr = internal_getAcr(resourceWithAcr);
    let policyToRemove = policy;
    if (typeof policyToRemove === "string") {
        if (internal_isValidUrl(policyToRemove) === false) {
            // If the given Policy to remove is the name of the Policy,
            // resolve it to its full URL — developers usually refer to either the
            // Policy itself, or by its name, as they do not have access to the ACR
            // directly.
            const policyUrl = new URL(getSourceUrl(acr));
            policyUrl.hash = `#${policy}`;
            policyToRemove = policyUrl.href;
        }
    }
    let policyUrlString;
    if (typeof policyToRemove === "string") {
        policyUrlString = policyToRemove;
    }
    else if (isNamedNode(policyToRemove)) {
        policyUrlString = internal_toIriString(policyToRemove);
    }
    else {
        policyUrlString = asUrl(policyToRemove, getSourceUrl(acr));
    }
    // Check whether the actual Policy (i.e. with the Policy type) exists:
    const matchingRule = getResourceAcrPolicy(resourceWithAcr, new URL(policyUrlString).hash.substring(1));
    if (matchingRule === null) {
        // No such Policy exists yet, so return the Resource+ACR unchanged:
        return resourceWithAcr;
    }
    const updatedAcr = removeThing(acr, policyToRemove);
    const updatedResource = internal_setAcr(resourceWithAcr, updatedAcr);
    return removeAcrPolicyUrl$1(updatedResource, policyUrlString);
}

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
 *
 * ```{warning}
 * Do not use this function in production code.  For use in **unit tests** that require a
 * [[AccessControlResource]].
 * ```
 *
 * Initialises a new empty Access Control Resource for a given Resource for use
 * in **unit tests**.
 *
 * @param resourceUrl The URL of the Resource to which the mocked ACR should apply.
 * @returns The mocked empty Access Control Resource for the given Resource.
 * @since 1.6.0
 */
function mockAcrFor(resourceUrl) {
    const acrUrl = new URL("access-control-resource", resourceUrl).href;
    const acr = {
        ...mockSolidDatasetFrom(acrUrl),
        accessTo: resourceUrl,
    };
    return acr;
}
/**
 * ```{warning}
 * Do not use this function in production code.  For use in **unit tests** that require a
 * Resource with an [[AccessControlResource]].
 * ```
 *
 * Attaches an Access Control Resource to a given [[SolidDataset]] for use
 * in **unit tests**; e.g., unit tests that call [[getPolicyUrlAll]].
 *
 * @param resource The Resource to mock up with a new resource ACL.
 * @param accessControlResource The Access Control Resource to attach to the given Resource.
 * @returns The input Resource with an empty resource ACL attached.
 * @since 1.6.0
 */
function addMockAcrTo(resource, accessControlResource = mockAcrFor(getSourceUrl(resource))) {
    const resourceWithAcr = Object.assign(internal_cloneResource(resource), {
        internal_acp: {
            acr: accessControlResource,
            aprs: {},
        },
    });
    return resourceWithAcr;
}

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
 * :::{admonition} Experimental API
 * :class: important
 *
 * The Access Control Policies proposal has not yet been reviewed for inclusion in the Solid spec.
 * To enable early experimentation, solid-client exposes a low-level API. However, this API can and
 * will include breaking changes in non-major releases. Additionally, for most applications, a
 * higher-level API that is planned will be more applicable.
 *
 * Thus, the following export is *only* intended for experimentation by early adopters, and is not
 * recommended for production applications. Because of this, all ACP-related API's are exported on a
 * single object, which does not facilitate tree-shaking: if you use one ACP-related API, all of
 * them will be included in your bundle.
 *
 * For more information see: [Tutorial: Managing
 * Access](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/manage-access/)
 * :::
 *
 * This module supports Inrupt's ESS 2.0 ACP implementation.
 *
 * This module can be imported as an object from the main package, which results
 * in tree-shaking not being supported (so all the exported APIs will likely end
 * up in your bundle). This import style is used for environments such as nextjs
 * or create-react-app.
 *
 * ```typescript
 * import { acp_ess_2 } from "@inrupt/solid-client";
 * ```
 *
 * @packageDocumentation
 * @module acp_ess_2
 */

var ess2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    addAcrPolicyUrl: addAcrPolicyUrl,
    addAgent: addAgent,
    addAllOfMatcherUrl: addAllOfMatcherUrl,
    addAnyOfMatcherUrl: addAnyOfMatcherUrl,
    addClient: addClient,
    addMemberAcrPolicyUrl: addMemberAcrPolicyUrl,
    addMemberPolicyUrl: addMemberPolicyUrl,
    addMockAcrTo: addMockAcrTo,
    addNoneOfMatcherUrl: addNoneOfMatcherUrl,
    addPolicyUrl: addPolicyUrl,
    createMatcher: createMatcher,
    createPolicy: createPolicy,
    createResourceMatcherFor: createResourceMatcherFor,
    createResourcePolicyFor: createResourcePolicyFor,
    getAcrPolicyUrlAll: getAcrPolicyUrlAll,
    getAgentAll: getAgentAll,
    getAllOfMatcherUrlAll: getAllOfMatcherUrlAll,
    getAllowModes: getAllowModesV2,
    getAnyOfMatcherUrlAll: getAnyOfMatcherUrlAll,
    getClientAll: getClientAll,
    getDenyModes: getDenyModesV2,
    getFileWithAccessDatasets: getFileWithAccessDatasets,
    getFileWithAcr: getFileWithAcr,
    getLinkedAcrUrl: getLinkedAcrUrl,
    getMatcher: getMatcher,
    getMatcherAll: getMatcherAll,
    getMemberAcrPolicyUrlAll: getMemberAcrPolicyUrlAll,
    getMemberPolicyUrlAll: getMemberPolicyUrlAll,
    getNoneOfMatcherUrlAll: getNoneOfMatcherUrlAll,
    getPolicy: getPolicy,
    getPolicyAll: getPolicyAll,
    getPolicyUrlAll: getPolicyUrlAll,
    getReferencedPolicyUrlAll: getReferencedPolicyUrlAll,
    getResourceAcrPolicy: getResourceAcrPolicy,
    getResourceAcrPolicyAll: getResourceAcrPolicyAll,
    getResourceInfoWithAccessDatasets: getResourceInfoWithAccessDatasets,
    getResourceInfoWithAcr: getResourceInfoWithAcr,
    getResourceMatcher: getResourceMatcher,
    getResourceMatcherAll: getResourceMatcherAll,
    getResourcePolicy: getResourcePolicy,
    getResourcePolicyAll: getResourcePolicyAll,
    getSolidDatasetWithAccessDatasets: getSolidDatasetWithAccessDatasets,
    getSolidDatasetWithAcr: getSolidDatasetWithAcr,
    getVcAccess: getVcAccess,
    hasAccessibleAcr: hasAccessibleAcr,
    hasAuthenticated: hasAuthenticated,
    hasCreator: hasCreator,
    hasLinkedAcr: hasLinkedAcr,
    hasPublic: hasPublic,
    isAcpControlled: isAcpControlled,
    mockAcrFor: mockAcrFor,
    removeAcrPolicyUrl: removeAcrPolicyUrl,
    removeAcrPolicyUrlAll: removeAcrPolicyUrlAll,
    removeAgent: removeAgent,
    removeAllOfMatcherUrl: removeAllOfMatcherUrl,
    removeAnyOfMatcherUrl: removeAnyOfMatcherUrl,
    removeAuthenticated: removeAuthenticated,
    removeClient: removeClient,
    removeCreator: removeCreator,
    removeMatcher: removeMatcher,
    removeMemberAcrPolicyUrl: removeMemberAcrPolicyUrl,
    removeMemberAcrPolicyUrlAll: removeMemberAcrPolicyUrlAll,
    removeMemberPolicyUrl: removeMemberPolicyUrl,
    removeMemberPolicyUrlAll: removeMemberPolicyUrlAll,
    removeNoneOfMatcherUrl: removeNoneOfMatcherUrl,
    removePolicy: removePolicy,
    removePolicyUrl: removePolicyUrl,
    removePolicyUrlAll: removePolicyUrlAll,
    removePublic: removePublic,
    removeResourceAcrPolicy: removeResourceAcrPolicy,
    removeResourceMatcher: removeResourceMatcher,
    removeResourcePolicy: removeResourcePolicy,
    saveAcrFor: saveAcrFor,
    setAgent: setAgent,
    setAllOfMatcherUrl: setAllOfMatcherUrl,
    setAllowModes: setAllowModesV2,
    setAnyOfMatcherUrl: setAnyOfMatcherUrl,
    setAuthenticated: setAuthenticated,
    setCreator: setCreator,
    setDenyModes: setDenyModesV2,
    setMatcher: setMatcher,
    setNoneOfMatcherUrl: setNoneOfMatcherUrl,
    setPolicy: setPolicy,
    setPublic: setPublic,
    setResourceMatcher: setResourceMatcher,
    setResourcePolicy: setResourcePolicy,
    setVcAccess: setVcAccess
});

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
// Export the different formats methods from @inrupt/solid-client import, these
// are not part of our Public API, but are needed to be exported for usage from
// our other packages.
//
// NOTE: We have to export like this, otherwise rollup does some sort of
// tree-shaking and breaks the build where `dist/formats/index.mjs` is no longer
// built, and this causes the `@inrupt/solid-client/formats` subpath export to
// no longer work.
const { getJsonLdParser, getTurtleParser, solidDatasetAsTurtle } = formats;

exports.FetchError = FetchError;
exports.SolidClientError = SolidClientError;
exports.ThingExpectedError = ThingExpectedError;
exports.acp_ess_2 = ess2;
exports.addBoolean = addBoolean;
exports.addDate = addDate;
exports.addDatetime = addDatetime;
exports.addDecimal = addDecimal;
exports.addInteger = addInteger;
exports.addIri = addIri;
exports.addJwkToJwks = addJwkToJwks;
exports.addLiteral = addLiteral;
exports.addMockFallbackAclTo = addMockFallbackAclTo;
exports.addMockResourceAclTo = addMockResourceAclTo;
exports.addNamedNode = addNamedNode;
exports.addPublicKeyToProfileJwks = addPublicKeyToProfileJwks;
exports.addStringEnglish = addStringEnglish;
exports.addStringNoLocale = addStringNoLocale;
exports.addStringWithLocale = addStringWithLocale;
exports.addTerm = addTerm;
exports.addTime = addTime;
exports.addUrl = addUrl;
exports.asIri = asIri;
exports.asUrl = asUrl;
exports.buildThing = buildThing;
exports.changeLogAsMarkdown = changeLogAsMarkdown;
exports.createAcl = createAcl;
exports.createAclFromFallbackAcl = createAclFromFallbackAcl;
exports.createContainerAt = createContainerAt;
exports.createContainerInContainer = createContainerInContainer;
exports.createSolidDataset = createSolidDataset;
exports.createThing = createThing;
exports.deleteAclFor = deleteAclFor;
exports.deleteContainer = deleteContainer;
exports.deleteFile = deleteFile;
exports.deleteSolidDataset = deleteSolidDataset;
exports.fromRdfJsDataset = fromRdfJsDataset;
exports.getAgentAccess = getAgentAccess$3;
exports.getAgentAccessAll = getAgentAccessAll$3;
exports.getAgentDefaultAccess = getAgentDefaultAccess;
exports.getAgentDefaultAccessAll = getAgentDefaultAccessAll;
exports.getAgentResourceAccess = getAgentResourceAccess;
exports.getAgentResourceAccessAll = getAgentResourceAccessAll;
exports.getAltProfileUrlAllFrom = getAltProfileUrlAllFrom;
exports.getBoolean = getBoolean;
exports.getBooleanAll = getBooleanAll;
exports.getContainedResourceUrlAll = getContainedResourceUrlAll;
exports.getContentType = getContentType$1;
exports.getDate = getDate;
exports.getDateAll = getDateAll;
exports.getDatetime = getDatetime;
exports.getDatetimeAll = getDatetimeAll;
exports.getDecimal = getDecimal;
exports.getDecimalAll = getDecimalAll;
exports.getEffectiveAccess = getEffectiveAccess;
exports.getFallbackAcl = getFallbackAcl;
exports.getFile = getFile;
exports.getFileWithAcl = getFileWithAcl;
exports.getGroupAccess = getGroupAccess;
exports.getGroupAccessAll = getGroupAccessAll;
exports.getGroupDefaultAccess = getGroupDefaultAccess;
exports.getGroupDefaultAccessAll = getGroupDefaultAccessAll;
exports.getGroupResourceAccess = getGroupResourceAccess;
exports.getGroupResourceAccessAll = getGroupResourceAccessAll;
exports.getInteger = getInteger;
exports.getIntegerAll = getIntegerAll;
exports.getIri = getIri;
exports.getIriAll = getIriAll;
exports.getJsonLdParser = getJsonLdParser;
exports.getLinkedResourceUrlAll = getLinkedResourceUrlAll;
exports.getLiteral = getLiteral;
exports.getLiteralAll = getLiteralAll;
exports.getNamedNode = getNamedNode;
exports.getNamedNodeAll = getNamedNodeAll;
exports.getPodOwner = getPodOwner;
exports.getPodUrlAll = getPodUrlAll;
exports.getPodUrlAllFrom = getPodUrlAllFrom;
exports.getProfileAll = getProfileAll;
exports.getProfileJwksIri = getProfileJwksIri;
exports.getPropertyAll = getPropertyAll;
exports.getPublicAccess = getPublicAccess$3;
exports.getPublicDefaultAccess = getPublicDefaultAccess;
exports.getPublicResourceAccess = getPublicResourceAccess;
exports.getResourceAcl = getResourceAcl;
exports.getResourceInfo = getResourceInfo;
exports.getResourceInfoWithAcl = getResourceInfoWithAcl;
exports.getSolidDataset = getSolidDataset;
exports.getSolidDatasetWithAcl = getSolidDatasetWithAcl;
exports.getSourceIri = getSourceIri;
exports.getSourceUrl = getSourceUrl;
exports.getStringByLocaleAll = getStringByLocaleAll;
exports.getStringEnglish = getStringEnglish;
exports.getStringEnglishAll = getStringEnglishAll;
exports.getStringNoLocale = getStringNoLocale;
exports.getStringNoLocaleAll = getStringNoLocaleAll;
exports.getStringWithLocale = getStringWithLocale;
exports.getStringWithLocaleAll = getStringWithLocaleAll;
exports.getTerm = getTerm;
exports.getTermAll = getTermAll;
exports.getThing = getThing;
exports.getThingAll = getThingAll;
exports.getTime = getTime;
exports.getTimeAll = getTimeAll;
exports.getTurtleParser = getTurtleParser;
exports.getUrl = getUrl;
exports.getUrlAll = getUrlAll;
exports.getWebIdDataset = getWebIdDataset;
exports.getWellKnownSolid = getWellKnownSolid;
exports.hasAccessibleAcl = hasAccessibleAcl;
exports.hasAcl = hasAcl;
exports.hasFallbackAcl = hasFallbackAcl;
exports.hasResourceAcl = hasResourceAcl;
exports.hasResourceInfo = hasResourceInfo;
exports.hasServerResourceInfo = hasServerResourceInfo;
exports.isContainer = isContainer;
exports.isPodOwner = isPodOwner;
exports.isRawData = isRawData;
exports.isThing = isThing;
exports.isThingLocal = isThingLocal;
exports.mockContainerFrom = mockContainerFrom;
exports.mockFetchError = mockFetchError;
exports.mockFileFrom = mockFileFrom;
exports.mockSolidDatasetFrom = mockSolidDatasetFrom;
exports.mockThingFrom = mockThingFrom;
exports.overwriteFile = overwriteFile;
exports.removeAll = removeAll;
exports.removeBoolean = removeBoolean;
exports.removeDate = removeDate;
exports.removeDatetime = removeDatetime;
exports.removeDecimal = removeDecimal;
exports.removeInteger = removeInteger;
exports.removeIri = removeIri;
exports.removeLiteral = removeLiteral;
exports.removeNamedNode = removeNamedNode;
exports.removeStringEnglish = removeStringEnglish;
exports.removeStringNoLocale = removeStringNoLocale;
exports.removeStringWithLocale = removeStringWithLocale;
exports.removeThing = removeThing;
exports.removeTime = removeTime;
exports.removeUrl = removeUrl;
exports.responseToResourceInfo = responseToResourceInfo;
exports.responseToSolidDataset = responseToSolidDataset;
exports.saveAclFor = saveAclFor;
exports.saveFileInContainer = saveFileInContainer;
exports.saveSolidDatasetAt = saveSolidDatasetAt;
exports.saveSolidDatasetInContainer = saveSolidDatasetInContainer;
exports.setAgentDefaultAccess = setAgentDefaultAccess;
exports.setAgentResourceAccess = setAgentResourceAccess$1;
exports.setBoolean = setBoolean;
exports.setDate = setDate;
exports.setDatetime = setDatetime;
exports.setDecimal = setDecimal;
exports.setGroupDefaultAccess = setGroupDefaultAccess;
exports.setGroupResourceAccess = setGroupResourceAccess;
exports.setInteger = setInteger;
exports.setIri = setIri;
exports.setLiteral = setLiteral;
exports.setNamedNode = setNamedNode;
exports.setProfileJwks = setProfileJwks;
exports.setPublicDefaultAccess = setPublicDefaultAccess;
exports.setPublicResourceAccess = setPublicResourceAccess$1;
exports.setStringNoLocale = setStringNoLocale;
exports.setStringWithLocale = setStringWithLocale;
exports.setTerm = setTerm;
exports.setThing = setThing;
exports.setTime = setTime;
exports.setUrl = setUrl;
exports.solidDatasetAsMarkdown = solidDatasetAsMarkdown;
exports.solidDatasetAsTurtle = solidDatasetAsTurtle;
exports.thingAsMarkdown = thingAsMarkdown;
exports.toRdfJsDataset = toRdfJsDataset;
exports.universalAccess = index;
exports.validateContainedResourceAll = validateContainedResourceAll;
//# sourceMappingURL=index.js.map
