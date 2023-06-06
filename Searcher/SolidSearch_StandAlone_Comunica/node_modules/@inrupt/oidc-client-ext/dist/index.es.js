import { OidcClient, WebStorageStateStore } from '@inrupt/oidc-client';
export { CordovaIFrameNavigator, CordovaPopupNavigator, InMemoryWebStorage, Log, OidcClient, SessionMonitor, User, UserManager, Version, WebStorageStateStore } from '@inrupt/oidc-client';
import { determineSigningAlg, PREFERRED_SIGNING_ALG, getWebidFromTokenPayload, OidcProviderError, InvalidResponseError, generateDpopKeyPair, createDpopHeader, DEFAULT_SCOPES } from '@inrupt/solid-client-authn-core';
import { fetch as fetch$1 } from '@inrupt/universal-fetch';

function processErrorResponse(responseBody, options) {
    var _a, _b, _c, _d;
    if (responseBody.error === "invalid_redirect_uri") {
        throw new Error(`Dynamic client registration failed: the provided redirect uri [${(_a = options.redirectUrl) === null || _a === void 0 ? void 0 : _a.toString()}] is invalid - ${(_b = responseBody.error_description) !== null && _b !== void 0 ? _b : ""}`);
    }
    if (responseBody.error === "invalid_client_metadata") {
        throw new Error(`Dynamic client registration failed: the provided client metadata ${JSON.stringify(options)} is invalid - ${(_c = responseBody.error_description) !== null && _c !== void 0 ? _c : ""}`);
    }
    throw new Error(`Dynamic client registration failed: ${responseBody.error} - ${(_d = responseBody.error_description) !== null && _d !== void 0 ? _d : ""}`);
}
function validateRegistrationResponse(responseBody, options) {
    if (responseBody.client_id === undefined) {
        throw new Error(`Dynamic client registration failed: no client_id has been found on ${JSON.stringify(responseBody)}`);
    }
    if (options.redirectUrl &&
        (responseBody.redirect_uris === undefined ||
            responseBody.redirect_uris[0] !== options.redirectUrl.toString())) {
        throw new Error(`Dynamic client registration failed: the returned redirect URIs ${JSON.stringify(responseBody.redirect_uris)} don't match the provided ${JSON.stringify([
            options.redirectUrl.toString(),
        ])}`);
    }
}
async function registerClient(options, issuerConfig) {
    var _a;
    if (!issuerConfig.registrationEndpoint) {
        throw new Error("Dynamic Registration could not be completed because the issuer has no registration endpoint.");
    }
    if (!Array.isArray(issuerConfig.idTokenSigningAlgValuesSupported)) {
        throw new Error("The OIDC issuer discovery profile is missing the 'id_token_signing_alg_values_supported' value, which is mandatory.");
    }
    const signingAlg = determineSigningAlg(issuerConfig.idTokenSigningAlgValuesSupported, PREFERRED_SIGNING_ALG);
    const config = {
        client_name: options.clientName,
        application_type: "web",
        redirect_uris: [(_a = options.redirectUrl) === null || _a === void 0 ? void 0 : _a.toString()],
        subject_type: "public",
        token_endpoint_auth_method: "client_secret_basic",
        id_token_signed_response_alg: signingAlg,
        grant_types: ["authorization_code", "refresh_token"],
    };
    const headers = {
        "Content-Type": "application/json",
    };
    const registerResponse = await fetch(issuerConfig.registrationEndpoint.toString(), {
        method: "POST",
        headers,
        body: JSON.stringify(config),
    });
    if (registerResponse.ok) {
        const responseBody = await registerResponse.json();
        validateRegistrationResponse(responseBody, options);
        return {
            clientId: responseBody.client_id,
            clientSecret: responseBody.client_secret,
            idTokenSignedResponseAlg: responseBody.id_token_signed_response_alg,
            clientType: "dynamic",
        };
    }
    if (registerResponse.status === 400) {
        processErrorResponse(await registerResponse.json(), options);
    }
    throw new Error(`Dynamic client registration failed: the server returned ${registerResponse.status} ${registerResponse.statusText} - ${await registerResponse.text()}`);
}

