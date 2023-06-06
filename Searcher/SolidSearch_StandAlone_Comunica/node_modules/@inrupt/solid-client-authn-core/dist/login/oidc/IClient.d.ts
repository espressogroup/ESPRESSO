export type ClientType = "static" | "dynamic" | "solid-oidc";
export interface IClient {
    clientId: string;
    clientSecret?: string;
    clientName?: string;
    idTokenSignedResponseAlg?: string;
    clientType: ClientType;
}
