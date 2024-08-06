import LinkHeader from 'http-link-header';

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

export { internal_cloneResource, internal_isAuthenticationFailureResponse, internal_isUnsuccessfulResponse, internal_parseResourceInfo };
