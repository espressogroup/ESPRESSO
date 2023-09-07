import filesorter, dpop_utils, CSSaccess, brewmaster
import os,sys,csv,re, random, shutil, requests, json, base64, urllib.parse, cleantext
from rdflib import URIRef, BNode, Literal, Graph, Namespace
from math import floor
import threading
import time, tqdm
import concurrent.futures

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
        self.filedist=[]
        self.openfilelist=[]
        self.forbidden=["setup"]
        self.acl={}
        self.namespace=Namespace("http://example.org/SOLIDindex/")
        self.image=Graph()
        
    def __repr__(self):
        """
        Return image in the turtle formal. 
        """
        return self.image.serialize(format='turtle')
    
    

    def loaddir(self,datasource):
        n=len(self.filelist)
        for filename in os.listdir(datasource):
            f = os.path.join(datasource, filename)
            # checking if it is a file
            if os.path.isfile(f) and not filename.startswith('.'):
                self.filelist.append(f)
                
                
    def loadserverlist(self,serverlist):
        n=len(self.serverlist)
        self.serverlist=self.serverlist+serverlist
        

    def logicaldist(self, n,numberofpods,poddisp,serverdisp):
        self.podnum=numberofpods
        if n<=len(self.filelist):
            expfilelist=self.filelist[:n]
        else:
            expfilelist=self.filelist
        #print(expfilelist)
        exppodlist=filesorter.normaldistribute(expfilelist,numberofpods, poddisp)
        #print(exppodlist)
        #random.shuffle(exppodlist)
        self.filedist=filesorter.distribute(exppodlist, len(self.serverlist), serverdisp)
        #print(self.filedist)

    def imaginefiles(self):
        for s in range(len(self.serverlist)):
            sword='S'+str(s)
            snode=BNode(sword)
            eword='E'+sword
            enode=BNode(eword)
            self.image.add((snode,self.namespace.Type,self.namespace.Server))
            IDP=self.serverlist[s]
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
            for p in range(len(self.filedist[s])):
                pword=sword+'P'+str(p)
                podname=self.podname+str(p)
                pnode=BNode(pword)
                self.image.add((pnode,self.namespace.Type,self.namespace.Pod))
                self.image.add((snode,self.namespace.Contains,pnode))
                self.image.add((pnode,self.namespace.Name,Literal(podname)))
                podaddress=self.serverlist[s]+podname+'/'
                self.image.add((pnode,self.namespace.Address,Literal(podaddress)))
                podindexaddress=podaddress+self.podindexdir
                self.image.add((pnode,self.namespace.IndexAddress,Literal(podindexaddress)))
                podemail=podname+self.podemail
                self.image.add((pnode,self.namespace.Email,Literal(podemail)))
                webid=podaddress+'profile/card#me'
                self.image.add((pnode,self.namespace.WebID,Literal(webid)))
                for f in range(len(self.filedist[s][p])):
                    fword=pword+'F'+str(f)
                    fnode=BNode(fword)
                    self.image.add((fnode,self.namespace.Type,self.namespace.File))
                    self.image.add((pnode,self.namespace.Contains,fnode))
                    filepath=self.filedist[s][p][f]
                    self.image.add((fnode,self.namespace.LocalAddress,Literal(filepath)))
                    filename=filepath.rsplit('/')[-1]
                    self.image.add((fnode,self.namespace.Filename,Literal(filename)))
                    fileaddress=podaddress+filename
                    self.image.add((fnode,self.namespace.Address,Literal(fileaddress)))
                    filetype='text/plain'
                    self.image.add((fnode,self.namespace.Filetype,Literal(filetype)))
                    self.image.add((fnode,self.namespace.Uploaded,Literal('N')))



    def imaginetypedacl(self,numofwebids,mean, disp, medsizeacl,lowsizeacl):
        anodelist=[]
        for i in range(numofwebids):
            aword='A'+str(i)
            anode=BNode(aword)
            webid='mailto:agent'+str(i)+'@example.org'
            self.image.add((anode,self.namespace.WebID,Literal(webid)))
            anodelist.append(anode)
        fnodelist=self.image.subjects(self.namespace.Type,self.namespace.File)
        filelist=[]
        for fnode in fnodelist:
            filelist.append(fnode)

        fullanode=anodelist[0]
        self.image.add((fullanode,self.namespace.Type,self.namespace.FullAccessAgent))
        for fnode in filelist:
            self.image.add((fnode,self.namespace.AccessibleBy,fullanode))

        mediumanode=anodelist[1]
        self.image.add((mediumanode,self.namespace.Type,self.namespace.MediumAccessAgent))
        medfilelist=random.sample(filelist, medsizeacl)
        for fnode in medfilelist:
            self.image.add((fnode,self.namespace.AccessibleBy,mediumanode))

        lowanode=anodelist[2]
        self.image.add((lowanode,self.namespace.Type,self.namespace.LowAccessAgent))
        lowfilelist=random.sample(filelist, lowsizeacl)
        for fnode in lowfilelist:
            self.image.add((fnode,self.namespace.AccessibleBy,lowanode))


        anodelistcut=anodelist[3:]
        #print(len(podlistcut))
        for fnode in filelist:
            if disp==0:
                n=mean
            else:
                n=floor(numpy.random.normal(mean,disp*mean))
                if n<=1:
                    n=1
            accanodelist=random.sample(anodelistcut, n)
            #print(fnode,n)
            for anode in accanodelist:
                self.image.add((fnode,self.namespace.AccessibleBy,anode))
    
    def imagineaclnormal(self,openperc,numofwebids,mean, disp):
        anodelist=[]

        for i in range(numofwebids):
            aword='A'+str(i)
            anode=BNode(aword)
            webid='mailto:agent'+str(i)+'@example.org'
            self.image.add((anode,self.namespace.WebID,Literal(webid)))
            anodelist.append(anode)

        fnodelist=self.image.subjects(self.namespace.Type,self.namespace.File)
        filelist=[]
        for fnode in fnodelist:
            filelist.append(fnode)

        openn=floor(len(filelist)*(openperc/100))
        openfilelist=random.sample(filelist, openn)
        for fnode in openfilelist:
            self.image.add((fnode,self.namespace.Type,self.namespace.OpenFile))

        
        for fnode in filelist:
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
    
    def imagineaclspecial(self,percs):
        sanodelist=[]
        for i in range(len(percs)):
            saword='SA'+str(i)
            sanode=BNode(saword)
            webid='mailto:sagent'+str(i)+'@example.org'
            self.image.add((sanode,self.namespace.WebID,Literal(webid)))
            self.image.add((sanode,self.namespace.Power,Literal(str(percs[i]))))
            sanodelist.append(sanode)

        fnodelist=self.image.subjects(self.namespace.Type,self.namespace.File)
        filelist=[]
        for fnode in fnodelist:
            filelist.append(fnode)

        for sanode in sanodelist:
            n=floor(len(filelist)*(int(self.image.value(sanode,self.namespace.Power))/100))
            chfilelist=random.sample(filelist, n)
            print('sanode',n)
            for fnode in chfilelist:
                self.image.add((fnode,self.namespace.AccessibleBy,sanode))


    def saveexp(self,filename):
        with open(filename, 'w') as f:
            f.write(repr(self))
            f.close()

    def loadexp(self,filename):
        g=Graph()
        g.parse(filename)
        self.image=g


                    
    def ESPRESSOcreate(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
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
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
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
        d=brewmaster.crawl(podaddress, CSSA)
        files=d.keys()
        pbar=tqdm.tqdm(len(files))
        for targetUrl in files:
            res=CSSA.delete_file(targetUrl)
            if not res.ok:
                CSSA.create_authtoken()
            pbar.update(1)
        pbar.close()
            
    def uploadpnode(self,pnode):
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
            if fnode in openfilelist:
                CSSA.makefileaccessible(podname,filename)
            else:
                res=CSSA.adddefaultacl(targetUrl)
            webidlist=[]
            for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                webid=str(self.image.value(anode,self.namespace.WebID))
                webidlist.append(webid)
            CSSA.addreadrights(targetUrl,webidlist)

    def upload(self):
        openfilelist=[]
        for fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
            openfilelist.append(fnode)
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
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
                    if fnode in openfilelist:
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
            for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
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
                        filetuplelist.apend((f,targetUrl,filetype))
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
        self.openfilelist=[]
        for fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
            self.openfilelist.append(fnode)
        with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
            for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
                IDP=str(self.image.value(snode,self.namespace.Address))
                for pnode in self.image.objects(snode,self.namespace.Contains):
                    executor.submit(self.uploadaclpnodewithbar, pnode,IDP)

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
                    d=brewmaster.aclcrawlwebidnew(podaddress,podaddress, CSSA)
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    index=brewmaster.aclindextupleswebidnew(d) 
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
                    executor.submit(brewmaster.uploadaclindexwithbar, index, indexaddress, CSSA)

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
                    d=brewmaster.aclcrawlwebidnew(podaddress,podaddress, CSSA)
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    index=brewmaster.aclindextupleswebidnew(d)
                    executor.submit(brewmaster.uploadaclindexwithbar, index, indexaddress, CSSA)
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
                n=brewmaster.indexchecker(indexaddress, CSSA)
                print('currently in index of' +IDP+podname +':' +str(len(n)))
                d=brewmaster.aclcrawlwebidnew(podaddress, podaddress,CSSA)
                
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=brewmaster.aclindextupleswebidnew(d)
                print('should be in index of ' +IDP+podname +':' +str(len(index.keys())))
                for f in n:
                    index.pop(f)
                #for f in self.forbidden:
                    #index.pop(f+'.ndx','no key')
                print("Difference?"+str(len(index.keys())))
                brewmaster.uploadaclindexwithbar(index, indexaddress, CSSA)

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
                    n=brewmaster.indexchecker(indexaddress, CSSA)
                    print('currently in index of' +IDP+podname +':' +str(len(n)))
                    d=brewmaster.aclcrawl(podaddress, CSSA)
                    
                    #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                    index=brewmaster.aclindextuples(d)
                    print('should be in index of' +IDP+podname +':' +str(len(index.keys())))
                    for f in n:
                        index.pop(f)
                    #for f in self.forbidden:
                        #index.pop(f+'.ndx','no key')
                    print("Difference?"+str(len(index.keys())))
                    #brewmaster.uploadaclindex(index, indexaddress, CSSA)
                    executor.submit(brewmaster.uploadaclindex, index, indexaddress, CSSA)

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
    numberofpods=5
    n=10
    numofwebids=10
    mean=3
    disp=0
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(n,numberofpods,0,0)
    print('files distributed')
    experiment.imaginefiles()
    print('files imagined')
    experiment.imaginetypedacl(numofwebids,mean, disp,5,2)
    print('files acl imagined')
    experiment.saveexp('webidtest.ttl')
    print('experiment saved')
    #experiment.loadexp('webidtest.ttl')
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    #experiment.aclindexwebidnewthreaded()
    #experiment.indexpub()
    #experiment.metaindexpub()
    #experiment.indexfixerwebidnew()
    print('indices checked')


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
    experiment.logicaldist(n,numberofpods,0,0)
    print('files distributed')
    experiment.imaginefiles()
    print('files imagined')
    experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.saveexp(podname+'exp.ttl')
    print('experiment saved')
    #experiment.loadexp(podname+'exp.ttl')
    print('experiment loaded')
    #experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    experiment.uploadwithbars()
    print('Pods populated')
    experiment.uploadacl()
    print('Pods acls assigned')
    #experiment.aclindexwebidnewthreaded()
    #os.mkdir(podname)
    experiment.storeindexlocal(podname)
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

def expDemoSingapore():
    #list of servers in the experiment:
    serverlist=serverlistglobal[:6]
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='expDemoSingapore'
    #name for the metaindex file.
    espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #local directory from where to take the files
    sourcedir='/Users/yurysavateev/dataset4'
    #total number of pods
    numberofpods=60
    #total number of files
    n=2400
    #percs of sp.agents
    percs=[100,25,4]
    #percent of openfiles
    openperc=0
    #number of agents
    numofwebids=60
    #on average how many webids can read a given file
    mean=15
    #relative deviation of the previous, can be left 0
    disp=0
    #initializing the experiment
    experiment=ESPRESSOexperiment(podname=podname)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    print('files loaded')
    #experiment.logicaldist(n,numberofpods,0.2,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    #experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    #experiment.imagineaclspecial(percs)
    print('files acl imagined')
    #experiment.saveexp(podname+'exp.ttl')
    print('experiment saved')
    experiment.loadexp(podname+'exp.ttl')
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
    experiment.storeindexlocal(podname)
    print('pods indexed')
    experiment.uploadindexlocal(podname)
    print('indices uploaded')
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    experiment.indexfixerwebidnew()
    print('indices checked')


exp1S50P1000F1MBbar()
