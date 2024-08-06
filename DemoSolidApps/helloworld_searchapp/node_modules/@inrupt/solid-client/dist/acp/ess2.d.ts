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
export { getFileWithAccessDatasets, getFileWithAcr, getLinkedAcrUrl, getReferencedPolicyUrlAll, getResourceInfoWithAccessDatasets, getResourceInfoWithAcr, getSolidDatasetWithAccessDatasets, getSolidDatasetWithAcr, hasAccessibleAcr, saveAcrFor, isAcpControlled, } from "./acp";
export { hasLinkedAcr, removeAcrPolicyUrlAll, removeMemberAcrPolicyUrlAll, removeMemberPolicyUrlAll, removePolicyUrlAll, } from "./control";
export { addAcrPolicyUrl } from "./policy/addAcrPolicyUrl";
export { addMemberAcrPolicyUrl } from "./policy/addMemberAcrPolicyUrl";
export { addMemberPolicyUrl } from "./policy/addMemberPolicyUrl";
export { addPolicyUrl } from "./policy/addPolicyUrl";
export { getAcrPolicyUrlAll } from "./policy/getAcrPolicyUrlAll";
export { getMemberAcrPolicyUrlAll } from "./policy/getMemberAcrPolicyUrlAll";
export { getMemberPolicyUrlAll } from "./policy/getMemberPolicyUrlAll";
export { getPolicyUrlAll } from "./policy/getPolicyUrlAll";
export { removeAcrPolicyUrl } from "./policy/removeAcrPolicyUrl";
export { removeMemberAcrPolicyUrl } from "./policy/removeMemberAcrPolicyUrl";
export { removeMemberPolicyUrl } from "./policy/removeMemberPolicyUrl";
export { removePolicyUrl } from "./policy/removePolicyUrl";
export { setResourcePolicy } from "./policy/setResourcePolicy";
export { createPolicy, getPolicy, getPolicyAll, removePolicy, setPolicy, createResourcePolicyFor, getResourceAcrPolicy, getResourceAcrPolicyAll, getResourcePolicy, getResourcePolicyAll, removeResourceAcrPolicy, removeResourcePolicy, getAllowModesV2 as getAllowModes, getDenyModesV2 as getDenyModes, setAllowModesV2 as setAllowModes, setDenyModesV2 as setDenyModes, } from "./policy";
export { addAgent, addNoneOfMatcherUrl, addAnyOfMatcherUrl, addAllOfMatcherUrl, createMatcher, getAgentAll, getNoneOfMatcherUrlAll, getAnyOfMatcherUrlAll, getAllOfMatcherUrlAll, getMatcher, getMatcherAll, hasAuthenticated, hasCreator, hasPublic, removeAgent, removeNoneOfMatcherUrl, removeAnyOfMatcherUrl, removeAllOfMatcherUrl, removeMatcher, setAgent, setAuthenticated, setCreator, setNoneOfMatcherUrl, setAnyOfMatcherUrl, setPublic, setAllOfMatcherUrl, setMatcher, addClient, getClientAll, removeClient, removeAuthenticated, removeCreator, removePublic, createResourceMatcherFor, getResourceMatcher, getResourceMatcherAll, removeResourceMatcher, setResourceMatcher, } from "./matcher";
export { addMockAcrTo, mockAcrFor } from "./mock";
export { getVcAccess } from "./util/getVcAccess";
export { setVcAccess } from "./util/setVcAccess";
