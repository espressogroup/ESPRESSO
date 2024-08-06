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

export { SolidClientError, hasChangelog, hasResourceInfo, hasServerResourceInfo };
