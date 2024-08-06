import 'jsonld-streaming-parser';
import 'jsonld-context-parser';
import 'http-link-header';
import 'n3';
import { getThing, createThing } from '../../thing/thing.mjs';
import { getAgentAccess } from './getAgentAccess.mjs';
import { internal_getAcr } from '../control.internal.mjs';
import { setDefaultAgentMatcherPolicyMatcherThingIfNotExist } from '../internal/setDefaultAgentMatcherPolicyMatcherThingIfNotExist.mjs';
import { DEFAULT_ACCESS_CONTROL, DEFAULT_ACR_ACCESS_CONTROL } from '../internal/getDefaultAccessControlUrl.mjs';
import { getDefaultAgentMatcherPolicyMatcherUrl } from '../internal/getDefaultAgentMatcherPolicyMatcherUrl.mjs';
import { addAgent, removeAgent } from '../matcher.mjs';
import { setAccessControlResourceThing } from '../internal/setAccessControlResourceThing.mjs';

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
async function setAgentAccess(resourceWithAcr, webId, access) {
    const agentAccessModes = await getAgentAccess(resourceWithAcr, webId);
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

export { setAgentAccess };
