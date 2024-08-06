import { ACP } from '../constants.mjs';
import { buildThing } from '../../thing/build.mjs';
import { getDefaultAccessControlThing } from '../internal/getDefaultAccessControlThing.mjs';
import { DEFAULT_ACR_ACCESS_CONTROL } from '../internal/getDefaultAccessControlUrl.mjs';
import { setAccessControlResourceThing } from '../internal/setAccessControlResourceThing.mjs';
import { setDefaultAccessControlThingIfNotExist } from '../internal/setDefaultAccessControlThingIfNotExist.mjs';

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

export { addAcrPolicyUrl };
