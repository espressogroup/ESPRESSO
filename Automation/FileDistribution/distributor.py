from solid.solid_api import SolidAPI
from solid_client_credentials import SolidClientCredentialsAuth, DpopTokenProvider
import dpop_utils
import requests
import os, json
import CSSaccess

from solid.auth import Auth

def putdirCSS (directory,pod,IDP,USERNAME,PASSWORD,indexfile=''):
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    t=CSSA.create_authtoken()

    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f) and filename[0]!='.' and filename != indexfile:
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            file.close()
            file_url=pod+filename
            print('putting '+filename+' to the pod '+ pod)
            CSSA.put_file(pod, filename, filetext, 'text/plain')
            #api.put_file(file_url, filetext, 'text/markdown')
    indexpath=os.path.join(directory, indexfile)
    if os.path.isfile(indexpath):
        CSSA.put_file(pod, indexfile, filetext, 'text/turtle')
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


def postdirNSS (directory,pod,IDP,USERNAME,PASSWORD):
    auth = Auth()
    assert not auth.is_login
    auth.login(IDP, USERNAME, PASSWORD)
    assert auth.is_login

    api = SolidAPI(auth)
    postdirtopod(directory,pod,api)


class Pod:
    """
    Class to work with pods.
    """
    def __init__(self, IDP,USERNAME,PASSWORD,podname):
        self.idp = IDP
        self.username = USERNAME
        self.password = PASSWORD
        self.podname=podname
        self.Access=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)

    def __repr__(self):
        """
        Return IDP. Can be changed later
        """
        return str(self.idp+self.podname)
