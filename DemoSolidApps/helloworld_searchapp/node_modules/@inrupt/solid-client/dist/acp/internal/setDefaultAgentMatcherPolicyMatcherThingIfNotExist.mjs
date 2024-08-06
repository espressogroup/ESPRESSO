import 'jsonld-streaming-parser';
import 'jsonld-context-parser';
import 'http-link-header';
import 'n3';
import { getThing, createThing } from '../../thing/thing.mjs';
import { getIriAll } from '../../thing/get.mjs';
import { buildThing } from '../../thing/build.mjs';
import { ACP } from '../constants.mjs';
import { internal_getAcr } from '../control.internal.mjs';
import { setAccessControlResourceThing } from './setAccessControlResourceThing.mjs';
import { getDefaultAgentMatcherPolicyUrl } from './getDefaultAgentMatcherPolicyUrl.mjs';
import { setDefaultAgentMatcherPolicyThingIfNotExist } from './setDefaultAgentMatcherPolicyThingIfNotExist.mjs';
import { getDefaultAgentMatcherPolicyMatcherUrl } from './getDefaultAgentMatcherPolicyMatcherUrl.mjs';
import { setModes } from './setModes.mjs';

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

export { DEFAULT_POLICY_MATCHER_PREDICATE, setDefaultAgentMatcherPolicyMatcherThingIfNotExist };
