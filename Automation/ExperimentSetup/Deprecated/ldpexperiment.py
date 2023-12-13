import Automation.ExperimentSetup.FileDistributor as FileDistributor, Automation.ExperimentSetup.distributor as distributor, dpop_utils, CSSaccess, Automation.ExperimentSetup.PodIndexer as PodIndexer, rdfindex
#import rdfindex
import os,sys,csv,re, math, random, shutil, requests, json, base64, urllib.parse, cleantext
#from solid_client_credentials import SolidClientCredentialsAuth, DpopTokenProvider
#from solid.auth import Auth
#from solid.solid_api import SolidAPI
#from solid.auth import (ClientAuthenticator, OIDCRegistrationResponse)
import ssl
import paramiko

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

class LDPexperiment:
    def __init__(self, serverlist, espressopodname='ESPRESSO',espressoemail='espresso@example.com',espressoindexfile='espressoindex.csv',podname='pod',podemail='@example.org',podindexdir='espressoindex/',password='12345'):
        self.serverlist = serverlist
        self.espressopodname=espressopodname
        self.espressoemail=espressoemail
        self.espressoindexfile=espressoindexfile
        self.podname=podname
        self.podindexdir=podindexdir
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
        exppodlist=FileDistributor.distribute(expfilelist,numberofpods, podzipf)
        #random.shuffle(exppodlist)
        self.filedist=FileDistributor.distribute(exppodlist, len(self.serverlist), serverzipf)
        print(self.filedist)

    def cleanuppod(self,IDP,pod):
        print('cleaning up pod '+pod+' at '+ IDP)
        email=pod+self.podemail
        CSSA=CSSaccess.CSSaccess(IDP, email, self.password)
        a=CSSA.create_authstring()
                #print(a)
        t=CSSA.create_authtoken()
                #print(t)
        #indexaddress=IDP+pod+'/'+self.podindexdir
        #print(CSSA.delete_file(indexadress))
        podaddress=IDP+pod+'/'
        d=PodIndexer.crawl(podaddress, CSSA)
        files=d.keys()
        print(files)
        for targetUrl in files:
            res=CSSA.delete_file(targetUrl)
            if not res.ok:
                CSSA.create_authtoken()
            

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
        for s in range(len(self.serverlist)):
            metaindexdata=''
            IDP = self.serverlist[s]
            print('indexing '+ IDP)
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
                indexaddress=podaddress+self.podindexdir
                d=PodIndexer.crawl(podaddress, CSSA)
                print(d.keys())

                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=PodIndexer.ldpindexdict(d)
                PodIndexer.uploadldpindex(index, pod, self.podindexdir, CSSA)
                addstring=indexaddress+'\r\n'
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
            
    def sshindex(self):
        for s in range(len(self.serverlist)):
            podnum=len(self.filedist[s])
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(server, username='ys1v22', password='')

                # Run the script on the server
            scriptaddress='/usr/local/ESPRESSO/Automation/ExperimentSetup/localindexer.py'
            command = f'python "{scriptaddress}" "{IDP}" "{self.espressoindexfile}" "{self.podname}" "{podnum}" "{self.podindexdir}"'
            stdin, stdout, stderr = ssh.exec_command(command)
            
    
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
                targetUrl=IDP+pod+'/'+self.podindexdir+'.acl'
                #print(targetUrl)
                headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
                res= requests.put(targetUrl,headers=headers,data=acldef)
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


