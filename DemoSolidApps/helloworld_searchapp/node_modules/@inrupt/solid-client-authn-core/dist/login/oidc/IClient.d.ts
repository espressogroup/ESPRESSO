/**
 * @hidden
 * @packageDocumentation
 */
type ISolidOidcClient = {
    clientId: string;
    clientType: "solid-oidc";
    clientSecret?: undefined;
};
type IOpenIdConfidentialClient = {
    clientId: string;
    clientSecret: string;
    clientType: "static";
};
type IOpenIdPublicClient = {
    clientId: string;
    clientSecret?: string;
    clientType: "dynamic";
};
/**
 * @hidden
 */
export type IClient = {
    clientName?: string;
    idTokenSignedResponseAlg?: string;
} & (ISolidOidcClient | IOpenIdConfidentialClient | IOpenIdPublicClient);
export {};
