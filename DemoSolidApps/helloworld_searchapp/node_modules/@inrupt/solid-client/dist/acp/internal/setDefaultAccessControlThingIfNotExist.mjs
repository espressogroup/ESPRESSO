import 'jsonld-streaming-parser';
import 'jsonld-context-parser';
import { getSourceUrl } from '../../resource/resource.mjs';
import 'n3';
import 'http-link-header';
import { createThing } from '../../thing/thing.mjs';
import { getIriAll } from '../../thing/get.mjs';
import { buildThing } from '../../thing/build.mjs';
import { ACP } from '../constants.mjs';
import { getAccessControlResourceThing } from './getAccessControlResourceThing.mjs';
import { internal_getAcr } from '../control.internal.mjs';
import { setAccessControlResourceThing } from './setAccessControlResourceThing.mjs';
import { getDefaultAccessControlUrl } from './getDefaultAccessControlUrl.mjs';

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

export { setDefaultAccessControlThingIfNotExist };
