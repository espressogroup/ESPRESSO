import { hasResourceInfo, hasServerResourceInfo, SolidClientError } from '../interfaces.mjs';
import { normalizeUrl, internal_toIriString } from '../interfaces.internal.mjs';
import { internal_isUnsuccessfulResponse, internal_isAuthenticationFailureResponse, internal_parseResourceInfo } from './resource.internal.mjs';
import { acp } from '../constants.mjs';

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
function getContentType(resource) {
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

export { FetchError, getContentType, getEffectiveAccess, getLinkedResourceUrlAll, getPodOwner, getResourceInfo, getSourceIri, getSourceUrl, isContainer, isPodOwner, isRawData, responseToResourceInfo };
