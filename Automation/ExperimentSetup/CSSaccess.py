import dpop_utils
import json, requests, urllib.parse, base64


class CSSaccess:
    """
    Provides access to a CSS solid server.
    """
    def __init__(self, IDP,USERNAME,PASSWORD):
        self.idp = IDP
        self.username = USERNAME
        self.password = PASSWORD
        self.cred_url = IDP+'idp/credentials/'
        self.token_url = IDP+'.oidc/token'
        self.authstring =''
        self.authtoken = ''
        self.dpopKey = dpop_utils.generate_dpop_key_pair()
        
    def __repr__(self):
        """
        Return IDP. Can be changed later
        """
        return str(self.idp)
    
    def create_authstring(self):
        #issuer_url = IDP
        # create a token 
        #auth = (client_id,client_secret)
        #headers= {'content-type': 'text/plain'}
        #self.delete_all_tokens()
        data ={ 'email': self.username, 'password': self.password, 'name': 'my-token' }
        datajson=json.dumps(data)
        res = requests.post(self.cred_url, headers={ 'content-type': 'application/json' }, data=str(datajson))
        res=res.json()
        self.authstring=urllib.parse.quote(res['id'])+':'+urllib.parse.quote(res['secret'])
        return self.authstring

    def get_token_list(self):
        data ={ 'email': self.username, 'password': self.password}
        datajson=json.dumps(data)
        res = requests.post(self.cred_url,headers={ 'content-type': 'application/json' }, data=str(datajson))
        tokenlist = list(res.json())
        return tokenlist

    def delete_token(self,token):
        datat ={ 'email': self.username, 'password': self.password, 'delete':token}
        datatjson=json.dumps(datat)
        rest = requests.post(self.cred_url,headers={ 'content-type': 'application/json' }, data=str(datatjson))

    def delete_all_tokens(self):
        tokenlist = self.get_token_list()
        for t in tokenlist:
            self.delete_token(t)
    
    def create_authtoken(self):
        s=bytes(self.authstring, 'utf-8')
        auth='Basic %s' % str(base64.standard_b64encode(s))[2:]
        res = requests.post(
            self.token_url,
            headers= {
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': auth,
                'DPoP': dpop_utils.create_dpop_header(self.token_url, 'POST', self.dpopKey)
            },
            data={"grant_type":"client_credentials","scope": "webid"},
            timeout=5000
        )
        #print(res.json())
        self.authtoken =res.json()['access_token']
        return self.authtoken

    def new_session(self):
        self.delete_all_tokens()
        a=self.create_authstring()
        t=self.create_authtoken()

    def put_file(self,podname,filename,filetext,filetype):
        targetUrl=self.idp+podname+'/'+filename
        headers={ 'content-type': filetype, 'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", self.dpopKey)}
        res= requests.put(targetUrl,
            headers=headers,
            data=filetext
        )
        return res 

    def put_url(self,targetUrl,filetext,filetype):
        headers={ 'content-type': filetype, 'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", self.dpopKey)}
        res= requests.put(targetUrl,
            headers=headers,
            data=filetext
        )
        return res 
        
    def get_file(self,targetUrl):
        #targetUrl='http://localhost:3000/test1/file1.txt'
        headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", self.dpopKey)}

        res= requests.get(targetUrl,
           headers=headers
        )
        return res.text

    def delete_file(self,targetUrl):
        print('deleting ' + targetUrl)
        #curl -X DELETE http://localhost:3000/myfile.txt
        headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "DELETE", self.dpopKey)}
        res= requests.delete(targetUrl,
                headers=headers
        )
        return res

    def makefileaccessible(self,podname,filename):
        targetUrl=self.idp+podname+'/'+filename+'.acl'
        headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", self.dpopKey)}

        res= requests.get(targetUrl,
           headers=headers
        )
        if not res.ok:
            acldef='''@prefix : <#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

:ControlReadWrite
a acl:Authorization;
acl:accessTo <'''+filename+'''>;
acl:agent c:me, <mailto:ys1v22@soton.ac.uk>;
acl:agentClass foaf:Agent;
acl:mode acl:Control, acl:Read, acl:Write.'''
            #print('no acl')
            print(acldef)
            headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", self.dpopKey)}
            res= requests.put(targetUrl,
               headers=headers,
                data=acldef
            )
        else:
            headers={ "Content-Type": "application/sparql-update",'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PATCH", self.dpopKey)}
            res= requests.patch(targetUrl,
               headers=headers,
                data="INSERT DATA { <#ControlReadWrite> <acl:agentClass> <foaf:Agent> }"
            )
        return res.text
        #curl -X PATCH -H "Content-Type: application/sparql-update" \
        #-d "INSERT DATA { <ex:s2> <ex:p2> <ex:o2> }" \
        #http://localhost:3000/myfile.ttl

class CSSPod:
    def __init__(self, IDP,podname,indexname,email='',password=''):
        self.podaddress=IDP+podname
        self.idp = IDP
        self.Access=None
        self.indexname=indexname
        self.indexaddress=IDP+indexname
        self.email=email
        self.password=password

    def login(self,USERNAME,PASSWORD):
        self.Access=CSSaccess(self.idp, USERNAME, PASSWORD)

    def selflogin(self):
        self.Access=CSSaccess(self.idp, self.email, self.password)

class CSSServer:
    def __init__(self, ADDRESS):
        self.address=ADDRESS
        self.idp = ADDRESS
        self.cred_url = IDP+'idp/credentials/'
        self.token_url = IDP+'.oidc/token'



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

def get_file(targetUrl):
        #targetUrl='http://localhost:3000/test1/file1.txt'
    #headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", self.dpopKey)}
    res= requests.get(targetUrl,
           #headers=headers
    )
    return res