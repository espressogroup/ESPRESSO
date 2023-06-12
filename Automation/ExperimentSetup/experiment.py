import filesorter, distributor, dpop_utils, CSSaccess, brewmaster, rdfindex
#import rdfindex
import os, csv,re, math, random, shutil, requests, json, base64, urllib.parse, cleantext
#from solid_client_credentials import SolidClientCredentialsAuth, DpopTokenProvider
from solid.auth import Auth
from solid.solid_api import SolidAPI
#from solid.auth import (ClientAuthenticator, OIDCRegistrationResponse)
import ssl

a='''
TOdo 
ESPRESSO pod creation - webIDs
pods creation
pod cleanup
permissions - to the ESPRESSO pods
indexer fix
'''
#serverlist=['https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
#espressopod='ESPRESSO'
#espressoemail='espresso@example.com'
#espressoindexfile='espressoindex.csv'
#podindexname='espressoindex.ttl'
#password='12345'
#sourcedir='/Users/yurysavateev/iweb data'
#numberofpods=10
#n=50
#exp1pod1
def ESPRESSOcreation():
    for IDP in serverlist:
        register_endpoint = f"{IDP}idp/register/"
        res = requests.post(
            register_endpoint,
            json={
                "createWebId": "on",
                "webId": "",
                "register": "on",
                "createPod": "on",
                "podName": espressopod,
                "email": espressoemail,
                "password": password,
                "confirmPassword": password,
            },
            timeout=5000,
        )
        CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        print(CSSA.get_file(IDP))
        print(CSSA.get_file(IDP+espressopod+'/'))

def podcreate():
    for IDP in serverlist:
        register_endpoint = f"{IDP}idp/register/"
        for i in range(5):
            email='pod'+str(i)+'e@example.org'
            res = requests.post(
            register_endpoint,
            json={
                "createWebId": "on",
                "webId": "",
                "register": "on",
                "createPod": "on",
                "podName": 'pod'+str(i)+'e',
                "email": email,
                "password": password,
                "confirmPassword": password,
            },
            timeout=5000,
            )
            print(res)

def experimentdistribute():
    files=filesorter.sortimage()
    files.loaddir(sourcedir)
    podlist=[]
    for s in range(len(serverlist)):
        for p in range(5):
            podlist.append(serverlist[s]+'pod'+str(p))
    print(podlist)
    files.loadpodlist(podlist)
    files.sort(n, len(serverlist), numberofpods,podzipf=0)
    print(files)
    for s in range(len(serverlist)):
        print('populating '+ serverlist[s])
        for p in range(len(files.preview[serverlist[s][:-1]])):
            pod='pod'+str(p)
            print('populating pod '+pod)
            email=pod+'e@example.org'
            filelist=files.preview[serverlist[s][:-1]][serverlist[s]+pod]
            pod='pod'+str(p)+'e'
            IDP=serverlist[s]
            USERNAME='pod'+str(p)+'e@example.org'
            PASSWORD=password
            print(filelist, pod, IDP, USERNAME, PASSWORD)
            distributor.putlistCSS(filelist, pod, IDP, USERNAME, PASSWORD)