function hasError(value) {
    return value.error !== undefined && typeof value.error === "string";
}
function hasErrorDescription(value) {
    return (value.error_description !== undefined &&
        typeof value.error_description === "string");
}
function hasErrorUri(value) {
    return value.error_uri !== undefined && typeof value.error_uri === "string";
}
function hasAccessToken(value) {
    return (value.access_token !== undefined && typeof value.access_token === "string");
}
function hasIdToken(value) {
    return value.id_token !== undefined && typeof value.id_token === "string";
}
function hasRefreshToken(value) {
    return (value.refresh_token !== undefined && typeof value.refresh_token === "string");
}
function hasTokenType(value) {
    return value.token_type !== undefined && typeof value.token_type === "string";
}
function hasExpiresIn(value) {
    return value.expires_in === undefined || typeof value.expires_in === "number";
}
function validatePreconditions(issuer, data) {
    if (data.grantType &&
        (!issuer.grantTypesSupported ||
            !issuer.grantTypesSupported.includes(data.grantType))) {
        throw new Error(`The issuer [${issuer.issuer}] does not support the [${data.grantType}] grant`);
    }
    if (!issuer.tokenEndpoint) {
        throw new Error(`This issuer [${issuer.issuer}] does not have a token endpoint`);
    }
}
function validateTokenEndpointResponse(tokenResponse, dpop) {
    if (hasError(tokenResponse)) {
        throw new OidcProviderError(`Token endpoint returned error [${tokenResponse.error}]${hasErrorDescription(tokenResponse)
            ? `: ${tokenResponse.error_description}`
            : ""}${hasErrorUri(tokenResponse) ? ` (see ${tokenResponse.error_uri})` : ""}`, tokenResponse.error, hasErrorDescription(tokenResponse)
            ? tokenResponse.error_description
            : undefined);
    }
    if (!hasAccessToken(tokenResponse)) {
        throw new InvalidResponseError(["access_token"]);
    }
    if (!hasIdToken(tokenResponse)) {
        throw new InvalidResponseError(["id_token"]);
    }
    if (!hasTokenType(tokenResponse)) {
        throw new InvalidResponseError(["token_type"]);
    }
    if (!hasExpiresIn(tokenResponse)) {
        throw new InvalidResponseError(["expires_in"]);
    }
    if (!dpop && tokenResponse.token_type.toLowerCase() !== "bearer") {
        throw new Error(`Invalid token endpoint response: requested a [Bearer] token, but got a 'token_type' value of [${tokenResponse.token_type}].`);
    }
    return tokenResponse;
}
async function getTokens(issuer, client, data, dpop) {
    validatePreconditions(issuer, data);
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let dpopKey;
    if (dpop) {
        dpopKey = await generateDpopKeyPair();
        headers.DPoP = await createDpopHeader(issuer.tokenEndpoint, "POST", dpopKey);
    }
    if (client.clientSecret) {
        headers.Authorization = `Basic ${btoa(`${client.clientId}:${client.clientSecret}`)}`;
    }
    const requestBody = {
        grant_type: data.grantType,
        redirect_uri: data.redirectUrl,
        code: data.code,
        code_verifier: data.codeVerifier,
        client_id: client.clientId,
    };
    const tokenRequestInit = {
        method: "POST",
        headers,
        body: new URLSearchParams(requestBody).toString(),
    };
    const rawTokenResponse = await fetch$1(issuer.tokenEndpoint, tokenRequestInit);
    const jsonTokenResponse = (await rawTokenResponse.json());
    const tokenResponse = validateTokenEndpointResponse(jsonTokenResponse, dpop);
    const webId = await getWebidFromTokenPayload(tokenResponse.id_token, issuer.jwksUri, issuer.issuer, client.clientId);
    return {
        accessToken: tokenResponse.access_token,
        idToken: tokenResponse.id_token,
        refreshToken: hasRefreshToken(tokenResponse)
            ? tokenResponse.refresh_token
            : undefined,
        webId,
        dpopKey,
        expiresIn: tokenResponse.expires_in,
    };
}
async function getBearerToken(redirectUrl) {
    let signinResponse;
    try {
        const client = new OidcClient({
            response_mode: "query",
            loadUserInfo: false,
        });
        signinResponse = await client.processSigninResponse(redirectUrl);
        if (client.settings.metadata === undefined) {
            throw new Error("Cannot retrieve issuer metadata from client information in storage.");
        }
        if (client.settings.metadata.jwks_uri === undefined) {
            throw new Error("Missing some issuer metadata from client information in storage: 'jwks_uri' is undefined");
        }
        if (client.settings.metadata.issuer === undefined) {
            throw new Error("Missing some issuer metadata from client information in storage: 'issuer' is undefined");
        }
        if (client.settings.client_id === undefined) {
            throw new Error("Missing some client information in storage: 'client_id' is undefined");
        }
        const webId = await getWebidFromTokenPayload(signinResponse.id_token, client.settings.metadata.jwks_uri, client.settings.metadata.issuer, client.settings.client_id);
        return {
            accessToken: signinResponse.access_token,
            idToken: signinResponse.id_token,
            webId,
            refreshToken: signinResponse.refresh_token,
        };
    }
    catch (err) {
        throw new Error(`Problem handling Auth Code Grant (Flow) redirect - URL [${redirectUrl}]: ${err}`);
    }
}
async function getDpopToken(issuer, client, data) {
    return getTokens(issuer, client, data, true);
}

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
};
async function refresh(refreshToken, issuer, client, dpopKey) {
    if (client.clientId === undefined) {
        throw new Error("No client ID available when trying to refresh the access token.");
    }
    const requestBody = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: DEFAULT_SCOPES,
    };
    let dpopHeader = {};
    if (dpopKey !== undefined) {
        dpopHeader = {
            DPoP: await createDpopHeader(issuer.tokenEndpoint, "POST", dpopKey),
        };
    }
    let authHeader = {};
    if (client.clientSecret !== undefined) {
        authHeader = {
            Authorization: `Basic ${btoa(`${client.clientId}:${client.clientSecret}`)}`,
        };
    }
    else if (isValidUrl(client.clientId)) {
        requestBody.client_id = client.clientId;
    }
    const rawResponse = await fetch$1(issuer.tokenEndpoint, {
        method: "POST",
        body: new URLSearchParams(requestBody).toString(),
        headers: {
            ...dpopHeader,
            ...authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    let response;
    try {
        response = await rawResponse.json();
    }
    catch (e) {
        throw new Error(`The token endpoint of issuer ${issuer.issuer} returned a malformed response.`);
    }
    const validatedResponse = validateTokenEndpointResponse(response, dpopKey !== undefined);
    const webId = await getWebidFromTokenPayload(validatedResponse.id_token, issuer.jwksUri, issuer.issuer, client.clientId);
    return {
        accessToken: validatedResponse.access_token,
        idToken: validatedResponse.id_token,
        refreshToken: typeof validatedResponse.refresh_token === "string"
            ? validatedResponse.refresh_token
            : undefined,
        webId,
        dpopKey,
        expiresIn: validatedResponse.expires_in,
    };
}

function removeOidcQueryParam(redirectUrl) {
    const cleanedUrl = new URL(redirectUrl);
    cleanedUrl.searchParams.delete("code");
    cleanedUrl.searchParams.delete("state");
    cleanedUrl.hash = "";
    if (redirectUrl.includes(`${cleanedUrl.origin}/`)) {
        return cleanedUrl.href;
    }
    return `${cleanedUrl.origin}${cleanedUrl.href.substring(cleanedUrl.origin.length + 1)}`;
}
async function clearOidcPersistentStorage() {
    const client = new OidcClient({
        response_mode: "query",
    });
    await client.clearStaleState(new WebStorageStateStore({}));
    const myStorage = window.localStorage;
    const itemsToRemove = [];
    for (let i = 0; i <= myStorage.length; i += 1) {
        const key = myStorage.key(i);
        if (key &&
            (key.match(/^oidc\..+$/) ||
                key.match(/^solidClientAuthenticationUser:.+$/))) {
            itemsToRemove.push(key);
        }
    }
    itemsToRemove.forEach((key) => myStorage.removeItem(key));
}

export { clearOidcPersistentStorage, getBearerToken, getDpopToken, refresh, registerClient, removeOidcQueryParam };
