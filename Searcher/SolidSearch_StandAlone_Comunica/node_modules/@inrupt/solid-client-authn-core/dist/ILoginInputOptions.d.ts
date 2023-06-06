export default interface ILoginInputOptions {
    oidcIssuer?: string;
    redirectUrl?: string;
    clientId?: string;
    clientSecret?: string;
    clientName?: string;
    handleRedirect?: (redirectUrl: string) => unknown;
    tokenType?: "DPoP" | "Bearer";
    refreshToken?: string;
}
