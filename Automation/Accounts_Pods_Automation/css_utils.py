from uuid import uuid4

import requests


class CssAcount:
    def __init__(
        self,
        css_base_url: str,
        name: str,
        email: str,
        password: str,
        web_id: str,
        pod_base_url: str,
    ) -> None:
        self.css_base_url = css_base_url
        self.name = name
        self.email = email
        self.password = password
        self.web_id = web_id
        self.pod_base_url = pod_base_url


class ClientCredentials:
    def __init__(self, client_id: str, client_secret: str) -> None:
        self.client_id = client_id
        self.client_secret = client_secret


def create_css_account(
    css_base_url: str, name: str, email: str, password: str
) -> CssAcount:
    register_endpoint = f"{css_base_url}/idp/register/"

    res = requests.post(
        register_endpoint,
        json={
            "createWebId": "on",
            "webId": "",
            "register": "on",
            "createPod": "on",
            "podName": name,
            "email": email,
            "password": password,
            "confirmPassword": password,
        },
        timeout=5000,
    )

    if not res.ok:
        raise Exception(f"Could not create account: {res.status_code} {res.text}")

    data = res.json()
    account = CssAcount(
        css_base_url=css_base_url,
        name=name,
        email=email,
        password=password,
        web_id=data["webId"],
        pod_base_url=data["podBaseUrl"],
    )
    return account


def get_client_credentials(account: CssAcount) -> ClientCredentials:
    credentials_endpoint = f"{account.css_base_url}/idp/credentials/"

    res = requests.post(
        credentials_endpoint,
        json={
            "name": "test-client-credentials",
            "email": account.email,
            "password": account.password,
        },
        timeout=5000,
    )

    if not res.ok:
        raise Exception(
            f"Could not create client credentials: {res.status_code} {res.text}"
        )

    data = res.json()
    return ClientCredentials(client_id=data["id"], client_secret=data["secret"])


def given_random_account(css_base_url: str) -> CssAcount:
    name = f"test-{uuid4()}"
    email = f"{name}@example.org"
    password = "12345"

    return create_css_account(
        css_base_url=css_base_url, name=name, email=email, password=password
    )