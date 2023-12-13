import Automation.ExperimentSetup.FileDistributor as FileDistributor, distributor, dpop_utils, CSSaccess, Automation.ExperimentSetup.PodIndexer as PodIndexer
import os,sys,csv,re, random, shutil, requests, json, base64, urllib.parse, cleantext, numpy
from rdflib import URIRef, BNode, Literal, Graph, Namespace
from math import floor
import threading
import time, tqdm, getpass
import concurrent.futures
import paramiko
from paramiko import SSHClient
from scp import SCPClient


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

def returndaclopen(fileaddress,webidlist):
    webidstring='<'+'>,<'.join(webidlist)+'>'
    acltext='''@prefix : <'''+fileaddress+'''.acl#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <http://localhost:3000/webidpod1/profile/card#>.

<#ControlReadWrite> a acl:Authorization;
    acl:accessTo <'''+fileaddress+'''>;
    acl:agent c:me;
    acl:mode acl:Control, acl:Read, acl:Write.
<#Read> a acl:Authorization;
    acl:accessTo <'''+fileaddress+'''>;
    acl:mode acl:Read;
    acl:agentClass foaf:Agent;
    acl:agent '''+webidstring+'''.
'''
    return acltext

def returnacldefault(fileaddress,webidlist):
    webidstring='<'+'>,<'.join(webidlist)+'>'
    acltext='''@prefix : <'''+fileaddress+'''.acl#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <http://localhost:3000/webidpod1/profile/card#>.

<#ControlReadWrite> a acl:Authorization;
    acl:accessTo <'''+fileaddress+'''>;
    acl:agent c:me;
    acl:mode acl:Control, acl:Read, acl:Write.
<#Read> a acl:Authorization;
    acl:accessTo <'''+fileaddress+'''>;
    acl:mode acl:Read;
    acl:agent '''+webidstring+'''.
'''
    return acltext

class ESPRESSOexperiment:
    def __init__(self, 
        espressopodname='ESPRESSO',
        espressoemail='espresso@example.com',
        podname='pod',
        podemail='@example.org',
        podindexdir='espressoindex/',
        password='12345'):
        self.serverlist = []
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
            self.serverlist.append(snode)
        

    def logicaldist(self, numberofpods,poddisp,serverdisp):
        self.podnum=numberofpods
        #print(expfilelist)
        exppodlist=FileDistributor.normaldistribute(self.filelist,numberofpods, poddisp)
        #print(exppodlist)
        #random.shuffle(exppodlist)
        filedist=FileDistributor.distribute(exppodlist, len(self.serverlist), serverdisp)
        #print(self.filedist)
        pbar=tqdm.tqdm(total=len(self.filelist),desc='files distributed:')
        for s in range(len(self.serverlist)):
            snode=self.serverlist[s]
            sword=str(snode)
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

    def cleanuppod(self,snode,pnode):
        IDP=str(self.image.value(snode,self.namespace.Address))
        podname=str(self.image.value(pnode,self.namespace.Name))
        print('cleaning up pod '+podname+' at '+ IDP)
        email=str(self.image.value(pnode,self.namespace.Email))
        CSSA=CSSaccess.CSSaccess(IDP, email, self.password)
        a=CSSA.create_authstring()
                #print(a)
        t=CSSA.create_authtoken()
                #print(t)
        #indexaddress=IDP+pod+'/'+self.podindexdir
        #print(CSSA.delete_file(indexadress))
        podaddress=str(self.image.value(pnode,self.namespace.Address))
        d=PodIndexer.crawl(podaddress, CSSA)
        files=d.keys()
        pbar=tqdm.tqdm(len(files))
        for targetUrl in files:
            res=CSSA.delete_file(targetUrl)
            if not res.ok:
                CSSA.create_authtoken()
            pbar.update(1)
        pbar.close()
            
