import filesorter, dpop_utils, CSSaccess, brewmaster
#import rdfindex
import os, re, math, random, shutil, requests, json, base64, urllib.parse, cleantext, numpy
#from solid_client_credentials import SolidClientCredentialsAuth, DpopTokenProvider
import ssl, csv, sys
import nltk
from nltk.stem import WordNetLemmatizer
import difflib
from rdflib import URIRef, BNode, Literal, Graph, Namespace
import logging
import threading
import time
import concurrent.futures
import string
import time,pandas
import multiprocessing
from zipfile import ZipFile


def main1():
    #datasource = '/Users/yurysavateev/iweb data'
    namespace="http://example.org/SOLID/"
    #targetdir ='/Users/yurysavateev/Python/dir/server0/server0pod0'
    podname='test'
    IDP='https://solidcommunity.net'
    POD_ENDPOINT = 'https://estlladon.solidcommunity.net/'
    USERNAME = 'estlladon'
    PASSWORD = 'FmEC3wAn4Biw!p5'
    sourcedir = '../../Datasets/babydir'
    pod=POD_ENDPOINT+podname+'/'

    #rdfindex.indexer(sourcedir,podname,pod,namespace)
    distributor.postdirNSS(sourcedir,pod,IDP,USERNAME,PASSWORD)

def sortlocaltest():
    datasource = '../../Datasets/iweb data'
    targetdir ='../../Datasets/dir'
    filesorter.sort_local(datasource,targetdir,5,0,60,1)

def rezatest():
    #datasource = '/Users/yurysavateev/iweb data'
    namespace="http://example.org/SOLID/"
    #targetdir ='/Users/yurysavateev/Python/dir/server0/server0pod0'
    podname='public'
    #IDP='https://inrupt.com'
    IDP='https://rezamoosa.solidcommunity.net'
    #POD_ENDPOINT = 'https://storage.inrupt.com/271193f6-926b-45c1-8fa8-b31cc03accb4/'
    POD_ENDPOINT = 'https://rezamoosa.solidcommunity.net/'
    #USERNAME = 'rezmosa'
    USERNAME = 'rezamoosa'
    PASSWORD = 'RezaMoosa_1'
    sourcedir = '../../Datasets/babydir'
    if len(podname)==0:
        pod=POD_ENDPOINT
    else:
        pod=POD_ENDPOINT+podname+'/'

    #rdfindex.indexer(sourcedir,podname,pod,namespace)
    distributor.postdir(sourcedir,pod,IDP,USERNAME,PASSWORD)

def putdirCSStest():
    #datasource = '/Users/yurysavateev/iweb data'
    namespace="http://example.org/SOLID/"
    #targetdir ='/Users/yurysavateev/Python/dir/server0/server0pod0'
    podname=''
    #IDP='https://inrupt.com'
    IDP='http://srv03813.soton.ac.uk:3000/'
    #POD_ENDPOINT = 'https://storage.inrupt.com/271193f6-926b-45c1-8fa8-b31cc03accb4/'
    POD_ENDPOINT = 'http://srv03813.soton.ac.uk:3000/test1/'
    #USERNAME = 'rezmosa'
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    sourcedir = '../../Datasets/babydir'
    if len(podname)==0:
        pod=POD_ENDPOINT
    else:
        pod=POD_ENDPOINT+podname+'/'

    #rdfindex.indexer(sourcedir,podname,pod,namespace)
    distributor.putdirCSS(sourcedir,pod,IDP,USERNAME,PASSWORD)
    
        
