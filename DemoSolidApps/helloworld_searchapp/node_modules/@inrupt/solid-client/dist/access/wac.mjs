import { internal_fetchAcl, internal_setAcl, internal_getResourceAcl, internal_setResourceAcl } from '../acl/acl.internal.mjs';
import { getAgentAccess as getAgentAccess$1, getAgentAccessAll as getAgentAccessAll$1, setAgentResourceAccess as setAgentResourceAccess$1 } from '../acl/agent.mjs';
import { getResourceAcl, hasAccessibleAcl, hasResourceAcl, hasFallbackAcl, createAclFromFallbackAcl, saveAclFor } from '../acl/acl.mjs';
import { getPublicAccess as getPublicAccess$1, setPublicResourceAccess as setPublicResourceAccess$1 } from '../acl/class.mjs';

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
function getAgentAccess(resource, agent, options) {
    return getActorAccess(resource, agent, getAgentAccess$1, options);
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
function getPublicAccess(resource, options) {
    return getActorClassAccess(resource, getPublicAccess$1, options);
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
function getAgentAccessAll(resource, options) {
    return getActorAccessAll(resource, getAgentAccessAll$1, options);
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
    return setActorAccess(resource, agent, access, getAgentAccess$1, setAgentResourceAccess$1, options);
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
    return setActorClassAccess(resource, access, getPublicAccess$1, setPublicResourceAccess$1, options);
}

export { getAgentAccess, getAgentAccessAll, getPublicAccess, setAgentResourceAccess, setPublicResourceAccess };