#    def uploadpnode(self,pnode):
#        podaddress=str(self.image.value(pnode,self.namespace.Address))
#        podname=str(self.image.value(pnode,self.namespace.Name))
#        USERNAME=str(self.image.value(pnode,self.namespace.Email))
#        PASSWORD=self.password
#        CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
#        CSSA.create_authstring()
#        CSSA.create_authtoken()
#        pnodefilelist=[]
#        print('populating',podaddress)
#        for fnode in self.image.objects(pnode,self.namespace.Contains):
#            targetUrl=str(self.image.value(fnode,self.namespace.Address))
#            filetype=str(self.image.value(fnode,self.namespace.Filetype))
#            filename=str(self.image.value(fnode,self.namespace.Filename))
#            f=str(self.image.value(fnode,self.namespace.LocalAddress))
#            file = open(f, "rb")
#            filetext=file.read().decode('latin1')
#            file.close()
#            res=CSSA.put_url(targetUrl, filetext, filetype)
#            if not res.ok:
#                print(res)
#                continue
#            if fnode in self.openfilelist:
#                CSSA.makefileaccessible(podname,filename)
#            else:
#               res=CSSA.adddefaultacl(targetUrl)
#           webidlist=[]
#            for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
#                webid=str(self.image.value(anode,self.namespace.WebID))
#                webidlist.append(webid)
#            CSSA.addreadrights(targetUrl,webidlist)

    def upload(self):
        for snode in self.serverlist:
            IDP=str(self.image.value(snode,self.namespace.Address))
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                CSSA.create_authstring()
                CSSA.create_authtoken()
                pnodefilelist=[]
                print('populating',podaddress)
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                    targetUrl=str(self.image.value(fnode,self.namespace.Address))
                    filetype=str(self.image.value(fnode,self.namespace.Filetype))
                    filename=str(self.image.value(fnode,self.namespace.Filename))
                    f=str(self.image.value(fnode,self.namespace.LocalAddress))
                    file = open(f, "rb")
                    filetext=file.read().decode('latin1')
                    file.close()
                    res=CSSA.put_url(targetUrl, filetext, filetype)
                    if not res.ok:
                        print(res)
                        continue
                    if fnode in self.openfilelist:
                        CSSA.makefileaccessible(podname,filename)
                    else:
                        res=CSSA.adddefaultacl(targetUrl)
                    webidlist=[]
                    for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                        webid=str(self.image.value(anode,self.namespace.WebID))
                        webidlist.append(webid)
                    CSSA.addreadrights(targetUrl,webidlist)


    def uploadpnodewithbar(self,pnode,IDP):
        podaddress=str(self.image.value(pnode,self.namespace.Address))
        podname=str(self.image.value(pnode,self.namespace.Name))
        USERNAME=str(self.image.value(pnode,self.namespace.Email))
        PASSWORD=self.password
        CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
        CSSA.create_authstring()
        CSSA.create_authtoken()
        pnodefilelist=[]
        for fnode in self.image.objects(pnode,self.namespace.Contains):
            pnodefilelist.append(fnode)
        n=len(pnodefilelist)
        print('populating',podaddress)
        pbar = tqdm.tqdm(total=n)
        for fnode in pnodefilelist:
            targetUrl=str(self.image.value(fnode,self.namespace.Address))
            filetype=str(self.image.value(fnode,self.namespace.Filetype))
            filename=str(self.image.value(fnode,self.namespace.Filename))
            f=str(self.image.value(fnode,self.namespace.LocalAddress))
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            file.close()
            res=CSSA.put_url(targetUrl, filetext, filetype)
            if not res.ok:
                print(res)
                continue
            pbar.update(1)
        pbar.close()

    def uploadwithbarsthreaded(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
            for snode in self.serverlist:
                IDP=str(self.image.value(snode,self.namespace.Address))
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    podaddress=str(self.image.value(pnode,self.namespace.Address))
                    USERNAME=str(self.image.value(pnode,self.namespace.Email))
                    PASSWORD=self.password
                    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                    CSSA.create_authstring()
                    CSSA.create_authtoken()
                    filetuplelist=[]
                    for fnode in self.image.objects(pnode,self.namespace.Contains):
                        targetUrl=str(self.image.value(fnode,self.namespace.Address))
                        filetype=str(self.image.value(fnode,self.namespace.Filetype))
                        f=str(self.image.value(fnode,self.namespace.LocalAddress))
                        filetuplelist.append((f,targetUrl,filetype))
                    executor.submit(distributor.uploadllistwithbar, filetuplelist,podaddress,CSSA)
    
    def uploadwithbars(self):
        #with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
            for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
                IDP=str(self.image.value(snode,self.namespace.Address))
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    self.uploadpnodewithbar(pnode,IDP)

    def uploadaclpnodewithbar(self,pnode,IDP):   
        podaddress=str(self.image.value(pnode,self.namespace.Address))
        podname=str(self.image.value(pnode,self.namespace.Name))
        USERNAME=str(self.image.value(pnode,self.namespace.Email))
        PASSWORD=self.password
        CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
        CSSA.create_authstring()
        CSSA.create_authtoken()
        pnodefilelist=[]
        for fnode in self.image.objects(pnode,self.namespace.Contains):
            pnodefilelist.append(fnode)
        n=len(pnodefilelist)
        print('populating acls in',podaddress)
        pbar = tqdm.tqdm(total=n)
        for fnode in self.image.objects(pnode,self.namespace.Contains):
                    targetUrl=str(self.image.value(fnode,self.namespace.Address))
                    filetype=str(self.image.value(fnode,self.namespace.Filetype))
                    filename=str(self.image.value(fnode,self.namespace.Filename))
                    if fnode in self.openfilelist:
                        CSSA.makefileaccessible(podname,filename)
                    else:
                        res=CSSA.adddefaultacl(targetUrl)
                    webidlist=[]
                    for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                        webid=str(self.image.value(anode,self.namespace.WebID))
                        webidlist.append(webid)
                    CSSA.addreadrights(targetUrl,webidlist)  
                    pbar.update(1)  
        pbar.close()     
                    

    def uploadaclthreaded(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
            for snode in self.serverlist:
                IDP=str(self.image.value(snode,self.namespace.Address))
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    podaddress=str(self.image.value(pnode,self.namespace.Address))
                    USERNAME=str(self.image.value(pnode,self.namespace.Email))
                    PASSWORD=self.password
                    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                    CSSA.create_authstring()
                    CSSA.create_authtoken()
                    filetuplelist=[]
                    for fnode in self.image.objects(pnode,self.namespace.Contains):
                        fileaddress=str(self.image.value(fnode,self.namespace.Address))
                        openfile= fnode in self.openfilelist
                        webidlist=[]
                        for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                            webid=str(self.image.value(anode,self.namespace.WebID))
                            webidlist.append(webid)
                        filetuplelist.append((fileaddress,openfile,webidlist))
                    executor.submit(distributor.uploadllistaclwithbar,filetuplelist,podaddress,CSSA)

    def uploadacl(self):
        self.openfilelist=[]
        for fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
            self.openfilelist.append(fnode)
        #with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
                IDP=str(self.image.value(snode,self.namespace.Address))
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    #executor.submit(self.uploadaclpnodewithbar, pnode)
                    self.uploadaclpnodewithbar(pnode,IDP)

    def storeexplocal(self,dir):
        os.makedirs(dir,exist_ok=True)
        i=0
        for snode in self.serverlist:
            serword='S'+str(i)
            i=i+1
            serdir=dir+'/'+serword
            os.makedirs(serdir,exist_ok=True)
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podname=str(self.image.value(pnode,self.namespace.Name))
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                poddir=serdir+'/'+podname
                os.makedirs(poddir,exist_ok=True)
                pnodefilelist=[]
                filetuples=[]
                print('populating',poddir)
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                    targetUrl=str(self.image.value(fnode,self.namespace.Address))
                    filetype=str(self.image.value(fnode,self.namespace.Filetype))
                    filename=str(self.image.value(fnode,self.namespace.Filename))
                    f=str(self.image.value(fnode,self.namespace.LocalAddress))
                    file = open(f, "rb")
                    filetext=file.read().decode('latin1')
                    file.close()
                    floc=poddir+'/'+filename
                    file = open (floc,'w')
                    file.write(filetext)
                    file.close
                    webidlist=[]
                    for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                        webid=str(self.image.value(anode,self.namespace.WebID))
                        webidlist.append(webid)
                    webidstring='<'+'>,<'.join(webidlist)+'>'
                    if fnode in self.openfilelist:
                        acltext=returndaclopen(targetUrl,webidlist)
                    else:
                        acltext=returnacldefault(targetUrl,webidlist)
                    flocacl=poddir+'/'+filename+'.acl'
                    file = open (flocacl,'w')
                    file.write(acltext)
                    file.close
                    ftrunc=targetUrl[len(podaddress):]
                    filetuples.append((ftrunc,filetext,webidlist))
                index=PodIndexer.aclindextupleswebidnew(filetuples)
                indexdir=poddir+'/'+self.podindexdir
                os.makedirs(indexdir,exist_ok=True)
                n=len(index.keys())
                pbar = tqdm.tqdm(total=n,desc=indexdir)
                for (name,body) in index.items():
                    targetf=indexdir+'/'+name
        #print(targetUrl,end=' ')
                    file = open (targetf,'w')
                    file.write(body)
                    file.close
                    pbar.update(1)
                pbar.close()

    def storeindexlocal(self,dir):
        i=0
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
                IDP=str(self.image.value(snode,self.namespace.Address))
                serword='S'+str(i)
                i=i+1
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    podaddress=str(self.image.value(pnode,self.namespace.Address))
                    podname=str(self.image.value(pnode,self.namespace.Name))
                    USERNAME=str(self.image.value(pnode,self.namespace.Email))
                    PASSWORD=self.password
                    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                    CSSA.create_authstring()
                    CSSA.create_authtoken()
                    d=PodIndexer.aclcrawlwebidnew(podaddress,podaddress, CSSA)
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    index=PodIndexer.aclindextupleswebidnew(d) 
                    filename=dir+'/'+serword+podname+'.locind'
                    with open(filename, 'w') as f:
                        f.write(str(index))
                        f.close()
                    print('Local index',filename,'stored')

    def uploadindexlocal(self,dir):
        i=0
        with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
            for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
                IDP=str(self.image.value(snode,self.namespace.Address))
                serword='S'+str(i)
                i=i+1
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    podaddress=str(self.image.value(pnode,self.namespace.Address))
                    podname=str(self.image.value(pnode,self.namespace.Name))
                    USERNAME=str(self.image.value(pnode,self.namespace.Email))
                    PASSWORD=self.password
                    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                    CSSA.create_authstring()
                    CSSA.create_authtoken()
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    filename=dir+'/'+serword+podname+'.locind'
                    f = open(filename, "r")
                    indexstr=f.read()
                    f.close()
                    index=eval(indexstr)
                    print('starting uploading',filename)
                    executor.submit(PodIndexer.uploadaclindexwithbar, index, indexaddress, CSSA)

    def aclindexwebidnewthreaded(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
        # submit tasks
            for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
                IDP=str(self.image.value(snode,self.namespace.Address))
                metaindexdata=''
            
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    podaddress=str(self.image.value(pnode,self.namespace.Address))
                    podname=str(self.image.value(pnode,self.namespace.Name))
                    USERNAME=str(self.image.value(pnode,self.namespace.Email))
                    PASSWORD=self.password
                    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                    CSSA.create_authstring()
                    CSSA.create_authtoken()
                    d=PodIndexer.aclcrawlwebidnew(podaddress,podaddress, CSSA)
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    index=PodIndexer.aclindextupleswebidnew(d)
                    executor.submit(PodIndexer.uploadaclindexwithbar, index, indexaddress, CSSA)
                    #brewmaster.uploadaclindex(index, indexaddress, CSSA)


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
           
    def indexfixerwebidnew(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            for pnode in self.image.objects(snode,self.namespace.Contains):
                
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                print("checking index of "+IDP+podname)
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                CSSA.create_authstring()
                CSSA.create_authtoken()
                indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                n=PodIndexer.indexchecker(indexaddress, CSSA)
                print('currently in index of' +IDP+podname +':' +str(len(n)))
                d=PodIndexer.aclcrawlwebidnew(podaddress, podaddress,CSSA)
                
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=PodIndexer.aclindextupleswebidnew(d)
                print('should be in index of ' +IDP+podname +':' +str(len(index.keys())))
                for f in n:
                    index.pop(f)
                #for f in self.forbidden:
                    #index.pop(f+'.ndx','no key')
                print("Difference?"+str(len(index.keys())))
                PodIndexer.uploadaclindexwithbar(index, indexaddress, CSSA)

    def indexfixerthreaded(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
            for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
                IDP=str(self.image.value(snode,self.namespace.Address))
                metaindexdata=''
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    podaddress=str(self.image.value(pnode,self.namespace.Address))
                    podname=str(self.image.value(pnode,self.namespace.Name))
                    USERNAME=str(self.image.value(pnode,self.namespace.Email))
                    PASSWORD=self.password
                    #addstring=indexaddress+'\r\n'
                    #metaindexdata+=addstring
                    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                    CSSA.create_authstring()
                    CSSA.create_authtoken()
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    n=PodIndexer.indexchecker(indexaddress, CSSA)
                    print('currently in index of' +IDP+podname +':' +str(len(n)))
                    d=PodIndexer.aclcrawl(podaddress, CSSA)
                    
                    #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                    index=PodIndexer.aclindextuples(d)
                    print('should be in index of' +IDP+podname +':' +str(len(index.keys())))
                    for f in n:
                        index.pop(f)
                    #for f in self.forbidden:
                        #index.pop(f+'.ndx','no key')
                    print("Difference?"+str(len(index.keys())))
                    #brewmaster.uploadaclindex(index, indexaddress, CSSA)
                    executor.submit(PodIndexer.uploadaclindex, index, indexaddress, CSSA)

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





def zipdistribute(sourcedir='/Users/yurysavateev/new50s50p100f/'):
    serverlist=[a.rsplit('/')[-2].rsplit(':')[0] for a in serverlistglobal[11:]]
    targetdir='/srv/espresso'
    user= input('Username:')
    password = getpass.getpass()

    print(serverlist)
    i=11
    for server in serverlist:
        print('Uploading',server)
        client = SSHClient()
        #client.load_system_host_keys()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        host = server                    #hard-coded
        port = 22
    
                       #hard-coded
                        #hard-coded
        ssh = SSHClient()
        client.load_system_host_keys()    
        client.connect(host, port=22, username=user, password=password)
        scp = SCPClient(client.get_transport())
        serword='S'+str(i)
        i=i+1
        sdir=sourcedir+serword+'/'
        print(sdir)
        filelist=next(os.walk(sdir))[2]
        for filename in filelist:
            print('sending',sdir+filename,'to',targetdir,'at',server)
            scp.put(sdir+filename,targetdir)


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
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    experiment.imagineaclnormal(openperc,numofwebids,mean, disp)
    experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.storeexplocal(expsavedir+'/'+podname)
    experiment.saveexp(expsavedir+'/'+podname+'/'+podname+'.ttl')
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


def indexpubmanual(podname):
        for IDP in serverlistglobal:
            print('opening indices for '+ IDP)
        #CSSA=CSSaccess.CSSaccess(IDP, espressoemail, password)
        #CSSA.put_file(espressopod, 'espressoindex.csv', ' ', 'text/csv')
        #CSSA.makefileaccessible(espressopod, 'espressoindex.csv')
            for i in range(50):
                thispodname=podname+str(i)
                podaddress=IDP+thispodname+'/'
                podindexaddress=podaddress+'espressoindex/'
                USERNAME=thispodname+'@example.org'
                PASSWORD='12345'
                print(USERNAME)
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
                targetUrl=podindexaddress+'.acl'
                print(targetUrl)
                #print(targetUrl)
                headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
                res= requests.put(targetUrl,headers=headers,data=acldef)
                #res=CSSAccess.get_file(indexaddress+'.acl')
                print(targetUrl,res)

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


def exp1S1P1000F800MB():
    #list of servers in the experiment:
    serverlist=serverlistglobal[:1]
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='exp1S1P1000F800MB'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/1000F811MB'
    #total number of pods
    numberofpods=1
    #total number of files
    n=1000
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=50
    #on average how many webids can read a given file
    mean=10
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname)
    #experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    print('files loaded')
    #experiment.logicaldist(n,numberofpods,0,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    #experiment.imagineaclperc(percs,openperc,numofwebids,mean,disp)
    print('files acl imagined')
    #experiment.saveexp(podname+'exp.ttl')
    print('experiment saved')
    experiment.loadexp(podname+'exp.ttl')
    #experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    #experiment.podcreate()
    print('Pods created')
    #experiment.upload()
    print('Pods populated')
    #experiment.aclindexwebidnewthreaded()
    print('pods indexed')
    #experiment.aclmetaindex()
    print('metaindices created')
    #experiment.indexpub()
    print('indices opened')
    #experiment.metaindexpub()
    print('metaindices opened')
    experiment.indexfixerwebidnew()
    print('indices checked')

def exp1S50P1000F1MBbar():
    #list of servers in the experiment:
    serverlist=serverlistglobal[:1]
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='exp1S50P1000F1MBbar'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/50000F50MB'
    #directory where to save the experiment
    expsavedir='/Users/yurysavateev'
    #total number of pods
    numberofpods=50
    #total number of files
    n=50000
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=50
    #on average how many webids can read a given file
    mean=10
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.storeexplocal(expsavedir+'/'+podname)
    experiment.saveexp(expsavedir+'/'+podname+'/'+podname+'.ttl')
    print('experiment saved')
    #experiment.loadexp(podname+'exp.ttl')
    print('experiment loaded')
    #experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    #experiment.podcreate()
    print('Pods created')
    #experiment.uploadwithbars()
    print('Pods populated')
    #experiment.uploadacl()
    print('Pods acls assigned')
    #experiment.aclindexwebidnewthreaded()
    #os.mkdir(podname)
    #experiment.storeindexlocal(podname)
    print('pods indexed')
    #experiment.uploadindexlocal(podname)
    print('indices uploaded')
    #experiment.aclmetaindex()
    print('metaindices created')
    #experiment.indexpub()
    print('indices opened')
    #experiment.metaindexpub()
    print('metaindices opened')
    #experiment.indexfixerwebidnew()
    print('indices checked')

def exp1S50P1000F5MBbar():
    #list of servers in the experiment:
    serverlist=serverlistglobal[:1]
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='exp1S50P1000F5MBbar'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/50000F250MB'
    #directory where to save the experiment
    expsavedir='/Users/yurysavateev'
    #total number of pods
    numberofpods=50
    #total number of files
    n=50000
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=50
    #on average how many webids can read a given file
    mean=10
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.storeexplocal(expsavedir+'/'+podname)
    experiment.saveexp(expsavedir+'/'+podname+'/'+podname+'.ttl')
    print('experiment saved')
    #experiment.loadexp(podname+'exp.ttl')
    print('experiment loaded')
    #experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    #experiment.podcreate()
    print('Pods created')
    #experiment.uploadwithbars()
    print('Pods populated')
    #experiment.uploadacl()
    print('Pods acls assigned')
    #experiment.aclindexwebidnewthreaded()
    #os.mkdir(podname)
    #experiment.storeindexlocal(podname)
    print('pods indexed')
    #experiment.uploadindexlocal(podname)
    print('indices uploaded')
    #experiment.aclmetaindex()
    print('metaindices created')
    #experiment.indexpub()
    print('indices opened')
    #experiment.metaindexpub()
    print('metaindices opened')
    #experiment.indexfixerwebidnew()
    print('indices checked')

def exp50S50P1000F5MBbar():
    #list of servers in the experiment:
    serverlist=serverlistglobal
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='exp50S50P1000F5MBbar'
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
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    #experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    #experiment.imagineaclspecial(percs)
    print('files acl imagined')
    #experiment.storeexplocal(expsavedir+'/'+podname)
    #experiment.saveexp(expsavedir+'/'+podname+'.ttl')
    print('experiment saved')
    #experiment.loadexp(expsavedir+'/'+podname+'.ttl')
    #experiment.storeexplocal(expsavedir+'/'+podname)
    print('experiment loaded')
    #experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    #experiment.podcreate()
    print('Pods created')
    #experiment.uploadwithbars()
    print('Pods populated')
    #experiment.uploadacl()
    print('Pods acls assigned')
    #experiment.aclindexwebidnewthreaded()
    #os.mkdir(podname)
    #experiment.storeindexlocal(podname)
    print('pods indexed')
    #experiment.uploadindexlocal(podname)
    print('indices uploaded')
    #experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    #experiment.metaindexpub()
    print('metaindices opened')
    #experiment.indexfixerwebidnew()
    print('indices checked')

def expmultithredtest():
    #list of servers in the experiment:
    serverlist=['https://srv04031.soton.ac.uk:3000/']
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='expmultithredtest'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/dataset2/'
    #directory where to save the experiment
    expsavedir='/Users/yurysavateev'
    #total number of pods
    numberofpods=10
    #total number of files
    n=100
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=20
    #on average how many webids can read a given file
    mean=5
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    print('files loaded')
    #experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    #experiment.imagineaclspecial(percs)
    #experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    print('files acl imagined')
    #experiment.storeexplocal(expsavedir+'/'+podname)
    #experiment.saveexp(expsavedir+'/'+podname+'.ttl')
    print('experiment saved')
    experiment.loadexp(expsavedir+'/'+podname+'.ttl')
    print('experiment loaded')
    #experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    #experiment.podcreate()
    print('Pods created')
    #experiment.uploadwithbars()
    print('Pods populated')
    #experiment.uploadacl()
    print('Pods acls assigned')
    #experiment.aclindexwebidnewthreaded()
    #os.mkdir(podname)
    #experiment.storeindexlocal(podname)
    print('pods indexed')
    #experiment.uploadindexlocal(podname)
    print('indices uploaded')
    experiment.aclmetaindex()
    print('metaindices created')
    #experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    #experiment.indexfixerwebidnew()
    print('indices checked')

def expmultithredtestnew():
    #list of servers in the experiment:
    serverlist=['https://srv04031.soton.ac.uk:3000/']
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='expmultithredtestnew'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/dataset2/'
    #directory where to save the experiment
    expsavedir='/Users/yurysavateev'
    #total number of pods
    numberofpods=5
    #total number of files
    n=100
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=20
    #on average how many webids can read a given file
    mean=5
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(numberofpods,0,0)
    print('files distributed')
    experiment.imagineaclspecial(percs)
    experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    print('files acl imagined')
    #experiment.storeexplocal(expsavedir+'/'+podname)
    experiment.saveexp(expsavedir+'/'+podname+'.ttl')
    print('experiment saved')
    #experiment.loadexp(expsavedir+'/'+podname+'.ttl')
    print('experiment loaded')
    experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    experiment.uploadwithbars()
    print('Pods populated')
    experiment.uploadacl()
    print('Pods acls assigned')
    experiment.aclindexwebidnewthreaded()
    #os.mkdir(podname)
    #experiment.storeindexlocal(podname)
    print('pods indexed')
    #experiment.uploadindexlocal(podname)
    print('indices uploaded')
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    experiment.indexfixerwebidnew()
    print('indices checked')

expmultithredtestnew()
