import * as index$1 from './formats/index.mjs';
export { FetchError, getContentType, getEffectiveAccess, getLinkedResourceUrlAll, getPodOwner, getResourceInfo, getSourceIri, getSourceUrl, isContainer, isPodOwner, isRawData, responseToResourceInfo } from './resource/resource.mjs';
export { deleteFile, getFile, overwriteFile, saveFileInContainer } from './resource/file.mjs';
export { changeLogAsMarkdown, createContainerAt, createContainerInContainer, createSolidDataset, deleteContainer, deleteSolidDataset, getContainedResourceUrlAll, getSolidDataset, getWellKnownSolid, responseToSolidDataset, saveSolidDatasetAt, saveSolidDatasetInContainer, solidDatasetAsMarkdown, validateContainedResourceAll } from './resource/solidDataset.mjs';
export { mockContainerFrom, mockFetchError, mockFileFrom, mockSolidDatasetFrom } from './resource/mock.mjs';
export { ThingExpectedError, asIri, asUrl, createThing, getThing, getThingAll, isThing, isThingLocal, removeThing, setThing, thingAsMarkdown } from './thing/thing.mjs';
export { getBoolean, getBooleanAll, getDate, getDateAll, getDatetime, getDatetimeAll, getDecimal, getDecimalAll, getInteger, getIntegerAll, getIri, getIriAll, getLiteral, getLiteralAll, getNamedNode, getNamedNodeAll, getPropertyAll, getStringByLocaleAll, getStringEnglish, getStringEnglishAll, getStringNoLocale, getStringNoLocaleAll, getStringWithLocale, getStringWithLocaleAll, getTerm, getTermAll, getTime, getTimeAll, getUrl, getUrlAll } from './thing/get.mjs';
export { addBoolean, addDate, addDatetime, addDecimal, addInteger, addIri, addLiteral, addNamedNode, addStringEnglish, addStringNoLocale, addStringWithLocale, addTerm, addTime, addUrl } from './thing/add.mjs';
export { setBoolean, setDate, setDatetime, setDecimal, setInteger, setIri, setLiteral, setNamedNode, setStringNoLocale, setStringWithLocale, setTerm, setTime, setUrl } from './thing/set.mjs';
export { removeAll, removeBoolean, removeDate, removeDatetime, removeDecimal, removeInteger, removeIri, removeLiteral, removeNamedNode, removeStringEnglish, removeStringNoLocale, removeStringWithLocale, removeTime, removeUrl } from './thing/remove.mjs';
export { buildThing } from './thing/build.mjs';
export { mockThingFrom } from './thing/mock.mjs';
export { createAcl, createAclFromFallbackAcl, deleteAclFor, getFallbackAcl, getFileWithAcl, getResourceAcl, getResourceInfoWithAcl, getSolidDatasetWithAcl, hasAccessibleAcl, hasAcl, hasFallbackAcl, hasResourceAcl, saveAclFor } from './acl/acl.mjs';
export { getAgentAccess, getAgentAccessAll, getAgentDefaultAccess, getAgentDefaultAccessAll, getAgentResourceAccess, getAgentResourceAccessAll, setAgentDefaultAccess, setAgentResourceAccess } from './acl/agent.mjs';
export { getGroupAccess, getGroupAccessAll, getGroupDefaultAccess, getGroupDefaultAccessAll, getGroupResourceAccess, getGroupResourceAccessAll, setGroupDefaultAccess, setGroupResourceAccess } from './acl/group.mjs';
export { getPublicAccess, getPublicDefaultAccess, getPublicResourceAccess, setPublicDefaultAccess, setPublicResourceAccess } from './acl/class.mjs';
export { addMockFallbackAclTo, addMockResourceAclTo } from './acl/mock.mjs';
export { SolidClientError, hasResourceInfo, hasServerResourceInfo } from './interfaces.mjs';
export { fromRdfJsDataset, toRdfJsDataset } from './rdfjs.mjs';
export { addJwkToJwks, addPublicKeyToProfileJwks, getProfileJwksIri, setProfileJwks } from './profile/jwks.mjs';
export { getAltProfileUrlAllFrom, getPodUrlAll, getPodUrlAllFrom, getProfileAll, getWebIdDataset } from './profile/webid.mjs';
import * as index from './universal/index.mjs';
export { index as universalAccess };
import * as ess2 from './acp/ess2.mjs';
export { ess2 as acp_ess_2 };

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
const { getJsonLdParser, getTurtleParser, solidDatasetAsTurtle } = index$1;

export { getJsonLdParser, getTurtleParser, solidDatasetAsTurtle };
