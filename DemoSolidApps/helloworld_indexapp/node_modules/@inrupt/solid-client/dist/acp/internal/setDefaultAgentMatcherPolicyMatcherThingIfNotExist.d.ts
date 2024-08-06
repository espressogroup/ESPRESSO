import type { WithAccessibleAcr } from "../acp";
import type { AccessModes } from "../../interfaces";
import type { DefaultAccessControlName } from "./getDefaultAccessControlUrl";
/** @hidden */
export declare const DEFAULT_POLICY_MATCHER_PREDICATE: string;
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
export declare function setDefaultAgentMatcherPolicyMatcherThingIfNotExist<T extends WithAccessibleAcr>(resource: T, name: DefaultAccessControlName, mode: keyof AccessModes): T;
