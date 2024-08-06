import type { IriString, WithChangeLog, WithServerResourceInfo } from "../interfaces";
import type { Access, AclDataset, AclRule, WithAcl, WithFallbackAcl, WithResourceAcl } from "./acl";
/**
 * Given the path to a Resource, get the URL of the Container one level up in the hierarchy.
 * @param resourcePath The path of the Resource of which we need to determine the Container's path.
 * @hidden For internal use only.
 */
export declare function internal_getContainerPath(resourcePath: string): string;
/**
 * Initialises a new ACL Rule that grants some access - but does not yet specify to whom.
 *
 * @hidden This is an internal utility function that should not be used directly by downstreams.
 * @param access Access mode that this Rule will grant
 */
export declare function internal_initialiseAclRule(access: Access): AclRule;
/**
 * Creates a new ACL Rule with the same ACL values as the input ACL Rule, but having a different IRI.
 *
 * Note that non-ACL values will not be copied over.
 *
 * @hidden This is an internal utility function that should not be used directly by downstreams.
 * @param sourceRule ACL rule to duplicate.
 */
export declare function internal_duplicateAclRule(sourceRule: AclRule): AclRule;
/**
 * Attach an ACL dataset to a Resource.
 *
 * @hidden This is an internal utility function that should not be used directly by downstreams.
 * @param resource The Resource to which an ACL is being attached
 * @param acl The ACL being attached to the Resource
 */
export declare function internal_setAcl<ResourceExt extends WithServerResourceInfo>(resource: ResourceExt, acl: WithResourceAcl["internal_acl"]): ResourceExt & WithResourceAcl;
export declare function internal_setAcl<ResourceExt extends WithServerResourceInfo>(resource: ResourceExt, acl: WithFallbackAcl["internal_acl"]): ResourceExt & WithFallbackAcl;
export declare function internal_setAcl<ResourceExt extends WithServerResourceInfo>(resource: ResourceExt, acl: WithAcl["internal_acl"]): ResourceExt & WithAcl;
declare const supportedActorPredicates: ("http://www.w3.org/ns/auth/acl#agent" | "http://www.w3.org/ns/auth/acl#agentGroup" | "http://www.w3.org/ns/auth/acl#agentClass" | "http://www.w3.org/ns/auth/acl#origin")[];
/**
 * Union type of all relations defined in `knownActorRelations`.
 *
 * When the ACP spec evolves to support additional relations of Rules to Actors,
 * adding those relations to `knownActorRelations` will cause TypeScript to warn
 * us everywhere to update everywhere the ActorRelation type is used and that
 * needs additional work to handle it.
 */
type SupportedActorPredicate = typeof supportedActorPredicates extends Array<infer E> ? E : never;
/**
 * ```{note}
 * This function is still experimental and subject to change, even in a non-major release.
 * ```
 * Modifies the resource ACL (Access Control List) to set the Access Modes for the given Agent.
 * Specifically, the function returns a new resource ACL initialised with the given ACL and
 * new rules for the Actor's access.
 *
 * If rules for Actor's access already exist in the given ACL, in the returned ACL,
 * they are replaced by the new rules.
 *
 * This function does not modify:
 *
 * - Access Modes granted indirectly to Actors through other ACL rules, e.g., public or group-specific permissions.
 * - Access Modes granted to Actors for the child Resources if the associated Resource is a Container.
 * - The original ACL.
 *
 * @param aclDataset The SolidDataset that contains Access-Control List rules.
 * @param actor The Actor to grant specific Access Modes.
 * @param access The Access Modes to grant to the Actor for the Resource.
 * @returns A new resource ACL initialised with the given `aclDataset` and `access` for the `agent`.
 */
export declare function internal_setActorAccess(aclDataset: AclDataset, access: Access, actorPredicate: SupportedActorPredicate, accessType: "default" | "resource", actor: IriString): AclDataset & WithChangeLog;
export declare function internal_setResourceAcl<T extends WithServerResourceInfo & WithAcl>(resource: T, acl: AclDataset): T & WithResourceAcl;
export declare function internal_getResourceAcl(resource: WithServerResourceInfo & WithResourceAcl): AclDataset;
export {};
