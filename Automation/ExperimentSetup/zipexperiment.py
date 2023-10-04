import filesorter, dpop_utils, CSSaccess, brewmaster, scpuploader,zipdistribute
import os,csv,re, random, shutil, requests, json, base64, urllib.parse, cleantext
from rdflib import URIRef, BNode, Literal, Graph, Namespace
from math import floor
import threading
import time, tqdm, getpass
import concurrent.futures
import paramiko
from paramiko import SSHClient
from scp import SCPClient
from zipfile import ZipFile
from sys import argv

serverlistglobal=['https://srv03812.soton.ac.uk:3000/',
                    'https://srv03813.soton.ac.uk:3000/',
                    'https://srv03814.soton.ac.uk:3000/',
                    'https://srv03815.soton.ac.uk:3000/',
                    'https://srv03816.soton.ac.uk:3000/',
                    'https://srv03911.soton.ac.uk:3000/',
                    'https://srv03912.soton.ac.uk:3000/',
                    'https://srv03913.soton.ac.uk:3000/',
                    'https://srv03914.soton.ac.uk:3000/',
                    'https://srv03915.soton.ac.uk:3000/',
                    'https://srv03916.soton.ac.uk:3000/',
                    'https://srv03917.soton.ac.uk:3000/',
                    'https://srv03918.soton.ac.uk:3000/',
                    'https://srv03919.soton.ac.uk:3000/',
                    'https://srv03920.soton.ac.uk:3000/',
                    'https://srv03921.soton.ac.uk:3000/',
                    'https://srv03922.soton.ac.uk:3000/',
                    'https://srv03923.soton.ac.uk:3000/',
                    'https://srv03924.soton.ac.uk:3000/',
                    'https://srv03925.soton.ac.uk:3000/',
                    'https://srv03926.soton.ac.uk:3000/',
                    'https://srv03927.soton.ac.uk:3000/',
                    'https://srv03928.soton.ac.uk:3000/',
                    'https://srv03929.soton.ac.uk:3000/',
                    'https://srv03930.soton.ac.uk:3000/',
                    'https://srv03931.soton.ac.uk:3000/',
                    'https://srv03932.soton.ac.uk:3000/',
                    'https://srv03933.soton.ac.uk:3000/',
                    'https://srv03934.soton.ac.uk:3000/',
                    'https://srv03935.soton.ac.uk:3000/',
                    'https://srv03936.soton.ac.uk:3000/',
                    'https://srv03937.soton.ac.uk:3000/',
                    'https://srv03938.soton.ac.uk:3000/',
                    'https://srv03939.soton.ac.uk:3000/',
                    'https://srv03940.soton.ac.uk:3000/',
                    'https://srv03941.soton.ac.uk:3000/',
                    'https://srv03942.soton.ac.uk:3000/',
                    'https://srv03943.soton.ac.uk:3000/',
                    'https://srv03944.soton.ac.uk:3000/',
                    'https://srv03945.soton.ac.uk:3000/',
                    'https://srv03946.soton.ac.uk:3000/',
                    'https://srv03947.soton.ac.uk:3000/',
                    'https://srv03948.soton.ac.uk:3000/',
                    'https://srv03949.soton.ac.uk:3000/',
                    'https://srv03950.soton.ac.uk:3000/',
                    'https://srv03951.soton.ac.uk:3000/',
                    'https://srv03952.soton.ac.uk:3000/',
                    'https://srv03953.soton.ac.uk:3000/',
                    'https://srv03954.soton.ac.uk:3000/',
                    'https://srv03955.soton.ac.uk:3000/'
                    ]

def returnaclopen(fileaddress,webidlist):
    webidstring='<'+'>,<'.join(webidlist)+'>'
    acltext='''@prefix : <#>.
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
acl:mode acl:Read;
acl:agentClass foaf:Agent;
acl:agent '''+webidstring+'''.
'''
    return acltext

def returnacldefault(fileaddress,webidlist):
    webidstring='<'+'>,<'.join(webidlist)+'>'
    acltext='''@prefix : <#>.
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
acl:mode acl:Read;
 acl:agent '''+webidstring+'''.
'''
    return acltext

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