def cleanup():
    for s in range(len(serverlist)):
        print('cleaning '+ serverlist[s])
        for p in range(5):
            pod='pod'+str(p)
            print('populating pod '+pod)
            email=pod+'@example.org'
            
            pod='pod'+str(p)
            IDP=serverlist[s]
            USERNAME='pod'+str(p)+'@example.org'
            PASSWORD=password
            targetUrl=IDP+pod+'//Users/'
            print( pod, IDP, USERNAME, PASSWORD,targetUrl)
            CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
            headers={  'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "DELETE", CSSA.dpopKey)}
            
            res= requests.delete(targetUrl,
                headers=headers
            )
            print(res)
                #curl -X DELETE http://localhost:3000/myfile.txt
            
#cups 2 pod0-pod3 cups3 pod0-1 cups4 pod0-1 cups 5 pods 0-1

def dummyindexes():
    for s in range(len(serverlist)):
        IDP = serverlist[s]
        print('indexing '+ IDP)
        CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        CSSA.put_file(espressopod, espressoindexfile, 'abc', 'text/csv')
        #CSSA.makefileaccessible(espressopod, espressoindexfile)
        indexfile=IDP+espressopod+'/'+espressoindexfile
        print(indexfile+':')
        print(CSSA.get_file(indexfile))

def indexexp():
    podnum=[4,2,2,2]
    namespace="http://example.org/SOLID/"
    reprformat='turtle'
    for s in range(len(serverlist)):
        IDP = serverlist[s]
        print('indexing '+ IDP)
        #CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        #CSSA.put_file(espressopod, 'espressoindex.csv', ' ', 'text/csv')
        #CSSA.makefileaccessible(espressopod, 'espressoindex.csv')
        for p in range(podnum[s]):
            USERNAME='pod'+str(p)+'e@example.org'
            PASSWORD=password
            CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
            a=CSSA.create_authstring()
            #print(a)
            t=CSSA.create_authtoken()
            #print(t)
            pod='pod'+str(p)+'e'
            podaddress=IDP+pod+'/'
            indexname='espressoindex.ttl'
            indexaddress=podaddress+indexname
            d=brewmaster.crawl(podaddress, CSSA, indexaddress)
            print(d.keys())

            index=rdfindex.listindexer(d,namespace,reprformat)
            indexdata=index.__repr__()
            t=CSSA.put_file(pod, indexname, indexdata, 'text/turtle')
    
    
def indexpub():
    podnum=[4,2,2,2]
    namespace="http://example.org/SOLID/"
    reprformat='turtle'
    for s in range(len(serverlist)):
        IDP = serverlist[s]
        print('indexing '+ IDP)
        #CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        #CSSA.put_file(espressopod, 'espressoindex.csv', ' ', 'text/csv')
        #CSSA.makefileaccessible(espressopod, 'espressoindex.csv')
        for p in range(podnum[s]):
            USERNAME='pod'+str(p)+'e@example.org'
            PASSWORD=password
            CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
            a=CSSA.create_authstring()
            #print(a)
            t=CSSA.create_authtoken()
            #print(t)
            pod='pod'+str(p)+'e'
            #podaddress=IDP+pod+'/'
            #indexname='espressoindex.ttl'
            #indexaddress=podaddress+indexname 
            CSSA.makefileaccessible(pod, podindexname)
            print(CSSA.get_file(indexaddress+'.acl'))
    
def ESPRESSOmeta():
    podnum=[4,2,2,2]
    for s in range(len(serverlist)):
        IDP = serverlist[s]
        metaindexdata=''
        for p in range(podnum[s]):
            pod='pod'+str(p)+'e'
            podaddress=IDP+pod+'/'
            indexaddress=podaddress+podindexname
            metaindexdata=metaindexdata+indexaddress+'\n'
        print(metaindexdata)
        CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        a=CSSA.create_authstring()
        t=CSSA.create_authtoken()
        print(CSSA.put_file(espressopod, espressoindexfile, metaindexdata, 'text/csv'))
        CSSA.makefileaccessible(espressopod, espressoindexfile)
        print(CSSA.get_file(IDP+espressopod+'/'+espressoindexfile+'.acl'))  

class CSSexperiment:
    def __init__(self, serverlist, espressopodname='ESPRESSO',espressoemail='espresso@example.com',espressoindexfile='espressoindex.csv',podname='pod',podemail='@example.org',podindexname='espressoindex.ttl',password='12345'):
        self.serverlist = serverlist
        self.espressopodname=espressopodname
        self.espressoemail=espressoemail
        self.espressoindexfile=espressoindexfile
        self.podname=podname
        self.podindexname=podindexname
        self.podemail=podemail
        self.password=password
        self.filelist=[]
        self.filedist=[]
        
    def __repr__(self):
        """
        Return serverlist. Can be changed later
        """
        return str(self.serverlist)
    
    def ESPRESSOcreate(self):
        for IDP in self.serverlist:
            res =CSSaccess.get_file(IDP+self.espressopodname+'/')
            if not res.ok:
                print('Creating the ESPRESSO pod')
                register_endpoint = f"{IDP}idp/register/"
                res = requests.post(
                    register_endpoint,
                    json={
                    "createWebId": "on",
                    "webId": "",
                    "register": "on",
                    "createPod": "on",
                    "podName": self.espressopodname,
                    "email": self.espressoemail,
                    "password": self.password,
                    "confirmPassword": self.password,
                    },
                    timeout=5000,
                )
                CSSA=CSSaccess.CSSaccess(IDP, self.espressoemail, self.password)
                print(CSSA.get_file(IDP+self.espressopodname+'/'))
            else:
                print('ESPRESSO pod is present at '+IDP+self.espressopodname+'/')
    
    def podcreate(self):
        for j in range(len(self.serverlist)):
            IDP=self.serverlist[j]
            register_endpoint = f"{IDP}idp/register/"            
            for i in range(len(self.filedist[j])):
                pod=self.podname+str(i)
                res =CSSaccess.get_file(IDP+pod+'/')
                if not res.ok:
                    print('Creating '+self.podname+str(i)+ 'at'+IDP)
                    email=pod+self.podemail
                    res1 = requests.post(
                        register_endpoint,
                        json={
                            "createWebId": "on",
                            "webId": "",
                            "register": "on",
                            "createPod": "on",
                            "podName": pod,
                            "email": email,
                            "password": self.password,
                            "confirmPassword": self.password,
                        },
                        timeout=5000,
                    )
                    print(res1)
                else:
                    print('Pod '+self.podname+str(i)+ ' at'+IDP +' exists.')
                    self.cleanuppod(IDP, pod)

    def loaddir(self,datasource):
        for filename in os.listdir(datasource):
            f = os.path.join(datasource, filename)
            # checking if it is a file
            if os.path.isfile(f) and not filename.startswith('.'):
                self.filelist.append(f)

    def logicaldist(self, n,numberofpods,podzipf,serverzipf):
        if n<=len(self.filelist):
            expfilelist=self.filelist[:n]
        else:
            expfilelist=self.filelist
        exppodlist=filesorter.distribute(expfilelist,numberofpods, podzipf)
        #random.shuffle(exppodlist)
        self.filedist=filesorter.distribute(exppodlist, len(self.serverlist), serverzipf)
        print(self.filedist)

    def cleanuppod(self,IDP,pod):
        print('cleaning up pod '+pod+' at '+ IDP)
        email=pod+self.podemail
        CSSA=CSSaccess.CSSaccess(IDP, email, self.password)
        a=CSSA.create_authstring()
                #print(a)
        t=CSSA.create_authtoken()
                #print(t)
        podaddress=IDP+pod+'/'
        d=brewmaster.crawl(podaddress, CSSA)
        files=d.keys()
        print(files)
        for targetUrl in files:
            print(CSSA.delete_file(targetUrl))
            

    def upload(self):
        for s in range(len(self.serverlist)):
            print('populating '+ self.serverlist[s])
            for p in range(len(self.filedist[s])):
                pod=self.podname+str(p)
                print('populating pod '+pod)
                email=pod+self.podemail
                podfilelist=self.filedist[s][p]
                IDP=self.serverlist[s]
                #print(podfilelist, pod, IDP, email, self.password)
                distributor.putlistCSS(podfilelist, pod, IDP, email, self.password)

    def index(self):
        namespace="http://example.org/SOLID/"
        reprformat='turtle'
        for s in range(len(self.serverlist)):
            metaindexdata=''
            IDP = self.serverlist[s]
            print('indexing '+ IDP)
            #CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
            #CSSA.put_file(espressopod, 'espressoindex.csv', ' ', 'text/csv')
            #CSSA.makefileaccessible(espressopod, 'espressoindex.csv')
            for p in range(len(self.filedist[s])):
                pod=self.podname+str(p)
                print('indexing pod '+pod)
                email=pod+self.podemail
                CSSA=CSSaccess.CSSaccess(IDP, email, self.password)
                a=CSSA.create_authstring()
                #print(a)
                t=CSSA.create_authtoken()
                #print(t)
                podaddress=IDP+pod+'/'
                indexaddress=podaddress+self.podindexname
                d=brewmaster.crawl(podaddress, CSSA)
                print(d.keys())

                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=rdfindex.listindexer(d,namespace,reprformat)
                indexdata=index.__repr__()
                t=CSSA.put_file(pod, self.podindexname, indexdata, 'text/turtle')
                addstring=indexaddress+chr(13)+'\n'
                metaindexdata+=addstring
                
            CSSAe=CSSaccess.CSSaccess(IDP, self.espressoemail, self.password)
            a=CSSAe.create_authstring()
            t=CSSAe.create_authtoken()
            #with open('test.csv', 'w') as f:
            #    csv_writer = csv.writer(f)
            #    csv_writer.writerows(metaindexdata)
            #    f.close()
            #with open('test.csv', 'r') as f:
            #    metaindexdatastr=f.read()
            #    f.close()
            print(CSSAe.put_file(self.espressopodname, self.espressoindexfile, metaindexdata, 'text/csv'))
            

    
    def indexpub(self):
        for s in range(len(self.serverlist)):
            IDP = self.serverlist[s]
            print('opening indices for '+ IDP)
        #CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        #CSSA.put_file(espressopod, 'espressoindex.csv', ' ', 'text/csv')
        #CSSA.makefileaccessible(espressopod, 'espressoindex.csv')
            for p in range(len(self.filedist[s])):
                pod=self.podname+str(p)
                print('opening index for pod '+pod)
                email=pod+self.podemail
                CSSA=CSSaccess.CSSaccess(IDP, email, self.password)
                a=CSSA.create_authstring()

                t=CSSA.create_authtoken()
            
                res=CSSA.makefileaccessible(pod, self.podindexname)
                #res=CSSAccess.get_file(indexaddress+'.acl')
                print(res)
    
    def metaindexpub(self):
        for IDP in self.serverlist:
            print('Opening the metaindex for '+IDP)
            CSSA=CSSaccess.CSSaccess(IDP, self.espressoemail, self.password)
            a=CSSA.create_authstring()
            t=CSSA.create_authtoken()
            res=CSSA.makefileaccessible(self.espressopodname, self.espressoindexfile)
            print(res)

def experiment1():
    serverlist=['https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='espressoindex1.csv'
    podname='exp2pod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    numberofpods=20
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,1)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def stresstest():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='espressoindex2.csv'
    podname='stressdist'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    numberofpods=10
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def csvexp():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='csvtestindex.csv'
    podname='csvtest'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    numberofpods=5
    n=10
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp6s6p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s6p200f.csv'
    podname='exp_6s6p200fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=6
    n=200
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    #experiment.ESPRESSOcreate()
    #experiment.podcreate()
    #experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp1s1p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_1s1p200f.csv'
    podname='exp_1s1p200fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=1
    n=200
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    #experiment.ESPRESSOcreate()
    #experiment.podcreate()
    #experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp6s24p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s24p200f.csv'
    podname='exp_6s24p200fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=24
    n=200
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp1s24p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_1s24p200f.csv'
    podname='exp_1s24p200fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=24
    n=200
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp6s24p200fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s24p200fzipf.csv'
    podname='exp_6s24p200fzipfpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=24
    n=200
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp6s6p200fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s6p200fzipf.csv'
    podname='exp_6s6p200fzipfpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=6
    n=200
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp1s24p200fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_1s24p200fzipf.csv'
    podname='exp_1s24p200fzipfpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=24
    n=200
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()


def exp6s6p100f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s6p100f.csv'
    podname='exp_6s6p100fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    numberofpods=6
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp1s1p100f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_1s1p100f.csv'
    podname='exp_1s1p100fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    numberofpods=1
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp6s24p100f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s24p100f.csv'
    podname='exp_6s24p100fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    numberofpods=24
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp1s24p100f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_1s24p100f.csv'
    podname='exp_1s24p100fpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100FilesDuplicate'
    numberofpods=24
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp6s24p100fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s24p100fzipf.csv'
    podname='exp_6s24p100fzipfpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    numberofpods=24
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp6s6p100fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://cups1.ecs.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_6s6p100fzipf.csv'
    podname='exp_6s6p100fzipfpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    numberofpods=6
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def exp1s24p100fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='exp_1s24p100fzipf.csv'
    podname='exp_1s24p100fzipfpod'
    podemail='@example.org'
    podindexname='espressoindex.ttl'
    password='12345'
    sourcedir='/Users/yurysavateev/ESPRESSO/Archive/100Files'
    numberofpods=24
    n=100
    experiment=CSSexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexname=podindexname, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()


exp6s24p100f()

