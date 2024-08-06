import type { IriString, SolidDataset, UrlString, WithResourceInfo, WithServerResourceInfo } from "../interfaces";
import type { Access, AclDataset, WithAccessibleAcl } from "./acl";
export declare function addMockAclRuleQuads(aclDataset: SolidDataset & WithResourceInfo, agent: IriString, resource: IriString, access: Access, type: "resource" | "default" | "legacyDefault", ruleIri?: IriString, targetType?: "http://www.w3.org/ns/auth/acl#agent" | "http://www.w3.org/ns/auth/acl#agentGroup" | "http://www.w3.org/ns/auth/acl#agentClass" | "http://www.w3.org/ns/auth/acl#origin"): AclDataset;
export declare function setMockAclUrl<T extends WithServerResourceInfo>(resource: T, aclUrl: UrlString): T & WithAccessibleAcl;