def stresstest():
    serverlist=['http://localhost:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpespressoindex.csv'
    podname='ldppod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    numberofpods=5
    n=100
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()



def coffeefiltertest():
    searchres=PodIndexer.coffeefilter('http://localhost:3000/ESPRESSO/ldpespressoindex.csv', 'corona')
    for (filepath,freq) in searchres.items():
        print(filepath,freq)

def indexsizetest():
    serverlist=['http://localhost:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpespressoindex.csv'
    podname='ldppod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    numberofpods=5
    n=100
    sizes=[]
    indexfiles=[]
    indexsizes=[]
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    
    for s in range(len(experiment.serverlist)):
            metaindexdata=''
            IDP = experiment.serverlist[s]
            print('indexing '+ IDP)
            for p in range(len(experiment.filedist[s])):
                pod=experiment.podname+str(p)
                print('indexing pod '+pod)
                email=pod+experiment.podemail
                CSSA=CSSaccess.CSSaccess(IDP, email, experiment.password)
                a=CSSA.create_authstring()
                #print(a)
                t=CSSA.create_authtoken()
                #print(t)
                podaddress=IDP+pod+'/'
                indexaddress=podaddress+experiment.podindexdir
                d=PodIndexer.crawl(podaddress, CSSA)
                insize=0
                for (fi,te) in d.items():
                    insize=insize+len(fi)+len(te)
                sizes.append(insize)
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=PodIndexer.ldpindexdict(d)
                indexfiles.append(len(index.keys()))
                indexsizes.append(sys.getsizeof(index))
    print(sizes)
    print(indexfiles)
    print(indexsizes)

    for s in range(len(experiment.serverlist)):
            metaindexdata=''
            IDP = experiment.serverlist[s]
            print('indexing '+ IDP)
            for p in range(len(experiment.filedist[s])):
                pod=experiment.podname+str(p)
                print('indexing pod '+pod)
                email=pod+experiment.podemail
                CSSA=CSSaccess.CSSaccess(IDP, email, experiment.password)
                a=CSSA.create_authstring()
                #print(a)
                t=CSSA.create_authtoken()
                #print(t)
                podaddress=IDP+pod+'/'
                indexaddress=podaddress+experiment.podindexdir
                d=PodIndexer.crawl(podaddress, CSSA)
                insize=0
                for (fi,te) in d.items():
                    insize=insize+len(fi)+len(te)
                sizes.append(insize)
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=PodIndexer.ldpindexdict(d)
                indexfiles.append(len(index.keys()))
                indexsizes.append(sys.getsizeof(index))
    print(sizes)
    print(indexfiles)
    print(indexsizes)



def ldpexp1s24p100f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpexp1s24p100f.csv'
    podname='ldp1s24p100f'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100Files/'
    numberofpods=24
    n=100
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def ldpexp1s1p100f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpexp1s1p100f.csv'
    podname='ldp1s1p100f'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100Files/'
    numberofpods=1
    n=100
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def ldpexp1s1p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpexp1s1p200f.csv'
    podname='ldp1s1p200f'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100FilesDuplicate/'
    numberofpods=1
    n=200
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.index()
    experiment.indexpub()
    experiment.metaindexpub()

def ldpexp6s6p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://srv03812.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpexp6s6p200f.csv'
    podname='ldp6s6p200f'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100FilesDuplicate/'
    numberofpods=6
    n=200
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    #experiment.index()
    #experiment.indexpub()
    #experiment.metaindexpub()

def ldpexp6s6p200fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://srv03812.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpexp6s6p200fzipf.csv'
    podname='ldp6s6p200fzipf'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100FilesDuplicate/'
    numberofpods=6
    n=200
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    #experiment.index()
    #experiment.indexpub()
    #experiment.metaindexpub()

def ldpexp6s24p200fzipf():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://srv03812.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpexp6s24p200fzipf.csv'
    podname='ldp6s24p200fzipf'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100FilesDuplicate/'
    numberofpods=24
    n=200
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,1,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    #experiment.index()
    #experiment.indexpub()
    #experiment.metaindexpub()

def ldpexp6s24p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://srv03812.soton.ac.uk:3000/','https://cups2.ecs.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='ldpexp6s24p200f.csv'
    podname='ldp6s24p200f'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100FilesDuplicate/'
    numberofpods=24
    n=200
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    #experiment.index()
    #experiment.indexpub()
    #experiment.metaindexpub()

def extraldpexp6s24p200f():
    serverlist=['https://cupsa.ecs.soton.ac.uk:3000/','https://srv03812.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/','https://cups3.ecs.soton.ac.uk:3000/','https://cups4.ecs.soton.ac.uk:3000/','https://cups5.ecs.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='newldpexp6s24p200f.csv'
    podname='newldp6s24p200f'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='../../Datasets/100FilesDuplicate/'
    numberofpods=24
    n=200
    experiment=LDPexperiment(serverlist,espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loaddir(sourcedir)
    experiment.logicaldist(n,numberofpods,0,0)
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    #experiment.index()
    #experiment.indexpub()
    #experiment.metaindexpub()

extraldpexp6s24p200f()

