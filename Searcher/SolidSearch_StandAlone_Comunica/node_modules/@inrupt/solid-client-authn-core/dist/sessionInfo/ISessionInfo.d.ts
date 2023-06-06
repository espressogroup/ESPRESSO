export interface ISessionInfo {
    isLoggedIn: boolean;
    webId?: string;
    clientAppId?: string;
    sessionId: string;
    expirationDate?: number;
}
export interface ISessionInternalInfo {
    refreshToken?: string;
    issuer?: string;
    redirectUrl?: string;
    clientAppSecret?: string;
    tokenType?: "DPoP" | "Bearer";
}
export declare function isSupportedTokenType(token: string | "DPoP" | "Bearer"): token is "DPoP" | "Bearer";
