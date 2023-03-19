from solid.solid_api import SolidAPI
from solid_client_credentials import SolidClientCredentialsAuth, DpopTokenProvider
import requests
import os

from solid.auth import Auth

def putdirCSS (directory,pod,IDP,USERNAME,PASSWORD):
    client_id = USERNAME
    client_secret = PASSWORD

    # The server that provides your account (where you login)
    issuer_url = IDP

    # create a token provider
    token_provider = DpopTokenProvider(
       issuer_url=issuer_url,
       client_id=client_id,
       client_secret=client_secret
    )
    # use the tokens with the requests library
    auth = SolidClientCredentialsAuth(token_provider)

    
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f) and filename[0]!='.':
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            file.close()
            file_url=pod+filename
            print('putting '+filename+' to the pod '+ pod)
            res = requests.post(file_url, filetext, auth=auth)
            #api.put_file(file_url, filetext, 'text/markdown')
    return pod
    


def postdirtopod (directory,pod,api):
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f) and filename[0]!='.':
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            file.close()
            file_url=pod+filename
            print('putting '+filename+' to the pod '+ pod)
            api.put_file(file_url, filetext, 'text/markdown')
    return pod


def postdir (directory,pod,IDP,USERNAME,PASSWORD):
    auth = Auth()
    assert not auth.is_login
    auth.login(IDP, USERNAME, PASSWORD)
    assert auth.is_login

    api = SolidAPI(auth)
    postdirtopod(directory,pod,api)
