import datetime
import math
from typing import Optional
from uuid import uuid4

import jwt
import requests
from jwcrypto import jwk

#from solid_client_credentials.access_token import AccessToken

SIGNING_ALG = "ES256"


def generate_dpop_key_pair() -> jwk.JWK:
    key = jwk.JWK.generate(kty="EC", crv="P-256")
    return key


def refresh_access_token(
    token_endpoint: str,
    current_token: AccessToken | None,
    client_id: str,
    client_secret: str,
    dpop_key: jwk.JWK,
    refresh_before_expiration_seconds: int,
) -> AccessToken:
    if current_token is None or current_token.expires_within(
        refresh_before_expiration_seconds
    ):
        return request_access_token(token_endpoint, client_id, client_secret, dpop_key)
    return current_token


def request_access_token(
    token_endpoint: str, client_id: str, client_secret: str, dpop_key: jwk.JWK
) -> AccessToken:
    res = requests.post(
        token_endpoint,
        auth=(client_id, client_secret),
        headers={
            "DPoP": create_dpop_header(token_endpoint, "POST", dpop_key),
        },
        data={"grant_type": "client_credentials", "scope": "webid"},
        timeout=5000,
    )
    access_token = res.json()["access_token"]
    token_payload = jwt_decode_without_verification(access_token)
    expiration = datetime.datetime.fromtimestamp(token_payload["exp"])

    return AccessToken(access_token, expiration=expiration)


def create_dpop_header(url: str, method: str, key: jwk.JWK) -> str:
    payload = {
        "htu": url,
        "htm": method.upper(),
        "jti": str(uuid4()),
        "iat": math.floor(datetime.datetime.now(tz=datetime.timezone.utc).timestamp()),
    }
    headers = {
        "typ": "dpop+jwt",
        "jwk": key.export_public(as_dict=True),
    }
    token = jwt_encode(payload, key, headers=headers)
    return token


def jwt_encode(payload: dict, key: jwk.JWK, headers: Optional[dict]) -> str:
    headers = headers or {}
    key_pem = key.export_to_pem(private_key=True, password=None).decode("utf-8")
    encoded_jwt = jwt.encode(
        payload, key=key_pem, algorithm=SIGNING_ALG, headers=headers
    )
    return encoded_jwt


def jwt_decode_without_verification(encoded_jwt: str) -> dict:
    return jwt.api_jwt.decode_complete(
        encoded_jwt,
        options={
            "verify_signature": False,
        },
    )["payload"]