class ESPRESSOexperiment:
    def __init__(self, 
        podname,
        localdir,
        espressopodname='ESPRESSO',
        espressoemail='espresso@example.com',
        podemail='@example.org',
        podindexdir='espressoindex/',
        password='12345'):
        self.SSHUser= input('Username:')
        self.SSHpassword = getpass.getpass()
        self.serverlist = []
        self.localimage=localdir+podname+'/'
        self.espressopodname=espressopodname
        self.espressoemail=espressoemail
        self.espressoindexfile=podname+'metaindex.csv'
        self.podname=podname
        self.podindexdir=podindexdir
        self.podemail=podemail
        self.password=password
        self.podnum=0
        self.filelist=[]
        self.openfilelist=[]
        self.forbidden=["setup"]
        self.namespace=Namespace("http://example.org/SOLIDindex/")
        self.image=Graph()
        
    def __repr__(self):
        """
        Return image in the turtle formal. 
        """
        return self.image.serialize(format='turtle')
    
    

    def loaddir(self,datasource):
        n=len(self.filelist)
        pbar=tqdm.tqdm(total=len(os.listdir(datasource)),desc='files loaded:')
        for filename in os.listdir(datasource):
            filepath = os.path.join(datasource, filename)
            # checking if it is a file
            if os.path.isfile(filepath) and not filename.startswith('.'):
                fword='F'+str(n)
                n=n+1
                fnode=BNode(fword)
                self.image.add((fnode,self.namespace.Type,self.namespace.File))
                self.image.add((fnode,self.namespace.LocalAddress,Literal(filepath)))
                self.image.add((fnode,self.namespace.Filename,Literal(filename)))
                filetype='text/plain'
                self.image.add((fnode,self.namespace.Filetype,Literal(filetype)))
                self.image.add((fnode,self.namespace.Uploaded,Literal('N')))
                self.filelist.append(fnode)
                pbar.update(1)
        pbar.close()
                
                
    def loadserverlist(self,serverlist):
        n=len(self.serverlist)
        for s in serverlist:
            sword='S'+str(n)
            n=n+1
            snode=BNode(sword)
            eword='E'+sword
            enode=BNode(eword)
            self.image.add((snode,self.namespace.Type,self.namespace.Server))
            IDP=s
            self.image.add((snode,self.namespace.Address,Literal(IDP)))
            register_endpoint=IDP+'idp/register/'
            self.image.add((snode,self.namespace.RegisterEndpoint,Literal(register_endpoint)))
            self.image.add((snode,self.namespace.ContainsEspressoPod,enode))
            esppod=IDP+self.espressopodname
            self.image.add((enode,self.namespace.Type,self.namespace.EspressoPod))
            self.image.add((enode,self.namespace.Address,Literal(esppod)))
            self.image.add((enode,self.namespace.Name,Literal(self.espressopodname+'/')))
            metaindexaddress=esppod+'/'+self.espressoindexfile
            self.image.add((enode,self.namespace.MetaindexAddress,Literal(metaindexaddress)))

            #self.image.add((snode,self.namespace.Sword,Literal(self.localimage+sword)))
            self.image.add((snode,self.namespace.LocalAddress,Literal(self.localimage+sword)))
            self.serverlist.append(snode)
        

    def logicaldist(self, numberofpods,poddisp,serverdisp):
        self.podnum=numberofpods
        #print(expfilelist)
        exppodlist=filesorter.normaldistribute(self.filelist,numberofpods, poddisp)
        #print(exppodlist)
        #random.shuffle(exppodlist)
        filedist=filesorter.distribute(exppodlist, len(self.serverlist), serverdisp)
        #print(self.filedist)
        pbar=tqdm.tqdm(total=len(self.filelist),desc='files distributed:')
        for s in range(len(self.serverlist)):
            snode=self.serverlist[s]
            sword=str(self.image.value(snode,self.namespace.LocalAddress))
            IDP=str(self.image.value(snode,self.namespace.Address))
            for p in range(len(filedist[s])):
                pword=sword+'P'+str(p)
                podname=self.podname+str(p)
                pnode=BNode(pword)
                self.image.add((pnode,self.namespace.Type,self.namespace.Pod))
                self.image.add((snode,self.namespace.Contains,pnode))
                self.image.add((pnode,self.namespace.Name,Literal(podname)))
                podaddress=IDP+podname+'/'
                self.image.add((pnode,self.namespace.Address,Literal(podaddress)))
                podindexaddress=podaddress+self.podindexdir
                self.image.add((pnode,self.namespace.IndexAddress,Literal(podindexaddress)))
                podemail=podname+self.podemail
                self.image.add((pnode,self.namespace.Email,Literal(podemail)))
                webid=podaddress+'profile/card#me'
                self.image.add((pnode,self.namespace.WebID,Literal(webid)))
                self.image.add((pnode,self.namespace.LocalAddress,Literal(sword+'/'+podname+'.zip')))
                self.image.add((pnode,self.namespace.LocalIndexAddress,Literal(sword+'/'+podname+'.index.zip')))
                for fnode in filedist[s][p]:
                    self.image.add((pnode,self.namespace.Contains,fnode))
                    filename=str(self.image.value(fnode,self.namespace.Filename))
                    fileaddress=podaddress+filename
                    self.image.add((fnode,self.namespace.Address,Literal(fileaddress)))
                    pbar.update(1)
        pbar.close()
                    
    
    def imagineaclnormal(self,openperc,numofwebids,mean, disp):
        anodelist=[]

        for i in range(numofwebids):
            aword='A'+str(i)
            anode=BNode(aword)
            webid='mailto:agent'+str(i)+'@example.org'
            self.image.add((anode,self.namespace.WebID,Literal(webid)))
            anodelist.append(anode)

        

        openn=floor(len(self.filelist)*(openperc/100))
        self.openfilelist=random.sample(self.filelist, openn)
        for fnode in self.openfilelist:
            self.image.add((fnode,self.namespace.Type,self.namespace.OpenFile))

        pbar=tqdm.tqdm(total=len(self.filelist),desc='acls:')
        for fnode in self.filelist:
            if disp==0:
                n=mean
            else:
                n=floor(numpy.random.normal(mean,disp*mean))
                if n<=1:
                    n=1
                if n>len(anodelist):
                    n=len(anodelist)
            accanodelist=random.sample(anodelist, n)
            #print(fnode,n)
            for anode in accanodelist:
                self.image.add((fnode,self.namespace.AccessibleBy,anode))
            pbar.update(1)
        pbar.close()
    
    def imagineaclspecial(self,percs):
        sanodelist=[]
        for i in range(len(percs)):
            saword='SA'+str(i)
            sanode=BNode(saword)
            webid='mailto:sagent'+str(i)+'@example.org'
            self.image.add((sanode,self.namespace.WebID,Literal(webid)))
            self.image.add((sanode,self.namespace.Power,Literal(str(percs[i]))))
            sanodelist.append(sanode)

        

        for sanode in sanodelist:
            n=floor(len(self.filelist)*(int(self.image.value(sanode,self.namespace.Power))/100))
            chfilelist=random.sample(self.filelist, n)
            print('sanode',n)
            pbar=tqdm.tqdm(total=n,desc='special acl:')
            for fnode in chfilelist:
                self.image.add((fnode,self.namespace.AccessibleBy,sanode))
                pbar.update(1)
            pbar.close()


    def saveexp(self,filename):
        with open(filename, 'w') as f:
            f.write(repr(self))
            f.close()


    def loadexp(self,filename):
        g=Graph()
        g.parse(filename)
        self.image=g
        self.SSHUser= input('Username:')
        self.SSHpassword = getpass.getpass()
        self.serverlist = []
        self.filelist=[]
        self.openfilelist=[]
        self.namespace=Namespace("http://example.org/SOLIDindex/")
        self.image=Graph()
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            self.serverlist.append(snode)
        for fnode in self.image.subjects(self.namespace.Type,self.namespace.File):
            self.filelist.append(fnode)
        for fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
            self.openfilelist.append(fnode)

                    
    def ESPRESSOcreate(self):
        for snode in self.serverlist:
            IDP=str(self.image.value(snode,self.namespace.Address))
            enode=self.image.value(snode,self.namespace.ContainsEspressoPod)
            esppodaddress=self.image.value(enode,self.namespace.Address)
            res =CSSaccess.get_file(esppodaddress)
            if not res.ok:
                print('Creating the ESPRESSO pod')
                register_endpoint = str(self.image.value(snode,self.namespace.RegisterEndpoint))
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
                print(CSSA.get_file(esppodaddress))
            else:
                print('ESPRESSO pod is present at '+IDP+self.espressopodname+'/')

    
    def podcreate(self):
        for snode in self.serverlist:
            IDP=str(self.image.value(snode,self.namespace.Address))
            register_endpoint = str(self.image.value(snode,self.namespace.RegisterEndpoint))
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                
                res=CSSaccess.get_file(podaddress)
                if not res.ok:
                    print('Creating '+podname+ 'at'+IDP)
                    email=str(self.image.value(pnode,self.namespace.Email))
                    res1 = requests.post(
                        register_endpoint,
                        json={
                            "createWebId": "on",
                            "webId": "",
                            "register": "on",
                            "createPod": "on",
                            "podName": podname,
                            "email": email,
                            "password": self.password,
                            "confirmPassword": self.password,
                        },
                        timeout=5000,
                    )
                    print(res1)
                else:
                    print('Pod '+podname+ ' at '+IDP +' exists.')
                    self.cleanuppod(snode, pnode)

    
    def storelocalfileszip(self):
        os.makedirs(self.localimage,exist_ok=True)
        pbar=tqdm.tqdm(len(self.filelist))
        for snode in self.serverlist:
            serdir=str(self.image.value(snode,self.namespace.LocalAddress))
            os.makedirs(serdir,exist_ok=True)
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podzipfile=str(self.image.value(pnode,self.namespace.LocalAddress))
                with ZipFile(podzipfile, 'w') as podzip:
                    for fnode in self.image.objects(pnode,self.namespace.Contains):
                        targetUrl=str(self.image.value(fnode,self.namespace.Address))
                        filetype=str(self.image.value(fnode,self.namespace.Filetype))
                        filename=str(self.image.value(fnode,self.namespace.Filename))
                        f=str(self.image.value(fnode,self.namespace.LocalAddress))
                        file = open(f, "rb")
                        filetext=file.read().decode('latin1')
                        file.close()
                        podzip.writestr(filename,filetext)
                        webidlist=[]
                        for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                            webid=str(self.image.value(anode,self.namespace.WebID))
                            webidlist.append(webid)
                        webidstring='<'+'>,<'.join(webidlist)+'>'
                        if fnode in self.openfilelist:
                            acltext=returnaclopen(targetUrl,webidlist)
                        else:
                            acltext=returnacldefault(targetUrl,webidlist)
                        flocacl=filename+'.acl'
                        podzip.writestr(flocacl,acltext)
                        pbar.update(1)
                        #ftrunc=targetUrl[len(podaddress):]
                        #filetuples.append((ftrunc,filetext,webidlist))
        pbar.close()
    
    def storelocalindexzip(self):
        os.makedirs(self.localimage,exist_ok=True)
        for snode in self.serverlist:
            serdir=str(self.image.value(snode,self.namespace.LocalAddress))
            os.makedirs(serdir,exist_ok=True)
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podzipindexfile=str(self.image.value(pnode,self.namespace.LocalIndexAddress))
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                filetuples=[]
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                        targetUrl=str(self.image.value(fnode,self.namespace.Address))
                        filetype=str(self.image.value(fnode,self.namespace.Filetype))
                        filename=str(self.image.value(fnode,self.namespace.Filename))
                        f=str(self.image.value(fnode,self.namespace.LocalAddress))
                        file = open(f, "rb")
                        filetext=file.read().decode('latin1')
                        file.close()
                        webidlist=[]
                        for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                            webid=str(self.image.value(anode,self.namespace.WebID))
                            webidlist.append(webid)
                        #webidstring='<'+'>,<'.join(webidlist)+'>'
                        if fnode in self.openfilelist:
                            acltext=returnaclopen(targetUrl,webidlist)
                        else:
                            acltext=returnacldefault(targetUrl,webidlist)
                        ftrunc=targetUrl[len(podaddress):]
                        filetuples.append((ftrunc,filetext,webidlist))
                index=brewmaster.aclindextupleswebidnew(filetuples)
                n=len(index.keys())
                pbar = tqdm.tqdm(total=n,desc=podzipindexfile)
                with ZipFile(podzipindexfile, 'w') as podindexzip:
                    for (name,body) in index.items():
                        podindexzip.writestr(name,body)
                        pbar.update(1)
                pbar.close()
    
    
    

    

    

    def aclmetaindex(self):  
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            metaindexdata=''
            
            for pnode in self.image.objects(snode,self.namespace.Contains):
                indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                addstring=indexaddress+'\r\n'
                metaindexdata+=addstring    
                
            CSSAe=CSSaccess.CSSaccess(IDP, self.espressoemail, self.password)
            a=CSSAe.create_authstring()
            t=CSSAe.create_authtoken()
            print(CSSAe.put_file(self.espressopodname, self.espressoindexfile, metaindexdata, 'text/csv'))
           
    
    def indexpub(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            print('opening indices for '+ IDP)
        #CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        #CSSA.put_file(espressopod, 'espressoindex.csv', ' ', 'text/csv')
        #CSSA.makefileaccessible(espressopod, 'espressoindex.csv')
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podindexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                CSSA.create_authstring()
                CSSA.create_authtoken()
                
                
                #print(acldef)
                targetUrl=podindexaddress+'.acl'
                #print(targetUrl)
                headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
                res= requests.put(targetUrl,headers=headers,data=acldef)
                #res=CSSAccess.get_file(indexaddress+'.acl')
                print(targetUrl,res)
    
    def metaindexpub(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            print('Opening the metaindex for '+IDP)
            CSSA=CSSaccess.CSSaccess(IDP, self.espressoemail, self.password)
            a=CSSA.create_authstring()
            t=CSSA.create_authtoken()
            res=CSSA.makefileaccessible(self.espressopodname, self.espressoindexfile)
            print(res)

    def distributezips(self,targetdir='/srv/espresso/'):
        #serverlist=[a.rsplit('/')[-2].rsplit(':')[0] for a in serverlistglobal]

        #print(serverlist)
        i=0
        for snode in self.serverlist:
            server=str(self.image.value(snode,self.namespace.Address)).rsplit('/')[-2].rsplit(':')[0]
            print('Uploading',server)
            client = SSHClient()
        #client.load_system_host_keys()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh = SSHClient()
            client.load_system_host_keys()    
            client.connect(server, port=22, username=self.SSHUser, password=self.SSHpassword)
            scp = SCPClient(client.get_transport())
            sdir=str(self.image.value(snode,self.namespace.LocalAddress))
            scpuploader.serverscpupload(scp,sdir)

def distributezips(self,targetdir='/srv/espresso/'):
        serverlist=[a.rsplit('/')[-2].rsplit(':')[0] for a in serverlistglobal]

        #print(serverlist)
        i=0
        for snode in serverlist:

            server=str(self.image.value(snode,self.namespace.Address)).rsplit('/')[-2].rsplit(':')[0]
            print('Uploading',server)
            client = SSHClient()
        #client.load_system_host_keys()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            #ssh = SSHClient()
            client.load_system_host_keys()    
            client.connect(server, port=22, username=self.SSHUser, password=self.SSHpassword)
            scp = SCPClient(client.get_transport())
            sdir=str(self.image.value(snode,self.namespace.LocalAddress))
            #scpuploader.serverscpupload(scp,sdir)
            filelist=next(os.walk(sdir))[2]
            print(filelist)
            pbar=tqdm.tqdm(len(filelist),server)
            for filename in filelist:
                        #print('sending',sdir+filename,'to',targetdir,'at',server)
                        scp.put(sdir+filename,targetdir)
                        pbar.update(1)
            pbar.close()

            client.close()
            scp.close()
            #with SSHClient() as client:
            #    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            #    client.load_system_host_keys()
            #    client.connect(server, port=22, username=self.SSHUser, password=self.SSHpassword)

            #    with SCPClient(client.get_transport()) as scp:
            #        sdir=str(self.image.value(snode,self.namespace.LocalAddress))
            #        print(sdir)
            #        filelist=next(os.walk(sdir))[2]
            #        print(filelist)
            #        pbar=tqdm.tqdm(len(filelist))
            #        for filename in filelist:
                        #print('sending',sdir+filename,'to',targetdir,'at',server)
            #            scp.put(sdir+filename,targetdir)
                        #scpuploader.serverscpupload(scp,sdir,targetdir)




def stresstest():
    serverlist=['http://localhost:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='aclespressoindex.csv'
    podname='webidpod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    expsavedir='/Users/yurysavateev'
    numberofpods=5
    n=10
    openperc=10
    numofwebids=10
    mean=3
    disp=0
    percs=[100,50,25]
    experiment=ESPRESSOexperiment(podname=podname,localdir='/Users/yurysavateev/')
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    experiment.imagineaclnormal(openperc,numofwebids,mean, disp)
    experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.storelocalfileszip()
    experiment.storelocalindexzip()
    #experiment.storeexplocal(expsavedir+'/'+podname)
    experiment.saveexp(experiment.localimage+podname+'.ttl')
    print('experiment saved')
    #experiment.loadexp('webidtest.ttl')
    #experiment.ESPRESSOcreate()
    #experiment.podcreate()
    #experiment.upload()
    #experiment.aclindexwebidnewthreaded()
    #experiment.indexpub()
    #experiment.metaindexpub()
    #experiment.indexfixerwebidnew()
    #print('indices checked')

def experimenttemplate():
    #list of servers in the experiment:
    serverlist=serverlistglobal
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='50s50p2500fpodnew'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/dataset5'
    #total number of pods
    numberofpods=50
    #total number of files
    n=2500
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=10
    #number of agents
    numofwebids=50
    #on average how many webids can read a given file
    mean=10
    #relative deviation of the previous, can be left 0
    disp=0
    #how many files on average a webid can read
    medsizeacl=500
    #how many files a low access webid can read
    lowsizeacl=100
    #initializing the experiment
    experiment=ESPRESSOexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(n,numberofpods,0,0)
    print('files distributed')
    experiment.imaginefiles()
    print('files imagined')
    experiment.imagineaclperc(percs,openperc,numofwebids,mean,disp)
    print('files acl imagined')
    experiment.saveexp(podname+'exp.ttl')
    print('experiment saved')
    #experiment.loadexp(podname+'exp.ttl')
    experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    experiment.upload()
    print('Pods populated')
    experiment.aclindexwebidnewthreaded()
    print('pods indexed')
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    experiment.indexfixerwebidnew()
    print('indices checked')

def new50s50p100f():
    #list of servers in the experiment:
    serverlist=serverlistglobal
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='new50s50p100f'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/2500000F5MB'
    #directory where to save the experiment
    expsavedir='/Users/yurysavateev'
    #total number of pods
    numberofpods=2500
    #total number of files
    n=2500000
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=5000
    #on average how many webids can read a given file
    mean=10
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname,localdir='/Users/yurysavateev/')
    #experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    print('files loaded')
    #experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    #experiment.imagineaclnormal(openperc,numofwebids,mean, disp)
    #experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.storelocalfileszip()
    experiment.storelocalindexzip()
    #experiment.storeexplocal(expsavedir+'/'+podname)
    experiment.saveexp(experiment.localimage+podname+'.ttl')
    print('experiment saved')
    
    #experiment.storeexplocal(expsavedir+'/'+podname)
    experiment.loadexp(experiment.localimage+podname+'.ttl')
    #print('experiment loaded')
    experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    experiment.distributezips()

def zipexperiment(podname,firstserver,lastserver,sourcedir,expsavedir, numberofpods, n):
    #list of servers in the experiment:
    serverlist=serverlistglobal[firstserver:lastserver+1]
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    #podname='new50s50p100f'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    #sourcedir='/Users/yurysavateev/2500000F5MB'
    #directory where to save the experiment
    #expsavedir='/Users/yurysavateev'
    #total number of pods
    #numberofpods=2500
    #total number of files
    #n=2500000
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=5000
    #on average how many webids can read a given file
    mean=10
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname,localdir=expsavedir)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    experiment.imagineaclnormal(openperc,numofwebids,mean, disp)
    experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.storelocalindexzip()
    experiment.storelocalfileszip()
    
    #experiment.saveexp(experiment.localimage+podname+'.ttl')
    print('experiment saved')
    
    
    #experiment.loadexp(experiment.localimage+podname+'.ttl')
    #print('experiment loaded')
    experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    zipdistribute.zipdistribute(serverlist,experiment.localimage,experiment.SSHUser,experiment.SSHpassword)


podname=argv[1]
firstserver=argv[2]
lastserver=argv[3]
sourcedir=argv[4]
expsavedir=argv[5]
numberofpods=argv[6]
n=argv[7]

zipexperiment(podname,int(firstserver),int(lastserver),sourcedir,expsavedir, int(numberofpods), int(n))
