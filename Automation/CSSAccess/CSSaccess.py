from Automation.CSSAccess import dpop_utils
import json, requests, urllib.parse, base64
from rdflib import  Graph

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
        #print('deleting ' + targetUrl)
        #curl -X DELETE http://localhost:3000/myfile.txt
        headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "DELETE", self.dpopKey)}
        res= requests.delete(targetUrl,
                headers=headers
        )
        return res

    def adddefaultacl(self,fileaddress):
        targetUrl=fileaddress+'.acl'
        #print('Adding .acl to '+ fileaddress)
        acldef='''@prefix : <#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

:ControlReadWrite
a acl:Authorization;
acl:accessTo <'''+fileaddress+'''>;
acl:agent c:me;
acl:mode acl:Control, acl:Read, acl:Write.

:Read
a acl:Authorization;
acl:accessTo <'''+fileaddress+'''>;
acl:mode acl:Read.
'''
        #print(acldef)
        
        headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", self.dpopKey)}
        res= requests.put(targetUrl,
               headers=headers,
                data=acldef
            )
        return res

    def addreadrights(self,fileaddress,webidlist):
        targetUrl=fileaddress+'.acl'
        headers={ "Content-Type": "application/sparql-update",'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PATCH", self.dpopKey)}
        webidstring='<'+'>,<'.join(webidlist)+'>'
        data="INSERT DATA { <#Read> <acl:agent> "+webidstring+" }"
        #print(data)
        res= requests.patch(targetUrl,
               headers=headers,
                data=data
            )
        #print(res,end='\r')
        #if res.ok:
            #print('Added '+webidstring+' to '+targetUrl,end='\r')

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
acl:agent c:me;
acl:agentClass foaf:Agent;
acl:mode acl:Control, acl:Read, acl:Write.'''
            #print('no acl')
            #print(acldef)
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
        return res
        #curl -X PATCH -H "Content-Type: application/sparql-update" \
        #-d "INSERT DATA { <ex:s2> <ex:p2> <ex:o2> }" \
        #http://localhost:3000/myfile.ttl

    def makeurlaccessible(self,url,filename):
        targetUrl=url+'.acl'
        
        acldef='''@prefix : <#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

:ControlReadWrite
a acl:Authorization;
acl:accessTo <'''+filename+'''>;
acl:agent c:me;
acl:agentClass foaf:Agent;
acl:mode acl:Control, acl:Read, acl:Write.'''
            #print('no acl')
        print(acldef)
        headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", self.dpopKey)}
        res= requests.put(targetUrl,
               headers=headers,
                data=acldef
            )
        
        return res.text

    def makeurlaccessiblelist(self, url, podaddress,webid, webidlist,openbool=False):
        targetUrl=url+'.acl'
        
        acldef=returnacllist(url, podaddress, webidlist,openbool)
            #print('no acl')
        #print(acldef)
        headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", self.dpopKey)}
        res= requests.put(targetUrl,
               headers=headers,
                data=acldef
            )
        return(res)

    def inserttriple(self,url,triple):
        data = self.get_file(url)
        print(data)
        g=Graph().parse(data=data,publicID=url)
        g.add(triple)
        datafixed=g.serialize()
        print(datafixed)
        res=self.put_url(url,datafixed,'text/turtle')
        return(res)

    def inserttriplestring(self,url,triplestring):
        headers={ "Content-Type": "application/sparql-update",'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(url, "PATCH", self.dpopKey)}
        data="INSERT DATA {" + triplestring+ "}"
        res= requests.patch(url,
               headers=headers,
                data=data
            )
        return res

def get_file(targetUrl):
        #targetUrl='http://localhost:3000/test1/file1.txt'
    #headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", self.dpopKey)}
    res= requests.get(targetUrl,
           #headers=headers
    )
    return res

def podcreate(IDP,podname,email,password):
    register_endpoint=IDP+'idp/register/'
    res1 = requests.post(
                        register_endpoint,
                        json={
                            "createWebId": "on",
                            "webId": "",
                            "register": "on",
                            "createPod": "on",
                            "podName": podname,
                            "email": email,
                            "password": password,
                            "confirmPassword": password
                        },
                        timeout=5000,
                    )
    return(res1)

def returnacllist(url, podaddress, webidlist,openbool=False):
    webidstring='<'+'>,<'.join(webidlist)+'>'
    openstring=''
    if openbool: 
            openstring='acl:agentClass foaf:Agent;'
    
    
    acldef2='''@prefix : <#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <'''+podaddress+'''profile/card#>.

:ControlReadWrite
a acl:Authorization;
acl:accessTo <'''+url+'''>;
acl:agent c:me;
acl:mode acl:Control, acl:Read, acl:Write.

:Read
a acl:Authorization;
acl:accessTo <'''+url+'''>;
acl:mode acl:Read;'''+openstring+'''
acl:agent '''+webidstring+'''.'''
    
    return acldef2