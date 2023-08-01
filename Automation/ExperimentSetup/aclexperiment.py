import filesorter, distributor, dpop_utils, CSSaccess, brewmaster, rdfindex
import os,sys,csv,re, math, random, shutil, requests, json, base64, urllib.parse, cleantext
from rdflib import URIRef, BNode, Literal, Graph, Namespace
import threading
import time
import concurrent.futures

class ACLexperiment:
    def __init__(self, 
        espressopodname='ESPRESSO',
        espressoemail='espresso@example.com',
        espressoindexfile='espressoindex.csv',
        podname='pod',
        podemail='@example.org',
        podindexdir='espressoindex/',
        password='12345'):
        self.serverlist = []
        self.espressopodname=espressopodname
        self.espressoemail=espressoemail
        self.espressoindexfile=espressoindexfile
        self.podname=podname
        self.podindexdir=podindexdir
        self.podemail=podemail
        self.password=password
        self.podnum=0
        self.filelist=[]
        self.filedist=[]
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
                #fword='F'+str(n)
                #n=n+1
                #fnode=BNode(fword)
                #self.image.add((s,self.namespace.localAddress,Literal(f)))
                
    def loadserverlist(self,serverlist):
        n=len(self.serverlist)
        self.serverlist=self.serverlist+serverlist
        #for s in range(n,len(self.serverlist)):
        #    sword='S'+str(s)
        #    snode=BNode(sword)
        #    eword='E'+sword
        #    enode=BNode(eword)
        #    self.image.add((snode,self.namespace.Address,Literal(self.serverlist[s])))
        #    self.image.add((snode,self.namespace.EspressoPod,enode))
        #    esppod=self.serverlist[s]+self.espressopodname
        #    self.image.add((enode,self.namespace.Address,Literal(esppod)))
        #    metaindexaddress=esppod+'/'+self.espressoindexfile
        #    self.image.add((enode,self.namespace.MetaindexAddress,Literal(metaindexaddress)))

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


    def imagineacl(self,mean, disp):
        filenodelist=self.image.subjects(self.namespace.Type,self.namespace.File)
        pnodelist=self.image.subjects(self.namespace.Type,self.namespace.Pod)
        pnodelistlist=[]
        for pnode in pnodelist:
            pnodelistlist.append(pnode)
        print(len(pnodelistlist))
        for fnode in filenodelist:
            if disp==0:
                n=mean
            else:
                n=floor(numpy.random.normal(mean,disp*mean))
                if n<=1:
                    n=1
            accpnodelist=random.sample(pnodelistlist, n)
            for pnode in accpnodelist:
                self.image.add((fnode,self.namespace.AccessibleBy,pnode))

    def imaginetypedacl(self,mean, disp, medsizeacl,lowsizeacl):
        fnodelist=self.image.subjects(self.namespace.Type,self.namespace.File)
        filelist=[]
        for fnode in fnodelist:
            filelist.append(fnode)

        pnodelist=self.image.subjects(self.namespace.Type,self.namespace.Pod)
        podlist=[]
        for pnode in pnodelist:
            podlist.append(pnode)

        print(len(podlist))

        fullpnode=podlist[0]
        self.image.add((fullpnode,self.namespace.Type,self.namespace.FullAccessPod))
        for fnode in filelist:
            self.image.add((fnode,self.namespace.AccessibleBy,fullpnode))

        mediumpnode=podlist[1]
        self.image.add((mediumpnode,self.namespace.Type,self.namespace.MediumAccessPod))
        medfilelist=random.sample(filelist, medsizeacl)
        for fnode in medfilelist:
            self.image.add((fnode,self.namespace.AccessibleBy,mediumpnode))

        lowpnode=podlist[2]
        self.image.add((lowpnode,self.namespace.Type,self.namespace.LowAccessPod))
        lowfilelist=random.sample(filelist, lowsizeacl)
        for fnode in lowfilelist:
            self.image.add((fnode,self.namespace.AccessibleBy,lowpnode))


        podlistcut=podlist[3:]
        print(len(podlistcut))
        for fnode in filelist:
            if disp==0:
                n=mean
            else:
                n=floor(numpy.random.normal(mean,disp*mean))
                if n<=1:
                    n=1
            accpnodelist=random.sample(podlistcut, n)
            print(fnode,n)
            for pnode in accpnodelist:
                self.image.add((fnode,self.namespace.AccessibleBy,pnode))

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
        print(files)
        for targetUrl in files:
            res=CSSA.delete_file(targetUrl)
            if not res.ok:
                CSSA.create_authtoken()
            

    def upload(self):
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
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                    targetUrl=str(self.image.value(fnode,self.namespace.Address))
                    filetype=str(self.image.value(fnode,self.namespace.Filetype))
                    f=str(self.image.value(fnode,self.namespace.LocalAddress))
                    file = open(f, "rb")
                    filetext=file.read().decode('latin1')
                    file.close()
                    res=CSSA.put_url(targetUrl, filetext, filetype)
                    if not res.ok:
                        print(res)
                        continue
                    res=CSSA.adddefaultacl(targetUrl)
                    webidlist=[]
                    for ppnode in self.image.objects(fnode,self.namespace.AccessibleBy):
                        webid=str(self.image.value(ppnode,self.namespace.WebID))
                        webidlist.append(webid)
                    CSSA.addreadrights(targetUrl,webidlist)




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
                d=brewmaster.crawl(podaddress, CSSA)
                print(d.keys())
                tuples=[]
                for (id,text) in d.items():
                    webidlist=brewmaster.getwebidlist(id)
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=brewmaster.ldpindexdict(d)
                brewmaster.uploadldpindex(index, pod, self.podindexdir, CSSA)
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
            
    def aclindex(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            metaindexdata=''
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                addstring=indexaddress+'\r\n'
                metaindexdata+=addstring
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                CSSA.create_authstring()
                CSSA.create_authtoken()
                indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                d=brewmaster.aclcrawl(podaddress, CSSA)
                
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=brewmaster.aclindextuples(d)
                brewmaster.uploadaclindex(index, indexaddress, CSSA)
                
                
                
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
            
    def aclindexsnode(self,snode):
        IDP=str(self.image.value(snode,self.namespace.Address))
        metaindexdata=''
            
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                CSSA.create_authstring()
                CSSA.create_authtoken()
                d=brewmaster.aclcrawl(podaddress, CSSA)
                
                index=brewmaster.aclindextuples(d)
                executor.submit(brewmaster.uploadaclindex, index, indexaddress, CSSA)
                    #brewmaster.uploadaclindex(index, indexaddress, CSSA)
                
        for pnode in self.image.objects(snode,self.namespace.Contains):
                indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                addstring=indexaddress+'\r\n'
                metaindexdata+=addstring    
                
        CSSAe=CSSaccess.CSSaccess(IDP, self.espressoemail, self.password)
        a=CSSAe.create_authstring()
        t=CSSAe.create_authtoken()
        print(CSSAe.put_file(self.espressopodname, self.espressoindexfile, metaindexdata, 'text/csv'))

    def aclindexthreaded(self):
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
                    d=brewmaster.aclcrawl(podaddress, CSSA)
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    index=brewmaster.aclindextuples(d)
                    executor.submit(brewmaster.uploadaclindex, index, indexaddress, CSSA)
                    #brewmaster.uploadaclindex(index, indexaddress, CSSA)

    def aclindexwebidthreaded(self):
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
                    d=brewmaster.aclcrawlwebid(podaddress, CSSA)
                    indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                    index=brewmaster.aclindextupleswebid(d)
                    executor.submit(brewmaster.uploadaclindex, index, indexaddress, CSSA)
                    #brewmaster.uploadaclindex(index, indexaddress, CSSA)

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
                    executor.submit(brewmaster.uploadaclindex, index, indexaddress, CSSA)
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
        
    def indexfixer(self):
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
                print('currently in index of' +podname +':' +str(len(n)))
                d=brewmaster.aclcrawl(podaddress, CSSA)
                
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=brewmaster.aclindextuples(d)
                print('should be in index of' +podname +':' +str(len(index.keys())))
                for f in n:
                    index.pop(f)
                #for f in self.forbidden:
                    #index.pop(f+'.ndx','no key')
                print("Difference?"+str(len(index.keys())))
                brewmaster.uploadaclindex(index, indexaddress, CSSA)

    def indexfixerwebid(self):
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
                print('currently in index of' +podname +':' +str(len(n)))
                d=brewmaster.aclcrawlwebid(podaddress, CSSA)
                
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=brewmaster.aclindextupleswebid(d)
                print('should be in index of' +podname +':' +str(len(index.keys())))
                for f in n:
                    index.pop(f)
                #for f in self.forbidden:
                    #index.pop(f+'.ndx','no key')
                print("Difference?"+str(len(index.keys())))
                brewmaster.uploadaclindex(index, indexaddress, CSSA)
    
    def indexfixerwebidnew(self):
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
                print('currently in index of' +podname +':' +str(len(n)))
                d=brewmaster.aclcrawlwebidnew(podaddress, podaddress,CSSA)
                
                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=brewmaster.aclindextupleswebidnew(d)
                print('should be in index of' +podname +':' +str(len(index.keys())))
                for f in n:
                    index.pop(f)
                #for f in self.forbidden:
                    #index.pop(f+'.ndx','no key')
                print("Difference?"+str(len(index.keys())))
                brewmaster.uploadaclindex(index, indexaddress, CSSA)

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
                    print('currently in index of' +podname +':' +str(len(n)))
                    d=brewmaster.aclcrawl(podaddress, CSSA)
                    
                    #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                    index=brewmaster.aclindextuples(d)
                    print('should be in index of' +podname +':' +str(len(index.keys())))
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
acl:agent c:me, <mailto:ys1v22@soton.ac.uk>;
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
    podname='aclpod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    numberofpods=5
    n=10
    mean=3
    disp=0
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(n,numberofpods,0,0)
    print('files distributed')
    experiment.imaginefiles()
    print('files imagined')
    experiment.imagineacl(mean, disp)
    print('files acl imagined')
    experiment.saveexp('acltest.ttl')
    print('experiment saved')
    experiment.ESPRESSOcreate()
    experiment.podcreate()
    experiment.upload()
    experiment.aclindexthreaded()
    experiment.indexpub()
    experiment.metaindexpub()

def threadtest():
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='aclthreadindex.csv'
    podname='aclthreadpod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset2'
    numberofpods=60
    n=100
    mean=10
    disp=0
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    #experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    print('files loaded')
    #experiment.logicaldist(n,numberofpods,0,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    #experiment.imagineacl(mean, disp)
    print('files acl imagined')
    #experiment.saveexp('acltest.ttl')
    print('experiment saved')
    #experiment.ESPRESSOcreate()
    #experiment.podcreate()
    #experiment.upload()
    experiment.loadexp('acltest.ttl')
    experiment.aclindexthreaded()
    experiment.aclmetaindex()
    experiment.indexpub()
    experiment.metaindexpub()

def demopapertest():
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='demopodindex.csv'
    podname='demopod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset3'
    numberofpods=60
    n=600
    mean=10
    disp=0
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    #experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    print('files loaded')
    #experiment.logicaldist(n,numberofpods,0.2,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    #experiment.imagineacl(mean, disp)
    print('files acl imagined')
    #experiment.saveexp(podname+'exp.ttl')
    print('experiment saved')
    #experiment.ESPRESSOcreate()
    #experiment.podcreate()
    #experiment.upload()
    experiment.loadexp('demopodexp.ttl')
    #experiment.aclindexthreaded()
    experiment.aclmetaindex()
    experiment.indexpub()
    experiment.metaindexpub()

def indexfixertest():
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='demopodindex.csv'
    podname='demopod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset3'
    numberofpods=60
    n=600
    mean=10
    disp=0
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    #experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    print('files loaded')
    #experiment.logicaldist(n,numberofpods,0.2,0)
    print('files distributed')
    #experiment.imaginefiles()
    print('files imagined')
    #experiment.imagineacl(mean, disp)
    print('files acl imagined')
    #experiment.saveexp(podname+'exp.ttl')
    print('experiment saved')
    #experiment.ESPRESSOcreate()
    #experiment.podcreate()
    #experiment.upload()
    experiment.loadexp('demopodexp.ttl')
    #experiment.indexpub()
    experiment.indexfixer()

def demo2400test():
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='demo2400podindex.csv'
    podname='demo2400pod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset4'
    numberofpods=60
    n=2400
    mean=15
    disp=0
    medsizeacl=600
    lowsizeacl=100
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    #experiment.loadserverlist(serverlist)
    #print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    #print('files loaded')
    #experiment.logicaldist(n,numberofpods,0.2,0)
    #print('files distributed')
    #experiment.imaginefiles()
    #print('files imagined')
    #experiment.imaginetypedacl(mean, disp, medsizeacl, lowsizeacl)
    #print('files acl imagined')
    #experiment.saveexp(podname+'exp.ttl')
    #print('experiment saved')
    experiment.loadexp(podname+'exp.ttl')
    #experiment.ESPRESSOcreate()
    #experiment.podcreate()
    #experiment.upload()
    
    #experiment.aclindexthreaded()
    #experiment.aclmetaindex()
    #experiment.indexpub()
    #experiment.metaindexpub()

    experiment.indexfixer()

def demo2400test2():
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    espressoindexfile='demoattempt2podindex.csv'
    podname='demoattempt2pod'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset4'
    numberofpods=60
    n=2400
    mean=15
    disp=0
    medsizeacl=600
    lowsizeacl=100
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    #experiment.loadserverlist(serverlist)
    #print('serverlist loaded')
    #experiment.loaddir(sourcedir)
    #print('files loaded')
    #experiment.logicaldist(n,numberofpods,0.2,0)
    #print('files distributed')
    #experiment.imaginefiles()
    #print('files imagined')
    #experiment.imaginetypedacl(mean, disp, medsizeacl, lowsizeacl)
    #print('files acl imagined')
    #experiment.saveexp(podname+'exp.ttl')
    #print('experiment saved')
    experiment.loadexp(podname+'exp.ttl')
    experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    experiment.upload()
    print('Pods populated')
    experiment.aclindexthreaded()
    print('pods indexed')
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    experiment.indexfixer()
    print('indices checked')

def webid2400test():
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    espressopodname='ESPRESSO'
    espressoemail='espresso@example.com'
    
    podname='webidpod'
    espressoindexfile=podname+'metaindex.csv'
    podemail='@example.org'
    podindexdir='espressoindex/'
    password='12345'
    sourcedir='/Users/yurysavateev/dataset4'
    numberofpods=60
    n=2400
    mean=15
    disp=0
    medsizeacl=600
    lowsizeacl=100
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(n,numberofpods,0.2,0)
    print('files distributed')
    experiment.imaginefiles()
    print('files imagined')
    experiment.imaginetypedacl(mean, disp, medsizeacl, lowsizeacl)
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
    experiment.aclindexwebidthreaded()
    print('pods indexed')
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')
    experiment.indexfixerwebid()
    print('indices checked')


# def webid50Ragab():
#     serverlist=['https://srv03911.soton.ac.uk:3000/','https://srv03912.soton.ac.uk:3000/']
#     espressopodname='ESPRESSO'
#     espressoemail='espresso@example.com'
    
#     podname='ragab50pod'
#     espressoindexfile=podname+'metaindex.csv'
#     podemail='@example.org'
#     podindexdir='espressoindex/'
#     password='12345'
#     sourcedir='/Users/ragab/PycharmProjects/DatasetSplitter/demoDS/'
#     numberofpods=10
#     n=50
#     mean=3
#     disp=0
#     medsizeacl=15
#     lowsizeacl=5
#     experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
#     experiment.loadserverlist(serverlist)
#     print('serverlist loaded')
#     experiment.loaddir(sourcedir)
#     print('files loaded')
#     experiment.logicaldist(n,numberofpods,0,0)
#     print('files distributed')
#     experiment.imaginefiles()
#     print('files imagined')
#     experiment.imaginetypedacl(mean, disp, medsizeacl, lowsizeacl)
#     print('files acl imagined')
#     experiment.saveexp(podname+'exp.ttl')
#     print('experiment saved')
#     #experiment.loadexp(podname+'exp.ttl')
#     experiment.ESPRESSOcreate()
#     print('ESPRESSO checked')
#     experiment.podcreate()
#     print('Pods created')
#     experiment.upload()
#     print('Pods populated')
#     experiment.aclindexwebidthreaded()
#     print('pods indexed')
#     experiment.aclmetaindex()
#     print('metaindices created')
#     experiment.indexpub()
#     print('indices opened')
#     experiment.metaindexpub()
#     print('metaindices opened')
#     experiment.indexfixerwebid()
#     print('indices checked')


def experimenttemplate():
    #list of servers in the experiment:
    serverlist=['https://srv03812.soton.ac.uk:3000/','https://srv03813.soton.ac.uk:3000/','https://srv03814.soton.ac.uk:3000/','https://srv03815.soton.ac.uk:3000/','https://srv03816.soton.ac.uk:3000/','https://srv03911.soton.ac.uk:3000/']
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    podname='webidpod'
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
    #on average how many pods can read a given file
    mean=15
    #relative deviation of the previous, can be left 0
    disp=0
    #how many files on average a pod can read
    medsizeacl=600
    #how many files a low access pod can read
    lowsizeacl=100
    #initializing the experiment
    experiment=ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail, espressoindexfile=espressoindexfile, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(n,numberofpods,0.2,0)
    print('files distributed')
    experiment.imaginefiles()
    print('files imagined')
    experiment.imaginetypedacl(mean, disp, medsizeacl, lowsizeacl)
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



def webid1podRagab():
    serverlist = ['https://srv03911.soton.ac.uk:3000/', 'https://srv03912.soton.ac.uk:3000/']
    espressopodname = 'ESPRESSO'
    espressoemail = 'espresso@example.com'

    podname = 'ragab1pod'
    espressoindexfile = podname + 'metaindex.csv'
    podemail = '@example.org'
    podindexdir = 'espressoindex/'
    password = '12345'
    sourcedir = '/Users/ragab/EspressoProjRagabTests/Indexer/DS'
    numberofpods = 4
    n = 6
    mean = 1
    disp = 0
    medsizeacl = 2
    lowsizeacl = 1
    experiment = ACLexperiment(espressopodname=espressopodname, espressoemail=espressoemail,
                               espressoindexfile=espressoindexfile, podname=podname, podemail=podemail,
                               podindexdir=podindexdir, password=password)
    experiment.loadserverlist(serverlist)
    print('serverlist loaded')
    experiment.loaddir(sourcedir)
    print('files loaded')
    experiment.logicaldist(n, numberofpods, 0, 0)
    print('files distributed')
    experiment.imaginefiles()
    print('files imagined')
    experiment.imaginetypedacl(mean, disp, medsizeacl, lowsizeacl)
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


webid1podRagab()