def putfilelocaltest():
    client_id = 'ys1v22@soton.ac.uk'
    client_secret = '12345'

    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    issuer_url = 'http://localhost:3000/'
    # create a token provider
   # token_provider = DpopTokenProvider(
    #    issuer_url=issuer_url,
    #    client_id=client_id,
    #    client_secret=client_secret
    #)
    # use the tokens with the requests library
    #auth = SolidClientCredentialsAuth(token_provider)
    auth = (client_id,client_secret)

    #res = requests.get('http://srv03813.soton.ac.uk:3000/test1/', auth=auth)
    #print(res.text)
    headers= {'content-type': 'text/plain'}

    #('http://localhost:3000/idp/credentials/', {
    # method: 'POST',
    # headers: { 'content-type': 'application/json' },
    # // The email/password fields are those of your account.
    # // The name field will be used when generating the ID of your token.
    # body: JSON.stringify({ email: 'my-email@example.com', password: 'my-account-password', name: 'my-token' }),
    #});
    data ={ 'email': client_id, 'password': client_secret, 'name': 'my-token' }
    datajson=json.dumps(data)
    res = requests.post('http://localhost:3000/idp/credentials/', headers={ 'content-type': 'application/json' }, data=str(datajson))
    print(res.text)
    res=res.json()

    authstring=urllib.parse.quote(res['id'])+':'+urllib.parse.quote(res['secret'])
    print(authstring)
    dpopKey = dpop_utils.generate_dpop_key_pair()
    tokenUrl = 'http://localhost:3000/.oidc/token'

    #res = requests.post(
    #    tokenUrl,
    #    auth=(client_id, client_secret),
    #    headers={
    #        "DPoP": dpop_utils.create_dpop_header(tokenUrl, "POST", dpopKey),
    #    },
    #    data={"grant_type": "client_credentials", "scope": "webid"},
    #    timeout=5000,
    #)

    #access_token = res.json()["access_token"]
    #print(res.json())

    s=bytes(authstring, 'utf-8')
    #auth=f'Basic {base64.standard_b64encode(s)}'
    auth='Basic %s' % str(base64.standard_b64encode(s))[2:]
    print(auth)
    #auth = f'Basic ${Buffer.from(authString).toString('base64')}'
    res = requests.post(
        tokenUrl,
        headers= {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': auth,
            'DPoP': dpop_utils.create_dpop_header(tokenUrl, 'POST', dpopKey)
        },
        #data= 'grant_type=client_credentials&scope=webid',
        data={"grant_type":"client_credentials","scope": "webid"},
        timeout=5000
    )
    print(res.json())
    authtoken =res.json()['access_token']
   # headers.set("Authorization", `DPoP ${authToken}`);
   # headers.set(
   # "DPoP",
   # await createDpopHeader(targetUrl, defaultOptions?.method ?? "get", dpopKey)
   #);
    targetUrl='http://localhost:3000/test1/file1.txt'
    headers={ 'content-type': 'text/plain', 'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", dpopKey)}
    res1= requests.put(targetUrl,
        headers=headers,
        data='abcd'
    )
    targetUrl='http://localhost:3000/test1/file1.txt'
    headers={  'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", dpopKey)}

    res= requests.get(targetUrl,
        headers=headers
    )
    print(res.text)

def CSSgetfiletest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    IDP = 'http://localhost:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    print(CSSA.put_file('test1', 'file3.txt', 'abcde', 'text/plain'))
    print(CSSA.get_file(IDP+'test1/'))
    print(CSSA.get_file(IDP+'test1/file1.txt'))

def putdirCSStest2():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    IDP = 'http://cups3.ecs.soton.ac.uk:3000/'
    sourcedir = '../../Datasets/babydir'
    
    distributor.putdirCSS(sourcedir,'test',IDP,USERNAME,PASSWORD,'testindex.ttl')
    
    
def putfileVMtest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    IDP = 'https://srv03812.soton.ac.uk:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    print(CSSA.put_file('test', 'file3.txt', 'abcde', 'text/plain'))
    print(CSSA.get_file(IDP+'test/file3.txt'))
    #print(CSSA.get_file(IDP+'test1/file2.txt'))
    #print(CSSA.get_file(IDP+'test1/file1.txt'))   

def CSSaccessVMtest():
    client_id = 'ys1v22@soton.ac.uk'
    client_secret = '12345'

    # The server that provides your account (where you login)
    issuer_url = 'http://srv03814.soton.ac.uk:3000/'
   # issuer_url = 'http://localhost:3000/'
    # create a token provider
   # token_provider = DpopTokenProvider(
    #    issuer_url=issuer_url,
    #    client_id=client_id,
    #    client_secret=client_secret
    #)
    # use the tokens with the requests library
    #auth = SolidClientCredentialsAuth(token_provider)
    auth = (client_id,client_secret)

    data ={ 'email': client_id, 'password': client_secret}
    datajson=json.dumps(data)
    res = requests.post('http://srv03814.soton.ac.uk:3000/idp/credentials/',headers={ 'content-type': 'application/json' }, data=str(datajson))
    print(res.text)
    res=res.json()
    print(len(res))
    if len(res)>0:
        print (res[0])




    #res = requests.get('http://srv03813.soton.ac.uk:3000/test1/', auth=auth)
    #print(res.text)
    headers= {'content-type': 'text/plain'}

    #('http://localhost:3000/idp/credentials/', {
    # method: 'POST',
    # headers: { 'content-type': 'application/json' },
    # // The email/password fields are those of your account.
    # // The name field will be used when generating the ID of your token.
    # body: JSON.stringify({ email: 'my-email@example.com', password: 'my-account-password', name: 'my-token' }),
    #});
    data ={ 'email': client_id, 'password': client_secret, 'name': 'my-token' }
    datajson=json.dumps(data)
    res = requests.post('http://srv03814.soton.ac.uk:3000/idp/credentials/', headers={ 'content-type': 'application/json' }, data=str(datajson))
    print(res.text)
    res=res.json()

    authstring=urllib.parse.quote(res['id'])+':'+urllib.parse.quote(res['secret'])
    print(authstring)
    dpopKey = dpop_utils.generate_dpop_key_pair()
    tokenUrl = 'http://srv03814.soton.ac.uk:3000/.oidc/token'

    #res = requests.post(
    #    tokenUrl,
    #    auth=(client_id, client_secret),
    #    headers={
    #        "DPoP": dpop_utils.create_dpop_header(tokenUrl, "POST", dpopKey),
    #    },
    #    data={"grant_type": "client_credentials", "scope": "webid"},
    #    timeout=5000,
    #)

    #access_token = res.json()["access_token"]
    #print(res.json())

    s=bytes(authstring, 'utf-8')
    #auth=f'Basic {base64.standard_b64encode(s)}'
    print(str(base64.standard_b64encode(s)))
    auth='Basic %s' % str(base64.standard_b64encode(s))[2:-1]
    print(auth)
    #auth = f'Basic ${Buffer.from(authString).toString('base64')}'
    res = requests.post(
        tokenUrl,
        headers= {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': auth,
            'DPoP': dpop_utils.create_dpop_header(tokenUrl, 'POST', dpopKey)
        },
        #data= 'grant_type=client_credentials&scope=webid',
        data={"grant_type":"client_credentials","scope": "webid"},
        timeout=5000
    )
    print(res.json())
    authtoken =res.json()['access_token']
   # headers.set("Authorization", `DPoP ${authToken}`);
   # headers.set(
   # "DPoP",
   # await createDpopHeader(targetUrl, defaultOptions?.method ?? "get", dpopKey)
   #);
    #http://localhost:3000/idp/credentials/ with as body a JSON object containing your email and password.
    
    print('boooo')

    targetUrl='http://srv03814.soton.ac.uk:3000/test/'
    headers={  'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", dpopKey)}

    res= requests.get(targetUrl,
        headers=headers
    )
    print(res.text)


    targetUrl='http://srv03814.soton.ac.uk:3000/test/file1.txt'
    headers={ 'content-type': 'text/plain', 'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", dpopKey)}
    res1= requests.put(targetUrl,
        headers=headers,
        data='abcd'
    )
    print(res1.text)
    headers={  'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", dpopKey)}

    res= requests.get(targetUrl,
        headers=headers
    )
    print(res.text)

def loginVMtest():
    client_id = 'ys1v22@soton.ac.uk'
    client_secret = '12345'
    token_endpoint = 'http://cups3.ecs.soton.ac.uk:3000/.oidc/token'
    dpopKey = dpop_utils.generate_dpop_key_pair()
    res = requests.post(
        token_endpoint,
        auth=(client_id, client_secret),
        headers={
            "DPoP": dpop_utils.create_dpop_header(token_endpoint, "POST", dpopKey),
        },
        data={"grant_type": "client_credentials", "scope": "webid"},
        timeout=5000,
    )
    print(res.text)

def crawltest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    namespace="http://example.org/SOLID/"
    reprformat='turtle'
    
    IDP = 'http://localhost:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    podaddress=IDP+'test/'
    indexname='espressoindex.ttl'
    indexaddress=podaddress+indexname
    
    d=brewmaster.crawl(podaddress, CSSA,indexaddress)
    print(d)
    index=rdfindex.listindexer(d,namespace,reprformat)
    indexdata=index.__repr__()
    t=CSSA.put_file('test', indexname, indexdata, 'text/turtle')

def indextest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    namespace="http://example.org/SOLID/"
    reprformat='turtle'
    
    IDP = 'http://localhost:3000/'
    datasource='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    podaddress=IDP+'test/'
    indexname='espressoindex.ttl'
    indexaddress=podaddress+indexname
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
                #print(a)
    t=CSSA.create_authtoken()
                #print(t)
    #podaddress=IDP+pod+'/'
    d=brewmaster.crawl(podaddress, CSSA)
    files=d.keys()
    print(files)
    for targetUrl in files:
        print(CSSA.delete_file(targetUrl))
    filelist=[]
    for filename in os.listdir(datasource):
            f = os.path.join(datasource, filename)
            # checking if it is a file
            if os.path.isfile(f) and not filename.startswith('.'):
                filelist.append(f)
    print(filelist)
    distributor.putlistCSS (filelist,'test',IDP,USERNAME,PASSWORD)
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    
    print(CSSA.get_file(indexaddress))
    
    d=brewmaster.crawl(podaddress, CSSA)
    print(d.keys())

    index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
    indexdata=index.__repr__()
    with open('/Users/yurysavateev/ESPRESSO/testindex.ttl', 'w') as f:
        f.write(indexdata)
        f.close()

    #t=CSSA.put_file(pod, self.podindexname, indexdata, 'text/turtle')
    

def profiletest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    namespace="http://example.org/SOLID/"
    reprformat='turtle'
    
    IDP = 'http://localhost:3000/'
    indexname='espressoindex.ttl'
    podaddress=IDP+'test1/'
    profileaddress=podaddress+'profile/'
    indexaddress=podaddress+indexname
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    #a=CSSA.create_authstring()
    #print(a)
    #t=CSSA.create_authtoken()
    #print(t)
    CSSA.new_session()
    
    print(CSSA.get_file(profileaddress))
    d=brewmaster.crawl(profileaddress, CSSA, indexaddress)
    print(d)

def sorttest():
    datasource = '/Users/yurysavateev/iweb data'
    listtest = []
    for s in range(10):
        for p in range(100):
            listtest.append('ser/ver'+str(s)+'/pod' + str(p))
    image=filesorter.sortimage()
    image.loaddir(datasource)
    image.loadpodlist(listtest)
    image.sort(100,5,40)
    print(image)

def tokenchecktest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    cert = 'ca.pem'
    data ={ 'email': USERNAME, 'password': PASSWORD}
    datajson=json.dumps(data)
    res = requests.post('https://cups5.ecs.soton.ac.uk:3000/idp/credentials/',headers={ 'content-type': 'application/json' }, data=str(datajson),verify=False)
    print(res.json())
    tokenlist =list(res.json())
    #for t in tokenlist:
    #    datat ={ 'email': USERNAME, 'password': PASSWORD, 'delete':t}
   #     datatjson=json.dumps(datat)
    #    rest = requests.post('http://localhost:3000/idp/credentials/',headers={ 'content-type': 'application/json' }, data=str(datatjson))
   #     print(rest.json())
    print (len(tokenlist))

def cleantest():
    text="python3 sjfbjs some ,clean,, cleans, 4847 kjkj inHHput http://in.com"
    res=cleantext.clean_words(text,
    clean_all= False, # Execute all cleaning operations
    extra_spaces=True ,  # Remove extra white spaces 
    stemming=True , # Stem the words
    stopwords=False ,# Remove stop words
    lowercase=True ,# Convert to lowercase
    numbers=True ,# Remove all digits 
    punct=True ,# Remove all punctuations
    #reg: str = '<regex>', # Remove parts of text based on regex
    #reg_replace: str = '<replace_value>', # String to replace the regex used in reg
    stp_lang='english'  # Language for stop words
    )
    print(res)

def crawllisttest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    namespace="http://example.org/SOLID/"
    reprformat='turtle'
    
    IDP = 'https://cups5.ecs.soton.ac.uk:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    print(CSSA.get_file(IDP+'test/'))
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    
    podaddress=IDP+'test/'
    indexname='espressoindex.ttl'
    indexaddress=podaddress+indexname
    
    d=brewmaster.crawllist(podaddress, CSSA,indexaddress)
    print(d)
    #index=rdfindex.listindexer(d,namespace,reprformat)
    #indexdata=index.__repr__()
    #t=CSSA.put_file('test1', indexname, indexdata, 'text/turtle')

def NSStest():
    IDP='https://solidcommunity.net'
    POD_ENDPOINT = 'https://estlladon.solidcommunity.net/'
    USERNAME = 'estlladon'
    PASSWORD = 'FmEC3wAn4Biw!p5'
    #auth = Auth()
    #assert not auth.is_login
    #auth.login(IDP, USERNAME, PASSWORD)
    #assert auth.is_login
    #headers={  'authorization':'DPoP '+self.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", self.dpopKey)}
    targetUrl=POD_ENDPOINT+'.well-known/openid-configuration'
    res= requests.get(targetUrl)
    print(res.text)
    res=res.json()
    token_endpoint=res['token_endpoint']
    authorization=res['authorization_endpoint']
    print(token_endpoint)
    print(authorization)
    data ={ 'client_id': USERNAME, 'password': PASSWORD, 'redirect_uri':POD_ENDPOINT}
    datajson=json.dumps(data)
    res = requests.post(authorization, headers={ 'content-type': 'application/json' }, data=str(datajson))
    #resj=res.json()
    print(res.text)
    #authstring=urllib.parse.quote(resj['id'])+':'+urllib.parse.quote(resj['secret'])
    #print(authstring)    
    #auth = Auth()
    #api = SolidAPI(auth)
    #auth.login(IDP, USERNAME, PASSWORD)
    #resp = api.get('https://estlladon.solidcommunity.net/private/test.html')
    #print(resp.text)
    #api = SolidAPI(auth)

def powertest():
    a=range(1000)
    print(filesorter.powerdistribute(a, 20, 1))

def gettest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    IDP = 'https://cups5.ecs.soton.ac.uk:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    print(CSSA.get_file(IDP+'test/'))
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    print(CSSA.put_file('test', 'file1.txt', 'abcde', 'text/plain'))
    
    print(CSSA.get_file(IDP+'test/file1.txt'))
    print(CSSA.get_file(IDP+'test/.acl'))

def putfileVM2test():
    client_id = 'ys1v22@soton.ac.uk'
    client_secret = '12345'
    cert = 'ca.pem'
    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    issuer_url = 'https://cups4.ecs.soton.ac.uk:3000/'
    res=requests.get('https://cups4.ecs.soton.ac.uk:3000/test/')
    print(res.text)
    res=requests.get('https://cups4.ecs.soton.ac.uk:3000/test/profile/card#me')
    print(res.text)
    # create a token provider
   # token_provider = DpopTokenProvider(
    #    issuer_url=issuer_url,
    #    client_id=client_id,
    #    client_secret=client_secret
    #)
    # use the tokens with the requests library
    #auth = SolidClientCredentialsAuth(token_provider)
    auth = (client_id,client_secret)

    #res = requests.get('http://srv03813.soton.ac.uk:3000/test1/', auth=auth)
    #print(res.text)
    headers= {'content-type': 'text/plain'}

    #('http://localhost:3000/idp/credentials/', {
    # method: 'POST',
    # headers: { 'content-type': 'application/json' },
    # // The email/password fields are those of your account.
    # // The name field will be used when generating the ID of your token.
    # body: JSON.stringify({ email: 'my-email@example.com', password: 'my-account-password', name: 'my-token' }),
    #});
    data ={ 'email': client_id, 'password': client_secret, 'name': 'my-token' }
    datajson=json.dumps(data)
    res = requests.post('https://cups4.ecs.soton.ac.uk:3000/idp/credentials/', headers={ 'content-type': 'application/json' }, data=str(datajson))
    print(res.text)
    res=res.json()

    authstring=urllib.parse.quote(res['id'])+':'+urllib.parse.quote(res['secret'])
    print(authstring)
    dpopKey = dpop_utils.generate_dpop_key_pair()
    tokenUrl = 'https://cups4.ecs.soton.ac.uk:3000/.oidc/token'

    #res = requests.post(
    #    tokenUrl,
    #    auth=(client_id, client_secret),
    #    headers={
    #        "DPoP": dpop_utils.create_dpop_header(tokenUrl, "POST", dpopKey),
    #    },
    #    data={"grant_type": "client_credentials", "scope": "webid"},
    #    timeout=5000,
    #)

    #access_token = res.json()["access_token"]
    #print(res.json())

    s=bytes(authstring, 'utf-8')
    #auth=f'Basic {base64.standard_b64encode(s)}'
    auth='Basic %s' % str(base64.standard_b64encode(s))[2:]
    print(auth)
    #auth = f'Basic ${Buffer.from(authString).toString('base64')}'
    res = requests.post(
        tokenUrl,
        headers= {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': auth,
            'DPoP': dpop_utils.create_dpop_header(tokenUrl, 'POST', dpopKey)
        },
        #data= 'grant_type=client_credentials&scope=webid',
        data={"grant_type":"client_credentials","scope": "webid"},
        timeout=5000
    )
    print(res.json())
    authtoken =res.json()['access_token']
    print(authtoken)
   # headers.set("Authorization", `DPoP ${authToken}`);
   # headers.set(
   # "DPoP",
   # await createDpopHeader(targetUrl, defaultOptions?.method ?? "get", dpopKey)
   #);
    targetUrl='https://cups4.ecs.soton.ac.uk:3000/test/file1.txt'
    #targetUrl=self.idp+podname+'/'+filename
    headers={ 'content-type': 'text/plain', 'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", dpopKey)}
    res1= requests.put(targetUrl,
            headers=headers,
            data='abcd'
    )
    print(res1.text)
    targetUrl='https://cups4.ecs.soton.ac.uk:3000/test/profile/'
    headers={  'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", dpopKey)}

    res= requests.get(targetUrl,
        headers=headers
    )
    print(res.text)
    targetUrl='https://cups4.ecs.soton.ac.uk:3000/test/.acl'
    headers={  'authorization':'DPoP '+authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "GET", dpopKey)}

    res= requests.get(targetUrl,
        headers=headers
    )
    print(res.text)

def putdirCSStest3():
    #datasource = '/Users/yurysavateev/iweb data'
    namespace="http://example.org/SOLID/"
    #targetdir ='/Users/yurysavateev/Python/dir/server0/server0pod0'
    podname=''
    #IDP='https://inrupt.com'
    IDP='https://cups5.ecs.soton.ac.uk:3000/'
    #POD_ENDPOINT = 'https://storage.inrupt.com/271193f6-926b-45c1-8fa8-b31cc03accb4/'
    POD_ENDPOINT = 'https://cups5.ecs.soton.ac.uk:3000/test/'
    #USERNAME = 'rezmosa'
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    directory = '/Users/yurysavateev/Downloads/IndexFiles/'
    if len(podname)==0:
        pod=POD_ENDPOINT
    else:
        pod=POD_ENDPOINT+podname+'/'

    #rdfindex.indexer(sourcedir,podname,pod,namespace)
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    #a=CSSA.create_authstring()
    #t=CSSA.create_authtoken()
    CSSA.new_session()

    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f) and filename[0]!='.' :
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            file.close()
            file_url=pod+filename
            print('putting '+filename+' to the pod '+ pod)
            print(CSSA.put_file('test', filename, filetext, 'text/turtle'))
            #api.put_file(file_url, filetext, 'text/markdown')
    
def gettest2():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    targetUrl = 'https://cups2.ecs.soton.ac.uk:3000/'
    #CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    #print(CSSA.get_file(IDP+'test/.acl'))
    print(CSSaccess.get_file(targetUrl))
    #a=CSSA.create_authstring()
    #print(a)
    #t=CSSA.create_authtoken()
    #print(t)
    #print(CSSA.put_file('test', 'file1.txt', 'abcde', 'text/plain'))
    
    #print(CSSA.get_file(IDP+'test/file1.txt')) 

def podcreatetest():
    USERNAME = 'espressotest@example.com'
    PASSWORD = '12345'
    podname = "podtest"
    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    IDP = 'https://cups5.ecs.soton.ac.uk:3000/'

    register_endpoint = f"{IDP}idp/register/"
    res = requests.post(
        register_endpoint,
        json={
            "createWebId": "on",
            "webId": "",
            "register": "on",
            "createPod": "on",
            "podName": podname,
            "email": USERNAME,
            "password": PASSWORD,
            "confirmPassword": PASSWORD,
        },
        timeout=5000,
    )
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    print(CSSA.get_file(IDP))
    print(CSSA.get_file(IDP+podname+'/'))

def acltest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    IDP = 'https://cups2.ecs.soton.ac.uk:3000/'
    POD=IDP+'test/'
    print(POD)
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    #CSSA.new_session()
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    print('putting file')
    res=CSSA.put_file('test', 'file2.txt', 'abcde', 'text/plain')
    print(res)
    print('getting file '+POD+'file2.txt')
    res=CSSA.get_file(POD+'file2.txt')
    print(res)
    print('getting .acl file '+POD+'file2.txt.acl')
    res=CSSA.get_file(POD+'file2.txt.acl')
    print(res)
    print('opening up file '+POD+'file2.txt')
    res=CSSA.makefileaccessible('test','file2.txt')
    print(res)
    print('getting .acl file '+POD+'file2.txt.acl')
    res=CSSA.get_file(POD+'file2.txt.acl')
    print(res)

    
def lemmatizetest():
    lemmatizer = WordNetLemmatizer()

    # Lemmatize a word
    word = "running"
    lemma = lemmatizer.lemmatize(word, pos="v")

    # Print the lemma
    print(lemma)

def podtest():
    espressopod='ESPRESSOtest'
    espressoemail='espressotest@example.com'
    password='12345'
    IDP='https://cups2.ecs.soton.ac.uk:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
    print(CSSA.get_file(IDP))
    print(CSSA.get_file(IDP+espressopod+'/'))
    print(IDP+espressopod+'/profile/')
    print(CSSA.get_file(IDP+espressopod+'/profile/'))

def podtestexp():
    pod='pod0'
    espressoemail='pod0@example.org'
    password='12345'
    IDP='https://cups2.ecs.soton.ac.uk:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
    print(CSSA.get_file(IDP))
    print(CSSA.get_file(IDP+pod+'/'))
    print(IDP+pod+'/profile/')
    print(CSSA.get_file(IDP+pod+'/profile/'))

def exptest():
    serverlist=['https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    pod='pod0'
    email='pod0@example.org'
    password='12345'
    IDP=serverlist[0]
    CSSA=CSSaccess.CSSaccess(IDP, email, password)
    print(CSSA.get_file(IDP+pod+'/'))
    print(IDP+pod+'/profile/')
    print(CSSA.get_file(IDP+pod+'/profile/'))

def acldeftest():
    filename='https://cups2.ecs.soton.ac.uk:3000/pod3e/espressoindex.ttl'
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
    print(acldef)

def csvtest():
    lists=['a.txt','b.txt','c.txt']
    l=[]
    for s in lists:
        l.append([s])

    print(l)
    with open('test.csv', 'w') as f:
        csv_writer = csv.writer(f)
        csv_writer.writerows(l)
        f.close()
    with open('test.csv', 'r') as f:
        p=f.read()
        print(p)
        f.close()

def difftest():
    path1='/Users/yurysavateev/ESPRESSO/diffscsv/espressoindex1.csv'
    with open('test.csv', 'r') as f:
        str1=f.read()
        f.close() 
    print(str1)
    indata=''
    indatalist=[]
    for i in range(10):
        this = 'https://cupsa.ecs.soton.ac.uk:3000/stressdist'+str(i)+'/espressoindex.ttl'+chr(13)+'\n'
        indata+=this
        indatalist.append([this])

    #print(indata)
    with open('test2.csv', 'w') as f:
                csv_writer = csv.writer(f)
                csv_writer.writerows(indatalist)
                f.close()
    with open('test2.csv', 'r') as f:
        fromcsvfile=f.read()
        f.close() 
    #print(fromcsvfile)
    with open('/Users/yurysavateev/ESPRESSO/diffscsv/sheetsindex.csv', 'r') as f:
        fromsheet=f.read()
        f.close() 
    res=CSSaccess.get_file('https://cupsa.ecs.soton.ac.uk:3000/ESPRESSO/espressoindex2.csv')
    fromsolid=res.text
    print(fromsolid)
    print(fromsolid==indata)
    print(len(fromsolid),len(indata))
    print(str1==indata)
    #for line in difflib.unified_diff(fromsolid, str1, fromfile='fromsolid', tofile='str1', lineterm=''):
    #print(difflib.Differ(fromsolid, indata))
    #sys.stdout.writelines(difflib.unified_diff(str1, fromsolid, fromfile='str1', tofile='fromsolid'))
    for i in range(len(indata)):
        print('solid: '+fromsolid[i]+' code: '+str(ord(fromsolid[i]))+' indata: '+indata[i]+' code: '+str(ord(indata[i])))


def rdftest():
    pass 

def ldpindextest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    
    IDP = 'http://localhost:3000/'
    podaddress=IDP+'test/'
    podname='test'
    indexname='espressoindex.ttl'
    indexaddress=podaddress+indexname
    espressodir='ESPRESSOdir'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
                #print(a)
    t=CSSA.create_authtoken()
                #print(t)
    #podaddress=IDP+pod+'/'
    #d=brewmaster.crawl(podaddress, CSSA)
    #files=d.keys()
    #print(files)
    #for targetUrl in files:
    #    print(CSSA.delete_file(targetUrl))
    #filelist=[]
    #for filename in os.listdir(datasource):
    #        f = os.path.join(datasource, filename)
    #        # checking if it is a file
    #        if os.path.isfile(f) and not filename.startswith('.'):
    #            filelist.append(f)
    #print(filelist)
    #distributor.putlistCSS (filelist,'test',IDP,USERNAME,PASSWORD)
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    
    print(CSSA.get_file(indexaddress))
    
    d=brewmaster.crawl(podaddress, CSSA)
    print(d.keys())

    ldpindex=brewmaster.ldpindexdict(d)
    brewmaster.uploadldpindex(ldpindex,podname,espressodir,CSSA)

def ldpindexopentest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    
    IDP = 'http://localhost:3000/'
    podaddress=IDP+'test/'
    podname='test'
    
    espressodir='ESPRESSOdir'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
                #print(a)
    t=CSSA.create_authtoken()
    address=espressodir+'/'
    CSSA.makefileaccessible(podname, address)

def ldpcupstest():
    USERNAME = 'ldptest@example.com'
    PASSWORD = '12345'
    
    IDP = 'https://cupsa.ecs.soton.ac.uk:3000/'
    podaddress=IDP+'ldptest/'
    podname='ldptest'
    datasource='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    espressodir='espressoindex'
    #filedict=dict()
    #for filename in os.listdir(datasource):
    #    f = os.path.join(datasource, filename)
            # checking if it is a file
    #    if os.path.isfile(f) and not filename.startswith('.'):
    #        file = open(f, "rb")
    #        filetext=file.read()
    #        file.close()
    #        filedict[filename]=filetext
    #print(filedict.keys())
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    #for i in range(10):
    #    filename='File'+str(i+1)+'.dat'
    #    print('putting '+filename)
    #    filetext=filedict[filename]
    #    CSSA.put_file(podname, filename, filetext, 'text/plain')
    
    d=brewmaster.crawl(podaddress, CSSA)
    print(d.keys())

    ldpindex=brewmaster.ldpindexdict(d)
    for (filename,filetext) in ldpindex.items():
        if filename.endswith('file'):
            print(filename,filetext)
            
    brewmaster.uploadldpindex(ldpindex,podname,espressodir,CSSA)

def ldpindexacltest():
    USERNAME = 'ldptest@example.com'
    PASSWORD = '12345'
    
    IDP = 'https://cupsa.ecs.soton.ac.uk:3000/'
    podaddress=IDP+'ldptest/'
    podname='ldptest'
    datasource='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    espressodir='espressoindex'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    print (CSSA.get_file('https://cupsa.ecs.soton.ac.uk:3000/ldptest/.acl'))

def ldpmetaindextest():
    USERNAME = 'espresso@example.com'
    PASSWORD = '12345'
    
    IDP = 'https://cupsa.ecs.soton.ac.uk:3000/'
    espressopodname='ESPRESSO'
    podaddress=IDP+'ESPRESSO/'
    podname='ESPRESSO'
    datasource='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    metaindexdata='https://cupsa.ecs.soton.ac.uk:3000/ldptest/espressoindex/\r\n'
    espressodir='espressoindex'
    espressoindexfile='ldptest.csv'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    res=CSSA.put_file(espressopodname, espressoindexfile, metaindexdata, 'text/csv')
    print(res)
    res=CSSA.makefileaccessible(espressopodname, espressoindexfile)
    print(res)

def filtertest():

    IDP = 'https://cupsa.ecs.soton.ac.uk:3000/'
    podaddress=IDP+'ldptest/'
    podname='ldptest'
    #datasource='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    espressodir='espressoindex'
    indexaddress=podaddress+espressodir+'/'
    keyword='penis'
    print(brewmaster.coffeefiltertest(indexaddress, keyword))

def ldpcupstest2():
    USERNAME = 'ldptest2@example.com'
    PASSWORD = '12345'
    
    IDP = 'https://cupsa.ecs.soton.ac.uk:3000/'
    podaddress=IDP+'ldptest2/'
    podname='ldptest2'
    datasource='../../Datasets/babydir'
    espressodir='espressoindex'
    filedict=dict()
    for filename in os.listdir(datasource):
        f = os.path.join(datasource, filename)
            # checking if it is a file
        if os.path.isfile(f) and not filename.startswith('.'):
            file = open(f, "rb")
            filetext=file.read()
            file.close()
            filedict[filename]=filetext
    print(filedict.keys())
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    for i in range(2):
        filename='file'+str(i+1)+'.txt'
        print('putting '+filename)
        filetext=filedict[filename]
        CSSA.put_file(podname, filename, filetext, 'text/plain')
    
    d=brewmaster.crawl(podaddress, CSSA)
    print(d.keys())

    ldpindex=brewmaster.ldpindexdict(d)
    for (filename,filetext) in ldpindex.items():
        #if filename.endswith('file'):
            print(filename,filetext)
    brewmaster.uploadldpindex(ldpindex,podname,espressodir,CSSA)

def crawlindextest():
    USERNAME = 'ldptest@example.com'
    PASSWORD = '12345'
    
    IDP = 'https://cupsa.ecs.soton.ac.uk:3000/'
    podaddress=IDP+'locind1s24p0/'
    podname='locind1s24p0'
    datasource='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    espressodir='espressoindex'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    #for i in range(10):
    #    filename='File'+str(i+1)+'.dat'
    #    print('putting '+filename)
    #    filetext=filedict[filename]
    #    CSSA.put_file(podname, filename, filetext, 'text/plain')
    
    d=brewmaster.crawl(podaddress, CSSA)
    ldpindex=brewmaster.ldpindexdict(d)
    print(len(ldpindex.keys()))
    dlist=brewmaster.crawllist(podaddress+espressodir+'/', CSSA)
    print(len(dlist))

def deletedirtest():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    
    IDP = 'http://localhost:3000/'
    podaddress=IDP+'test/'
    podname='test'
    indexname='espressoindex.ttl'
    indexaddress=podaddress+indexname
    testdir='testdir2/'
    dirname=testdir
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    print(CSSA.put_file(podname, testdir+'file1.txt', 'abcd', 'text/plain'))
    print(CSSA.put_file(podname, testdir+'file2.txt', 'abcde', 'text/plain'))
    acldef='''@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

<#owner> a acl:Authorization;
acl:agent c:me, <mailto:ys1v22@soton.ac.uk>;
acl:mode acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>.

<#public> a acl:Authorization;
    acl:mode  acl:Read;
acl:accessTo <./>;
acl:default <./>;
acl:agentClass foaf:Agent.'''
    print(acldef)
    targetUrl=IDP+podname+'/'+testdir+'.acl'
    print(targetUrl)
    headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
    res= requests.put(targetUrl,
               headers=headers,
                data=acldef
            )
    print(res)
    #print(CSSA.put_file(podname, testdir+'.acl', acldef, 'text/turtle'))
    
    targetUrl=podaddress+testdir
    #print (CSSA.get_file(podaddress+'.acl'))

    print (CSSA.get_file(targetUrl+'.acl'))

def sshindextest():
    podnum=len(self.filedist[s])
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(first_server, username=username, password=password)

                # Run the script on the first server
    scriptaddress='/usr/local/ESPRESSO/'
    command = f'python "{scriptaddress}" "{IDP}" "{self.espressoindexfile}" "{self.podname}" "{podnum}" "{self.podindexdir}"'
    stdin, stdout, stderr = ssh.exec_command(command)


def argvtest():
    IDP=sys.argv[1]
    espressoindexfile=sys.argv[2]
    podname=sys.argv[3]
    podnum=int(sys.argv[4])
    podindexdir=sys.argv[5]  
    print(IDP,espressoindexfile,podname,podnum,podindexdir)

def metaindexmanual():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://srv03812.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    for IDP in serverlist:
        PASSWORD='12345'
        metaindexname='newldpexp6s24p200f.csv'
        podindexdir='espressoindex/'
        podname='newldp6s24p200f'
        metaindexdata=''
        for i in range(4):
            thispodname=podname+str(i)
            podindexaddress=IDP+thispodname+'/'+podindexdir
            metaindexdata=metaindexdata+podindexaddress+'\r\n'
        print(metaindexdata)
        indexaddress=IDP+podname+'/'+podindexdir
        USERNAME='espresso@example.com'
        esprpodname='ESPRESSO'
        CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
        a=CSSA.create_authstring()
        print(a)
        t=CSSA.create_authtoken()
        print(t)
        print(CSSA.put_file(esprpodname, metaindexname, metaindexdata, 'text/csv'))
        print(CSSA.makefileaccessible(podname, metaindexname))
    
def indexpubmanual():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://srv03812.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    for IDP in serverlist:
        
        PASSWORD='12345'
        metaindexname='newldpexp6s24p200f.csv'
        podindexdir='espressoindex/'
        podname='newldp6s24p200f'
        indexaddress=IDP+podname+'/'+podindexdir
        metadata=''
        acldef='''@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

<#owner> a acl:Authorization;
acl:agent c:me, <mailto:ys1v22@soton.ac.uk>;
acl:mode acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>.

<#public> a acl:Authorization;
    acl:mode  acl:Read;
acl:accessTo <./>;
acl:default <./>;
acl:agentClass foaf:Agent.'''
                #print(acldef)
        for i in range(4):
            thispodname=podname+str(i)
            USERNAME=thispodname+'@example.org'
            podindexaddress=IDP+thispodname+'/'+podindexdir
            metadata=metadata+podindexaddress+'\r\n'
            #CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
            #a=CSSA.create_authstring()
            #print(a)
            #t=CSSA.create_authtoken()
            #print(t)
            #targetUrl=podindexaddress+'.acl'
                #print(targetUrl)
            #headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
            #res= requests.put(targetUrl,headers=headers,data=acldef)
                #res=CSSAccess.get_file(indexaddress+'.acl')
            #print(res)

        USERNAMEe='espresso@example.com'
        CSSAe=CSSaccess.CSSaccess(IDP, USERNAMEe, PASSWORD)
        a=CSSAe.create_authstring()
        print(a)
        t=CSSAe.create_authtoken()
        print(t)
        print(CSSAe.put_file('ESPRESSO', metaindexname, indexaddress, 'text/csv'))
        print(CSSAe.makefileaccessible('ESPRESSO', metaindexname))
        
def indexuploadtest():
    USERNAME = 'extraldp6s24p200f0@example.org'
    PASSWORD = '12345'
    
    IDP = 'https://cups3.ecs.soton.ac.uk:3000/'
    
    podname='extraldp6s24p200f0'
    #indexname='espressoindex.ttl'
    #indexaddress=podaddress+indexname
    indexdir='espressoindex2/'
    
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    filename='file1.file'
    
    targetUrl=IDP+podname+'/'+indexdir+filename
    print(targetUrl)
    res=CSSA.put_url(targetUrl,'This is a test','text/csv')    
    print(res)  

def normaltest():
    test = range(600)
    a = filesorter.normaldistribute(test,60,0.2)

def rdftest():
    namespace=Namespace("http://example.org/SOLIDindex/")
    g=Graph()
    a=BNode()
    g.add((a,namespace.Pred,namespace.Obj))
    print(g.value(a,namespace.Pred))

def getwebidtest():
    IDP='https://srv03911.soton.ac.uk:3000/'
    USERNAME='demopod5@example.org'
    PASSWORD='12345'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    CSSA.create_authstring()
    CSSA.create_authtoken()
    targetUrl='https://srv03911.soton.ac.uk:3000/demopod5/File219.dat'
    webidstring=brewmaster.getwebidlist(targetUrl, CSSA)
    print(webidstring)
    targetUrl='https://srv03911.soton.ac.uk:3000/demopod5/espressoindex/'
    webidstring=brewmaster.getwebidlist(targetUrl, CSSA)
    print(webidstring)
    
def aclcrawltest():
    IDP='http://localhost:3000/'
    USERNAME='aclpod4@example.org'
    PASSWORD='12345'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    CSSA.create_authstring()
    CSSA.create_authtoken()
    address='http://localhost:3000/aclpod4/'
    d=brewmaster.aclcrawl(address, CSSA)
    for (a,b,c) in d:
        print(a,c)



def thread_function(name):
    logging.info("Thread %s: starting", name)
    time.sleep(2)
    logging.info("Thread %s: finishing", name)

def threadtest():
    format = "%(asctime)s: %(message)s"
    logging.basicConfig(format=format, level=logging.INFO,
                        datefmt="%H:%M:%S")

    
    logging.info("Testing update. Starting value is")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        for index in range(5):
            executor.submit(thread_function, index)
    logging.info("Testing update. Ending value is.")

def exptestrdf():
    g=Graph()
    g.parse("demopodexp.ttl")
    q="""prefix ns1: <http://example.org/SOLIDindex/>
    SELECT ?w ?n
    WHERE
    {
        SELECT ?w (COUNT(?f) as ?n)
        WHERE
        {
            ?f ns1:AccessibleBy ?p.
            ?p ns1:WebID ?w
        }
        GROUP BY ?p
    } ORDER BY (?n) 
    """
    for r in g.query(q):
        print(r["w"],r["n"])

def countrdftest():
    acldef='''@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

<#owner> a acl:Authorization;
acl:agent c:me, <mailto:ys1v22@soton.ac.uk>;
acl:mode acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>.

<#public> a acl:Authorization;
    acl:mode  acl:Read;
acl:accessTo <./>;
acl:default <./>;
acl:agentClass foaf:Agents.'''
    
    g=Graph().parse(data=acldef)

    q1='''prefix acl: <http://www.w3.org/ns/auth/acl#>
    SELECT (COUNT(?a) as ?n) WHERE{
        ?a a acl:Authorization.
        ?a acl:mode acl:Read.
        ?a acl:agentClass foaf:Agent.
    } 
    '''
    print(g.query(q1))
    for r in g.query(q1):
        print(r['n'])

def poptest():
    testdic={'a':'ab','b':'bb','c':'cb'}
    testlist=['b','a','x']
    for i in testlist:
        testdic.pop(i,'no key')

    print(testdic)

def setuptest():
    USERNAME = 'demopod5@example.org'
    PASSWORD = '12345'
    
    IDP = 'https://srv03812.soton.ac.uk:3000/'
    
    podname='demopod5'
    podaddress=IDP+podname+'/'
    indexname='espressoindex'
    indexaddress=podaddress+indexname+'/'
    
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
                #print(a)
    t=CSSA.create_authtoken()
                #print(t)
    
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    
    #print(CSSA.get_file(indexaddress))
    
    d=brewmaster.aclcrawl(podaddress, CSSA)
    

    ldpindex=brewmaster.aclindextuples(d)
    print(ldpindex['setup.ndx'])
    #brewmaster.uploadldpindex(ldpindex,podname,espressodir,CSSA)

def selecttest():
    IDP='https://srv03812.soton.ac.uk:3000/'
    USERNAME='demoattempt2pod1@example.org'
    PASSWORD='12345'
    podname='demoattempt2pod1'
    filename='File1162.dat'
    fileaddress=IDP+podname+'/'+filename
    podaddress=IDP+podname+'/'
    q='''prefix acl: <http://www.w3.org/ns/auth/acl#>

    SELECT ?a ?f WHERE{
        ?a a acl:Authorization.
        ?a acl:mode acl:Read.
        ?a acl:agent ?f.
    }
    '''
    q='''
    prefix ldp: <http://www.w3.org/ns/ldp#>
    
    SELECT ?f WHERE{
        ?a ldp:contains ?f.
    }
    '''
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    targetUrl=podaddress
    print(targetUrl)
    headers={ "Content-Type": "application/sparql-query",'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "POST", CSSA.dpopKey)}
    #webidstring='<'+'>,<'.join(webidlist)+'>'
    #data="INSERT DATA { <#Read> <acl:agent> "+webidstring+" }"
    data=q
    print(data)
    res= requests.post(targetUrl,
               headers=headers,
                data=data
            )
    print(res)
    print(res.content)
    res=CSSA.get_file(targetUrl)
    print(res)

def stringtest():
    test_str = 'https://srv03812.soton.ac.uk:3000/profile/card#me'
 
    test_str = test_str.translate(str.maketrans('', '', string.punctuation))
    print(test_str)

def filterthreadedtest():
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    keyword='disease'
    webid='https://srv03812.soton.ac.uk:3000/webidpod0/profile/card#me'
    for IDP in serverlist:
        metaindexaddress=IDP+'ESPRESSO/'+'webidpodmetaindex.csv'
        podindexaddress='https://srv03812.soton.ac.uk:3000/webidpod0/espressoindex/'
        begtime=time.time_ns()
        results=brewmaster.coffeefilterthreaded(metaindexaddress, keyword, webid)
        endtime=time.time_ns()-begtime
        print()
        #ans=dict(sorted(results.items(), key=lambda x:x[1], reverse=True))
        #for (key,freq) in ans.items(): 
        #    print(key,freq)
        #print(endtime)
        begtime1=time.time_ns()
        checkres=brewmaster.coffeefilterunthreaded(metaindexaddress,keyword,webid)
        #ans=dict(sorted(checkres.items(), key=lambda x:x[1], reverse=True))
        endtime1=time.time_ns()-begtime1
        print()
        begtime2=time.time_ns()
        checkres=brewmaster.coffeefilterpooled(metaindexaddress,keyword,webid)
        endtime2=time.time_ns()-begtime2
        ans=dict(sorted(checkres.items(), key=lambda x:x[1], reverse=True))
        
        #for (key,freq) in ans.items(): 
        #    print(key,freq)
        print ('rows fetched for'+IDP+':'+str(len(ans)))
        print('threaded time:',round(endtime/1000000,3))
        print('unthreaded time:',round(endtime1/1000000,3))
        print('pooled time:',round(endtime2/1000000,3))

def nodenametest():
    n=Namespace("http://example.org/SOLIDindex/")
    g=Graph()
    a=BNode('a')
    b=BNode('b')
    g.add((a,n.Connect,b))
    print(str(a))

def ziptest():
    dir='/Users/yurysavateev/testing/'
    
    with ZipFile(dir+'testing.zip', 'w') as zip_object:
   # Traverse all files in directory
        for folder_name, sub_folders, file_names in os.walk(dir):
            for filename in file_names:
         # Create filepath of files in directory
                
                file_path = os.path.join(folder_name, filename)
                print(file_path)
         # Add files to zip file
                zip_object.write(file_path,file_path[len(dir):])


    with ZipFile('/Users/yurysavateev/testing.zip', 'r') as f:

#extract in different directory
       f.extractall('/Users/yurysavateev/testing3/')

def nexttest():
    sdir='/Users/yurysavateev/testing/A'
    filelist=next(os.walk(sdir))[2]
    print(filelist)

def indexpubmantest():
    IDP='https://srv03812.soton.ac.uk:3000/'
    thispodname='test'
    podaddress=IDP+thispodname+'/'
    podindexaddress=podaddress+'indir2/'
    USERNAME='ys1v22@soton.ac.uk'
    PASSWORD='12345'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    CSSA.create_authstring()
    CSSA.create_authtoken()
                #print(CSSA.authtoken)
                
    acldef='''@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

<#owner> a acl:Authorization;
acl:agent c:me;
acl:mode acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>.

<#public> a acl:Authorization;
acl:mode  acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>;
acl:agentClass foaf:Agent.'''
                #print(acldef)
    #targetUrl=podaddress+'indir2/.acl'
    print(podaddress+'indir/.meta')
    #print(targetUrl)
                #print(targetUrl)
    #headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
    res=CSSA.get_file(podaddress+'indir/.meta')
    print(res)
    print('------------------------------------------')
    print(podaddress+'indir2/.meta')
    res=CSSA.get_file(podaddress+'indir2/.meta')
    print(res)
    print('------------------------------------------')
    print(podaddress+'indir/')
    res=CSSA.get_file(podaddress+'indir/')
    print(res)
    print('------------------------------------------')
    print(podaddress+'indir2/')
    res=CSSA.get_file(podaddress+'indir2/')
    print(res)
    print('------------------------------------------')
    print(podaddress+'indir/t.txt')
    res=CSSA.put_url(podaddress+'indir/t.txt','tt','text/plain')
    print(res.text)
    print('------------------------------------------')
    print(podaddress+'indir2/t.txt')
    res=CSSA.put_url(podaddress+'indir2/t.txt','tt','text/plain')
    print(res.text)
    print('------------------------------------------')
    print(podaddress+'indir3/.acl')
    res=CSSA.put_url(podaddress+'indir3/.acl',acldef,'text/turtle')
    print(res.text)
    #res= requests.put(targetUrl,headers=headers,data=acldef)
    #print(res.text)
                #res=CSSAccess.get_file(indexaddress+'.acl')
    #print(targetUrl,res)

def searchapptest():
    metaindexaddress='https://srv03918.soton.ac.uk:3000/ESPRESSO/Exp4dirsmetaindex.csv'
    word='job'
    keyword='/'.join(word)
    webid='mailto:sagent0@example.org'
    #webidfile= webid.translate(str.maketrans('', '', string.punctuation))+'.webid'
    #openfile='openaccess.webid'
    #res=CSSaccess.get_file(metaindexaddress)
    #metaindex=pandas.read_csv(metaindexaddress,header=None)
    #begtime=time.time_ns()
    #print (len(metaindex))
    #result=pandas.DataFrame(index=['File','Freq'])
    #for i in range(len(metaindex)):
    #    podindex=metaindex.iloc[i,0]
    #    podaddress=podindex[:-13]
    #    res=CSSaccess.get_file(podindex+wordfile)
    #    if res.ok:
    #        wordframe=pandas.read_csv(podindex+wordfile,header=None)
            #wordframe.columns = ['fword', 'Freq']
            #print(wordframe)
            #res=CSSaccess.get_file(podindex+openfile)
            #if res.ok:
            #    openframe=pandas.read_csv(podindex+openfile,header=None)
            #    openframe.columns=['fword','address']
    #        res=CSSaccess.get_file(podindex+webidfile)
    #        if res.ok:
    #            webidframe=pandas.read_csv(podindex+webidfile,header=None)
                #webidframe.columns=['fword','address']

            #openframe=pandas.read_csv(podindex+openfile,header=None)
            #both=pandas.concat([webidframe,openframe])
            #print(both)
    #        podres=pandas.concat([webidframe, wordframe], axis=0, join="inner")
    #        print(podres)
    #        result=pandas.concat([result,podres])
    #print(time.time_ns()-begtime)
    #print(result)        
    begtime=time.time_ns()
    ans=brewmaster.coffeefilterunthreaded(metaindexaddress,keyword,webid)
    print(len(ans.keys()),time.time_ns()-begtime)
    i=0
    #print (ans)

def ragabpodtest():
    IDP='https://srv03918.soton.ac.uk:3000/'
    register_endpoint=IDP+'idp/register/'
    podname='ragabtest'

    print('Creating '+podname+ 'at'+IDP)
    email='ragab@example.com'
    password='12345'
    acldef='''@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

<#owner> a acl:Authorization;
acl:agent c:me;
acl:mode acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>.

<#public> a acl:Authorization;
acl:mode  acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>;
acl:agentClass foaf:Agent.'''
    #res1 = requests.post(
    #                    register_endpoint,
    #                    json={
    #                        "createWebId": "on",
    #                        "webId": "",
    #                        "register": "on",
    #                        "createPod": "on",
    #                        "podName": podname,
    #                        "email": email,
    #                        "password": password,
    #                        "confirmPassword": password,
    #                    },
    #                    timeout=5000,
    #)
    #print(res1)
    CSSA=CSSaccess.CSSaccess(IDP, email, password)
    CSSA.create_authstring()
    CSSA.create_authtoken()
                
    podindexaddress=IDP+podname+'/espressoindex5/'
                #print(acldef)
    targetUrl=podindexaddress+'.acl'
                #print(targetUrl)
    headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
    res= requests.put(targetUrl,headers=headers,data=acldef)
                #res=CSSAccess.get_file(indexaddress+'.acl')
    print(targetUrl,res)

def trimtest():
    IDP='https://srv04031.soton.ac.uk:3000/'
    espressopodname='ESPRESSO/'
    espressoemail='espresso@example.com'
    password='12345'
    podname='expmultithredtest'
    newmetaindexname='expnewattempt.csv'
    trimto=5
    metaindexaddress=IDP+espressopodname+podname+'metaindex.csv'
    print(metaindexaddress)
    res=CSSaccess.get_file(metaindexaddress)
    print(res.text)
    podindexlist=res.text.rsplit('\r\n')[:-1]
    samplemeta=random.sample(podindexlist, trimto)
    metaindexdata='\r\n'.join(samplemeta)+'\r\n'
    print(metaindexdata)
        #for indexaddress in samplemeta:
        #        addstring=indexaddress+'\r\n'
        #        metaindexdata+=addstring    
                
    CSSAe=CSSaccess.CSSaccess(IDP, espressoemail, password)
    a=CSSAe.create_authstring()
    t=CSSAe.create_authtoken()
        #print(t)
    targeturl=IDP+espressopodname+newmetaindexname
    print(metaindexaddress)

    print(targeturl)
    print(CSSAe.put_url(targeturl, metaindexdata, 'text/csv'))
    CSSAe.makeurlaccessible(targeturl,newmetaindexname)
    print(res)

trimtest()