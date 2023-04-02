import { SolidNodeClient } from 'solid-node-client';
import fetch from "node-fetch";
import { createDpopHeader, generateDpopKeyPair } from '@inrupt/solid-client-authn-core';

export class PodClient {
    constructor(ldp, email, password) {
        this.email = email;
        this.password = password;
        this.tokenUrl = `${ldp}/.oidc/token`;
        this.credentialsUrl = `${ldp}/idp/credentials/`;
    }

    async getAccessToken() {
        const response = await fetch(this.credentialsUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: this.email, password: this.password, name: 'ragab-token' }),
        });

        const { id, secret } = await response.json();
        const dpopKey = await generateDpopKeyPair();
        const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;

        const response1 = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
                'content-type': 'application/x-www-form-urlencoded',
                dpop: await createDpopHeader(this.tokenUrl, 'POST', dpopKey),
            },
            body: 'grant_type=client_credentials&scope=webid',
        });

        const { access_token: accessToken } = await response1.json();

        return { dpopKey, accessToken };
    }
}
