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
        data ={ 'email': self.username, 'password': self.password, 'name': 'my-token' }
        datajson=json.dumps(data)
        res = requests.post(self.cred_url, headers={ 'content-type': 'application/json' }, data=str(datajson))
        res=res.json()
        self.authstring=urllib.parse.quote(res['id'])+':'+urllib.parse.quote(res['secret'])
        return self.authstring
    
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

    def put_file(self,podname,filename,filetext,filetype):
        targetUrl=self.idp+podname+'/'+filename
        headers={ 'content-type': filetype, 'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", self.dpopKey)}
        res= requests.put(targetUrl,
            headers=headers,
            data=filetext
        )
        return(res.text)
        
    def get_file(self,targetUrl):
        #targetUrl='http://localhost:3000/test1/file1.txt'
        headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", self.dpopKey)}

        res= requests.get(targetUrl,
           headers=headers
        )
        return res.text






