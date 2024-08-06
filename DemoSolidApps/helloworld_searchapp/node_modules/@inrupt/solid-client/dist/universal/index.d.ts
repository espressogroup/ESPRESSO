/**
 * :::{admonition} Experimental API
 * :class: important
 *
 * This API is still experimental, and subject to change. It builds on top of
 * both ACP and WAC, aiming at being adaptable to any Access Control system that
 * may be implemented in Solid. That is why it is purely Resource-centric: the
 * library discovers metadata associated with the Resource itself, and calls the
 * appropriate underlying API to deal with the Access Control in place for the
 * target Resource.
 *
 * As it is still under development, the following export is *only* intended for
 * experimentation by early adopters, and is not recommended for production
 * applications.
 *
 * For more information see: [Tutorial: Managing
 * Access](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/manage-access/)
 * :::
 *
 * This module can be imported as an object from the main package, which results
 * in tree-shaking not being supported (so all the exported APIs will likely end
 * up in your bundle). This import style is used for environments such as nextjs
 * or create-react-app.
 *
 * ```typescript
 * import { universalAccess } from "@inrupt/solid-client";
 * ```
 *
 * Alternatively, if your environment supports [export
 * maps](https://nodejs.org/dist/latest-v16.x/docs/api/packages.html#exports),
 * then you can import directly:
 *
 * ```typescript
 * import * as universalAccess from "@inrupt/solid-client/universal";
 * ```
 *
 * If you're using Typescript, and receive errors about type definitions not
 * being found, please see this
 * [documentation](https://www.typescriptlang.org/docs/handbook/esm-node.html)
 *
 * @packageDocumentation
 * @module universalAccess
 */
export { getAclServerResourceInfo } from "./getAclServerResourceInfo";
export { getAgentAccess } from "./getAgentAccess";
export { getAgentAccessAll } from "./getAgentAccessAll";
export { getPublicAccess } from "./getPublicAccess";
export { setAgentAccess } from "./setAgentAccess";
export { setPublicAccess } from "./setPublicAccess";
