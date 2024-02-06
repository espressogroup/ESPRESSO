import FileDistributor, FileUploader
from Indexer import PodIndexer
from Automation.CSSAccess import CSSaccess,dpop_utils
import os, random,  requests, numpy
from rdflib import URIRef, BNode, Literal, Graph, Namespace
from math import floor
import threading
import time, tqdm, getpass
from zipfile import ZipFile
import concurrent.futures
import paramiko
from paramiko import SSHClient
from scp import SCPClient
from sys import argv
import numpy

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
    acltext='''@prefix : <'''+fileaddress+'''.acl#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

:ControlReadWrite a acl:Authorization;
    acl:accessTo <'''+fileaddress+'''>;
    acl:agent c:me;
    acl:mode acl:Control, acl:Read, acl:Write.
:Read a acl:Authorization;
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
@prefix c: <profile/card#>.

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

acldefopen='''@prefix acl: <http://www.w3.org/ns/auth/acl#>.
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
        espressopodname='ESPRESSO',
        espressoemail='espresso@example.com',
        podname='pod',
        podemail='@example.org',
        podindexdir='espressoindex/',
        password='12345'):
        #self.serverlist = []
        self.servernum=0
        self.filepool=dict()
        self.espressopodname=espressopodname
        self.espressoemail=espressoemail
        self.espressoindexfile=podname+'metaindex.csv'
        self.podname=podname
        self.podindexdir=podindexdir
        self.podemail=podemail
        self.password=password
        self.podnum=0
        #self.filelist=[]
        self.filenum=0
        #self.openfilelist=[]
        self.forbidden=["setup"]
        self.replacetemplate='espressosrv/podname/'
        self.namespace=Namespace("http://example.org/SOLIDindex/")
        self.image=Graph()
        
    def __repr__(self):
        """
        Return image in the turtle formal. 
        """
        return self.image.serialize(format='turtle')
    
    

    def loaddir(self,datasource,label='file',filetype='text/plain'):
        #n=len(self.filelist)
        pbar=tqdm.tqdm(total=len(os.listdir(datasource)),desc='files loaded:')
        for filename in os.listdir(datasource):
            filepath = os.path.join(datasource, filename)
            # checking if it is a file
            if os.path.isfile(filepath) and not filename.startswith('.'):
                fword='F'+label+str(self.filenum)
                #n=n+1
                self.filenum=self.filenum+1
                fnode=BNode(fword)
                self.image.add((fnode,self.namespace.Type,self.namespace.File))
                self.image.add((fnode,self.namespace.LocalAddress,Literal(filepath)))
                self.image.add((fnode,self.namespace.Filename,Literal(filename)))  
                self.image.add((fnode,self.namespace.Filetype,Literal(filetype)))
                self.image.add((fnode,self.namespace.Label,Literal(label)))
                
                #self.filelist.append(fnode)
                pbar.update(1)
        pbar.close()
                
    def loaddirtopool(self,datasource,label='file'):
        if label in self.filepool.keys():
            thisfilelist=self.filepool[label]
        else:
            thisfilelist=[]
        for filename in os.listdir(datasource):
            filepath = os.path.join(datasource, filename)
            # checking if it is a file
            if os.path.isfile(filepath) and not filename.startswith('.'):
                    thisfilelist.append((filepath,filename))
        self.filepool[label]=thisfilelist
                
    def loadserverlist(self,serverlist,label='server'):
        #n=len(self.serverlist)
        for s in serverlist:
            #sword='S'+label+str(n)
            #n=n+1
            sword='S'+label+str(self.servernum)
            self.servernum=self.servernum+1
            snode=BNode(sword)
            eword='E'+sword
            enode=BNode(eword)
            self.image.add((snode,self.namespace.Type,self.namespace.Server))
            self.image.add((snode,self.namespace.Sword,Literal(sword)))
            IDP=s
            self.image.add((snode,self.namespace.Address,Literal(IDP)))
            self.image.add((snode,self.namespace.Label,Literal(label)))
            register_endpoint=IDP+'idp/register/'
            self.image.add((snode,self.namespace.RegisterEndpoint,Literal(register_endpoint)))
            self.image.add((snode,self.namespace.ContainsEspressoPod,enode))
            esppod=IDP+self.espressopodname+'/'
            self.image.add((enode,self.namespace.Type,self.namespace.EspressoPod))
            self.image.add((enode,self.namespace.Address,Literal(esppod)))
            self.image.add((enode,self.namespace.Name,Literal(self.espressopodname)))
            metaindexaddress=esppod+self.espressoindexfile
            self.image.add((enode,self.namespace.MetaindexAddress,Literal(metaindexaddress)))
            #self.serverlist.append(snode)
        

    def createlogicalpods(self,numberofpods,serverdisp,serverlabel='server',podlabel='pod',zipf=0):
        #thisserverlist1=[snode for snode in self.serverlist if str(self.image.value(snode,self.namespace.Label))==serverlabel1]
        #thisserverlist2=[snode for snode in self.serverlist if str(self.image.value(snode,self.namespace.Label))==serverlabel2]
        thisserverlist=[snode for snode in self.image.subjects(self.namespace.Type,self.namespace.Server) if str(self.image.value(snode,self.namespace.Label))==serverlabel]
        #print([(str(self.image.value(snode,self.namespace.Label)), str(self.image.value(snode,self.namespace.Label))==serverlabel,serverlabel) for snode in self.image.subjects(self.namespace.Type,self.namespace.Server) ])
        pnodelist=[]
        for i in range(numberofpods):
            pword='P'+podlabel+str(i)
            podname=self.podname+podlabel+str(i)
            pnode=BNode(pword)
            self.image.add((pnode,self.namespace.Name,Literal(podname)))
            self.image.add((pnode,self.namespace.Type,self.namespace.Pod))
            self.image.add((pnode,self.namespace.Label,Literal(podlabel)))
            podemail=podname+self.podemail
            self.image.add((pnode,self.namespace.Email,Literal(podemail)))
            pnodelist.append(pnode)
            #print((pnode1,pnode2))

        #print(thisserverlist,pnodelist)
        if zipf>0:
            poddist=FileDistributor.distribute(pnodelist,len(thisserverlist), zipf)
        else:    
            poddist=FileDistributor.normaldistribute(pnodelist,len(thisserverlist), serverdisp)
        
        for s in range(len(thisserverlist)):
            snode=thisserverlist[s]
            IDP=str(self.image.value(snode,self.namespace.Address))
            for p in range(len(poddist[s])):
                pnode=poddist[s][p]
                #print(poddist2[s][p],pnode)
                podname=str(self.image.value(pnode,self.namespace.Name))
                self.image.add((snode,self.namespace.Contains,pnode))
                #podname=str(self.image.value(pnode,self.namespace.Name))
                podaddress=IDP+podname+'/'
                self.image.add((pnode,self.namespace.Address,Literal(podaddress)))
                podindexaddress=podaddress+self.podindexdir
                self.image.add((pnode,self.namespace.IndexAddress,Literal(podindexaddress)))
                webid=podaddress+'profile/card#me'
                self.image.add((pnode,self.namespace.WebID,Literal(webid)))
                triplestring=''
                self.image.add((pnode,self.namespace.TripleString,Literal(triplestring)))

        
                    
    def createlogicalpairedpods(self,numberofpods,serverdisp,serverlabel1='server1',serverlabel2='server2',podlabel1='pod1',podlabel2='pod2',conpred=URIRef('http://espresso.org/haspersonalWebID')):
        #thisserverlist1=[snode for snode in self.serverlist if str(self.image.value(snode,self.namespace.Label))==serverlabel1]
        #thisserverlist2=[snode for snode in self.serverlist if str(self.image.value(snode,self.namespace.Label))==serverlabel2]
        thisserverlist1=[snode for snode in self.image.subjects(self.namespace.Type,self.namespace.Server) if str(self.image.value(snode,self.namespace.Label))==serverlabel1]
        thisserverlist2=[snode for snode in self.image.subjects(self.namespace.Type,self.namespace.Server) if str(self.image.value(snode,self.namespace.Label))==serverlabel2]
        ppnodelist=[]
        for i in range(numberofpods):
            pword1='P'+podlabel1+str(i)
            podname1=self.podname+podlabel1+str(i)
            pnode1=BNode(pword1)
            self.image.add((pnode1,self.namespace.Name,Literal(podname1)))
            self.image.add((pnode1,self.namespace.Type,self.namespace.Pod))
            self.image.add((pnode1,self.namespace.Label,Literal(podlabel1)))
            podemail1=podname1+self.podemail
            self.image.add((pnode1,self.namespace.Email,Literal(podemail1)))
            pword2='P'+podlabel2+str(i)
            podname2=self.podname+podlabel2+str(i)
            pnode2=BNode(pword2)
            self.image.add((pnode2,self.namespace.Name,Literal(podname2)))
            self.image.add((pnode2,self.namespace.Type,self.namespace.Pod))
            self.image.add((pnode2,self.namespace.Label,Literal(podlabel2)))
            podemail2=podname2+self.podemail
            self.image.add((pnode2,self.namespace.Email,Literal(podemail2)))
            ppnodelist.append((pnode1,pnode2))
            #print((pnode1,pnode2))
        poddist2=FileDistributor.normaldistribute(ppnodelist,len(thisserverlist2), serverdisp)
        
        for s in range(len(thisserverlist2)):
            snode=thisserverlist2[s]
            sword=str(snode)
            IDP=str(self.image.value(snode,self.namespace.Address))
            for p in range(len(poddist2[s])):
                pnode=poddist2[s][p][1]
                #print(poddist2[s][p],pnode)
                podname=str(self.image.value(pnode,self.namespace.Name))
                self.image.add((snode,self.namespace.Contains,pnode))
                #podname=str(self.image.value(pnode,self.namespace.Name))
                podaddress=IDP+podname+'/'
                self.image.add((pnode,self.namespace.Address,Literal(podaddress)))
                podindexaddress=podaddress+self.podindexdir
                self.image.add((pnode,self.namespace.IndexAddress,Literal(podindexaddress)))
                webid=podaddress+'profile/card#me'
                self.image.add((pnode,self.namespace.WebID,Literal(webid)))
                triplestring=''
                self.image.add((pnode,self.namespace.TripleString,Literal(triplestring)))

        poddist1=FileDistributor.normaldistribute(ppnodelist,len(thisserverlist1), serverdisp)
        for s in range(len(thisserverlist1)):
            snode=thisserverlist1[s]
            sword=str(snode)
            IDP=str(self.image.value(snode,self.namespace.Address))
            for p in range(len(poddist1[s])):
                #print(poddist1[s][p],p)
                pnode=poddist1[s][p][0]
                otherpnode=poddist1[s][p][1]
                self.image.add((snode,self.namespace.Contains,pnode))
                podname=str(self.image.value(pnode,self.namespace.Name))
                podaddress=IDP+podname+'/'
                self.image.add((pnode,self.namespace.Address,Literal(podaddress)))
                podindexaddress=podaddress+self.podindexdir
                self.image.add((pnode,self.namespace.IndexAddress,Literal(podindexaddress)))
                webid=podaddress+'profile/card#me'
                self.image.add((pnode,self.namespace.WebID,Literal(webid)))
                otherwebid=str(self.image.value(otherpnode,self.namespace.WebID))
                triplestring='<'+webid+'> <'+str(conpred)+'> <'+otherwebid+'>'
                self.image.add((pnode,self.namespace.TripleString,Literal(triplestring)))

    def logicaldistfilestopodsfrompool(self,numberoffiles,filedisp,filetype,filelabel='file',podlabel='pod',subdir='file',predicatetopod=URIRef('http://example.org/SOLIDindex/HasFile'),replacebool=False,zipf=0):
        afiletuplelist=self.filepool[filelabel]
        thisfiletuplelist=afiletuplelist[:numberoffiles]
        self.filepool[filelabel]=afiletuplelist[numberoffiles:]
        #n=len(self.filelist)
        pbar=tqdm.tqdm(total=len(thisfiletuplelist),desc='files loaded:')
        thisfilelist=[]
        for filepath,filename in thisfiletuplelist:
                fword='F'+filelabel+str(self.filenum)
                #n=n+1
                self.filenum=self.filenum+1
                fnode=BNode(fword)
                self.image.add((fnode,self.namespace.Type,self.namespace.File))
                self.image.add((fnode,self.namespace.LocalAddress,Literal(filepath)))
                self.image.add((fnode,self.namespace.Filename,Literal(filename)))  
                self.image.add((fnode,self.namespace.Filetype,Literal(filetype)))
                self.image.add((fnode,self.namespace.Label,Literal(filelabel)))
                
                #self.filelist.append(fnode)
                thisfilelist.append(fnode)
                pbar.update(1)
        pbar.close()
        
        thispodlist=[pnode for pnode in self.image.subjects(self.namespace.Label,Literal(podlabel))]
        if zipf>0:
            filedist=FileDistributor.distribute(thisfilelist,len(thispodlist),zipf)
        else:
            filedist=FileDistributor.normaldistribute(thisfilelist,len(thispodlist),filedisp)
        for p in range(len(filedist)):
            pnode=thispodlist[p]
            podaddress=str(self.image.value(pnode,self.namespace.Address))
            webid=str(self.image.value(pnode,self.namespace.WebID))
            for fnode in filedist[p]:
                self.image.add((pnode,self.namespace.Contains,fnode))
                filename=str(self.image.value(fnode,self.namespace.Filename))
                fileaddress=podaddress+subdir+'/'+filename
                self.image.add((fnode,self.namespace.Address,Literal(fileaddress)))
                self.image.add((fnode,self.namespace.ReplaceText,Literal(podaddress)))
                if len(str(predicatetopod))>0:
                    triplestring='<'+webid+'> <'+str(predicatetopod)+'> <'+fileaddress+'>'
                else:
                    triplestring=''
                self.image.add((fnode,self.namespace.TripleString,Literal(str(triplestring))))
                if replacebool:
                    self.image.add((fnode,self.namespace.ReplaceText,Literal(podaddress)))

    def logicaldistfilestopods(self,numberoffiles,filedisp,filelabel='file',podlabel='pod',subdir='file',predicatetopod=URIRef('http://example.org/SOLIDindex/HasFile'),replacebool=False):
        #thisfilelist=[fnode for fnode in self.filelist if str(self.image.value(fnode,self.namespace.Label))==filelabel]
        thisfilelist=[fnode for fnode in self.image.subjects(self.namespace.Type,self.namespace.File) if str(self.image.value(fnode,self.namespace.Label))==filelabel]
        thisfilelisttr=thisfilelist[:numberoffiles]
        thispodlist=[pnode for pnode in self.image.subjects(self.namespace.Label,Literal(podlabel))]
        filedist=FileDistributor.normaldistribute(thisfilelisttr,len(thispodlist),filedisp)
        for p in range(len(filedist)):
            pnode=thispodlist[p]
            podaddress=str(self.image.value(pnode,self.namespace.Address))
            webid=str(self.image.value(pnode,self.namespace.WebID))
            for fnode in filedist[p]:
                self.image.add((pnode,self.namespace.Contains,fnode))
                filename=str(self.image.value(fnode,self.namespace.Filename))
                fileaddress=podaddress+subdir+'/'+filename
                self.image.add((fnode,self.namespace.Address,Literal(fileaddress)))
                self.image.add((fnode,self.namespace.ReplaceText,Literal(podaddress)))
                triplestring='<'+webid+'> <'+str(predicatetopod)+'> <'+fileaddress+'>'
                self.image.add((fnode,self.namespace.TripleString,Literal(str(triplestring))))
                if replacebool:
                    replstring=podaddress
                else:
                    replstring=''
                self.image.add((fnode,self.namespace.ReplaceText,Literal(replstring)))


    def distributebundles(self,numberofbundles,bundlesource,filetype,filelabel='file',subdir='file',podlabel='pod',predicatetopod=URIRef('http://example.org/SOLIDindex/HasFile'),hashliststring=''):
        #n=len(self.filelist)
        #print('nbefore',n)
        thispodlist=[pnode for pnode in self.image.subjects(self.namespace.Label,Literal(podlabel))]
        pbar=tqdm.tqdm(total=numberofbundles,desc='files loaded:')
        i=numberofbundles
        #print(i,len(thispodlist))
        for bundle in os.listdir(bundlesource):
            i=i-1
            if i<0:
                break
            
            pnode=thispodlist[i]
            podaddress=str(self.image.value(pnode,self.namespace.Address))
            #print(podaddress)
            webid=str(self.image.value(pnode,self.namespace.WebID))
            
            bundlepath=os.path.join(bundlesource, bundle)
            if os.path.isdir(bundlepath):
                for filename in os.listdir(bundlepath):
                    filepath = os.path.join(bundlepath, filename)
                    #print(filepath)
            # checking if it is a file
                    if os.path.isfile(filepath) and not filename.startswith('.'):
                        fword='F'+str(self.filenum)
                        #n=n+1
                        self.filenum=self.filenum+1
                        fnode=BNode(fword)
                        #print(fword)
                        self.image.add((fnode,self.namespace.Type,self.namespace.File))
                        
                        self.image.add((fnode,self.namespace.LocalAddress,Literal(filepath)))
                        self.image.add((fnode,self.namespace.Filename,Literal(filename)))  
                        self.image.add((fnode,self.namespace.Filetype,Literal(filetype)))
                        self.image.add((fnode,self.namespace.Label,Literal(filelabel)))
                        
                        self.image.add((pnode,self.namespace.Contains,fnode))
                        fileaddress=podaddress+subdir+'/'+filename
                        self.image.add((fnode,self.namespace.Address,Literal(fileaddress)))
                        #print(self.image.value(fnode,self.namespace.Address))
                        self.image.add((fnode,self.namespace.ReplaceText,Literal(podaddress)))
                        if len(hashliststring)==0:
                            triplestring='<'+webid+'> <'+str(predicatetopod)+'> <'+fileaddress+'>'
                        else:
                            triplestring='<'+webid+'> <'+str(predicatetopod)+'>'
                            for h in hashliststring.rsplit(','):
                                triplestring=triplestring+' <'+fileaddress + '#' + h +'>,'
                            triplestring=triplestring[:-1]+'.'
                        self.image.add((fnode,self.namespace.TripleString,Literal(str(triplestring))))
                        #self.filelist.append(fnode)
                        #print(len(self.filelist),self.filelist[-1])
            pbar.update(1)
        pbar.close()
        #print(len(self.filelist),self.image.value(fnode,self.namespace.Address))


    def imagineaclnormal(self,openperc,numofwebids,mean, disp,filelabel='file'):
        anodelist=[]

        for i in range(numofwebids):
            aword='A'+str(i)
            anode=BNode(aword)
            webid='mailto:agent'+str(i)+'@example.org'
            self.image.add((anode,self.namespace.WebID,Literal(webid)))
            anodelist.append(anode)

        #thisfilelist=[fnode for fnode in self.filelist if str(self.image.value(fnode,self.namespace.Label))==filelabel]
        thisfilelist=[fnode for fnode in self.image.subjects(self.namespace.Type,self.namespace.File) if str(self.image.value(fnode,self.namespace.Label))==filelabel]

        openn=floor(len(thisfilelist)*(openperc/100))
        thisopenfilelist=random.sample(thisfilelist, openn)
        for fnode in thisopenfilelist:
            #self.openfilelist.append(fnode)
            self.image.add((fnode,self.namespace.Type,self.namespace.OpenFile))

        pbar=tqdm.tqdm(total=len(thisfilelist),desc='acls:')
        if len(anodelist)==0:
            return
        for fnode in thisfilelist:
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
    
    def imagineaclspecial(self,percs,filelabel='file'):
        sanodelist=[]
        for i in range(len(percs)):
            saword='SA'+str(i)
            sanode=BNode(saword)
            webid='mailto:sagent'+str(i)+'@example.org'
            self.image.add((sanode,self.namespace.WebID,Literal(webid)))
            self.image.add((sanode,self.namespace.Power,Literal(str(percs[i]))))
            sanodelist.append(sanode)

        #thisfilelist=[fnode for fnode in self.filelist if str(self.image.value(fnode,self.namespace.Label))==filelabel]
        thisfilelist=[fnode for fnode in self.image.subjects(self.namespace.Type,self.namespace.File) if str(self.image.value(fnode,self.namespace.Label))==filelabel]

        for sanode in sanodelist:
            n=floor(len(thisfilelist)*(int(self.image.value(sanode,self.namespace.Power))/100))
            chfilelist=random.sample(thisfilelist, n)
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
        self.servernum=0
        self.filenum=0
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            #self.serverlist.append(snode)
            self.servernum=self.servernum+1
        for fnode in self.image.subjects(self.namespace.Type,self.namespace.File):
            #self.filelist.append(fnode)
            self.filenum=self.filenum+1
        #for fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
            #self.openfilelist.append(fnode)


                    
    def ESPRESSOcreate(self):
        print(self.servernum, 'servers total')
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            enode=self.image.value(snode,self.namespace.ContainsEspressoPod)
            esppodaddress=self.image.value(enode,self.namespace.Address)
            #print(snode,enode,esppodaddress)
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
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                email=str(self.image.value(pnode,self.namespace.Email))
                webid=str(self.image.value(pnode,self.namespace.WebID))
                triplestring=str(self.image.value(pnode,self.namespace.TripleString))
                res=CSSaccess.get_file(podaddress)
                
                if res.ok:
                    print('Pod '+podname+ ' at '+IDP +' exists. Deleting.')
                    
                    self.cleanuppod(snode, pnode)
                else:
                    print('Creating '+podname+ ' at '+IDP,CSSaccess.podcreate(IDP,podname,email,self.password))

                     

                

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
        pbar=tqdm.tqdm(total=len(files))
        for targetUrl in files:
            res=CSSA.delete_file(targetUrl)
            print(res.text)
            if not res.ok:
                CSSA.create_authtoken()
            pbar.update(1)
        pbar.close()
            

    def uploadfiles(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                filetuplelist=[]
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                    #targetUrl=str(self.image.value(fnode,self.namespace.Address))
                    #filetype=str(self.image.value(fnode,self.namespace.Filetype))
                    #filename=str(self.image.value(fnode,self.namespace.Filename))
                    #f=str(self.image.value(fnode,self.namespace.LocalAddress))
                    #file = open(f, "r")
                    #filetext=file.read()
                    #file.close()
                    substring=str(self.image.value(fnode,self.namespace.ReplaceText))
                    #if len(substring)>0:
                    #    filetext=filetext.replace(self.replacetemplate,substring)
                    
                    #res=CSSA.put_url(targetUrl, filetext, filetype)
                    #if not res.ok:
                    #    print(targetUrl,res.text)
                    #    #print(filetext)
                    #    continue

                    targetUrl=str(self.image.value(fnode,self.namespace.Address))
                    filetype=str(self.image.value(fnode,self.namespace.Filetype))
                    f=str(self.image.value(fnode,self.namespace.LocalAddress))
                    filetuplelist.append((f,targetUrl,filetype,substring))
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                a=CSSA.create_authstring()
                t=CSSA.create_authtoken()
                
                print('populating',podaddress)
                FileUploader.uploadllistreplacewithbar(filetuplelist,self.replacetemplate,podaddress,CSSA)

    def uploadacls(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                a=CSSA.create_authstring()
                t=CSSA.create_authtoken()
                webid=str(self.image.value(pnode,self.namespace.WebID))
                print('populating acls for',podaddress)
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                    targetUrl=str(self.image.value(fnode,self.namespace.Address))
                    
                    webidlist=[]
                    for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                        webid=str(self.image.value(anode,self.namespace.WebID))
                        webidlist.append(webid)
                    
                    #openbool= fnode in self.openfilelist
                    openbool= fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile)

                    res=CSSA.makeurlaccessiblelist(targetUrl,podaddress,webid,webidlist,openbool)
                    print(res,end=' ')
                    print('\n')

    def inserttriples(self):
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            IDP=str(self.image.value(snode,self.namespace.Address))
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podname=str(self.image.value(pnode,self.namespace.Name))
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                a=CSSA.create_authstring()
                t=CSSA.create_authtoken()
                webid=str(self.image.value(pnode,self.namespace.WebID))
                print('inserting triples ',podaddress)
                triplestring=self.image.value(pnode,self.namespace.TripleString)
                if len(triplestring)>0:
                        res=CSSA.inserttriplestring(webid[:-3],triplestring)
                        print(webid,res.text)
                
                for fnode in self.image.objects(pnode,self.namespace.Contains):   
                    
                    triplestring=self.image.value(fnode,self.namespace.TripleString)
                    if len(triplestring)>0:
                        res=CSSA.inserttriplestring(webid[:-3],triplestring)
                        print(webid,res.text)

    def uploadpnodewithbar(self,pnode,IDP):
        podaddress=str(self.image.value(pnode,self.namespace.Address))
        
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
            
            f=str(self.image.value(fnode,self.namespace.LocalAddress))
            file = open(f, "r")
            filetext=file.read()
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
                        filetuplelist.append((f,targetUrl,filetype))
                    executor.submit(FileUploader.uploadllistwithbar, filetuplelist,podaddress,CSSA)

    def storeexplocal(self,dir):
        os.makedirs(dir,exist_ok=True)
        i=0
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
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
                    file = open(f, "r")
                    filetext=file.read()
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
                    #if fnode in self.openfilelist:
                    if fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
                        acltext=returnaclopen(targetUrl,webidlist)
                    else:
                        acltext=returnacldefault(targetUrl,webidlist)
                    flocacl=poddir+'/'+filename+'.acl'
                    file = open (flocacl,'w')
                    file.write(acltext)
                    file.close
                    ftrunc=targetUrl[len(podaddress):]
                    filetuples.append((ftrunc,filetext,webidlist))
                index=PodIndexer.aclindextupleswebidnewdirs(filetuples)
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
                    index=PodIndexer.aclindextupleswebidnewdirs(d) 
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
                    print(d[0])
                    index=PodIndexer.aclindextupleswebidnewdirs(d)
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
            CSSAe.create_authstring()
            CSSAe.create_authtoken()
            print(IDP,CSSAe.put_file(self.espressopodname, self.espressoindexfile, metaindexdata, 'text/csv'))
           
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
                index=PodIndexer.aclindextupleswebidnewdirs(d)
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
            for pnode in self.image.objects(snode,self.namespace.Contains):
                
                podindexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
                
                USERNAME=str(self.image.value(pnode,self.namespace.Email))
                PASSWORD=self.password
                CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                CSSA.create_authstring()
                CSSA.create_authtoken()
                
                
                #print(acldef)
                targetUrl=podindexaddress+'.acl'
                #print(targetUrl)
                headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
                res= requests.put(targetUrl,headers=headers,data=acldefopen)
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

    def storelocalfileszip(self,dir):
        #os.makedirs(self.localimage,exist_ok=True)
        pbar=tqdm.tqdm(total=self.filenum)
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            serdir=dir+str(self.image.value(snode,self.namespace.Sword))
            os.makedirs(serdir,exist_ok=True)
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podzipfile=serdir +'/'+str(self.image.value(pnode,self.namespace.Name))+'.zip'
                podwebid=str(self.image.value(pnode,self.namespace.WebID))
                with ZipFile(podzipfile, 'w') as podzip:
                    for fnode in self.image.objects(pnode,self.namespace.Contains):
                        targetUrl=str(self.image.value(fnode,self.namespace.Address))
                        filetype=str(self.image.value(fnode,self.namespace.Filetype))
                        filename=str(self.image.value(fnode,self.namespace.Filename))
                        f=str(self.image.value(fnode,self.namespace.LocalAddress))
                        file = open(f, "r")
                        filetext=file.read()
                        file.close()
                        podzip.writestr(filename,filetext)
                        
                        webidlist=[]
                        for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                            webid=str(self.image.value(anode,self.namespace.WebID))
                            webidlist.append(webid)
                        #webidstring='<'+'>,<'.join(webidlist)+'>'
                        openbool = fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile)
                        
                        acltext=CSSaccess.returnacllist(targetUrl,podaddress,webidlist,openbool)
                        flocacl=filename+'.acl'
                        podzip.writestr(flocacl,acltext)
                        pbar.update(1)
                        #ftrunc=targetUrl[len(podaddress):]
                        #filetuples.append((ftrunc,filetext,webidlist))
        pbar.close()

    def storelocalindexzip(self,dir):
        #os.makedirs(self.localimage,exist_ok=True)
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            serdir=dir+str(self.image.value(snode,self.namespace.Sword))
            os.makedirs(serdir,exist_ok=True)
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podzipindexfile=serdir +'/'+str(self.image.value(pnode,self.namespace.Name))+'index.zip'
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                podwebid=str(self.image.value(pnode,self.namespace.WebID))
                filetuples=[]
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                        targetUrl=str(self.image.value(fnode,self.namespace.Address))
                        filetype=str(self.image.value(fnode,self.namespace.Filetype))
                        filename=str(self.image.value(fnode,self.namespace.Filename))
                        f=str(self.image.value(fnode,self.namespace.LocalAddress))
                        file = open(f, "r")
                        filetext=file.read()
                        file.close()
                        webidlist=[]
                        for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                            webid=str(self.image.value(anode,self.namespace.WebID))
                            webidlist.append(webid)
                        #webidstring='<'+'>,<'.join(webidlist)+'>'
                        #openbool = fnode in self.openfilelist
                        if fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
                            webidlist.append('*')
                        ftrunc=targetUrl[len(podaddress):]
                        filetuples.append((ftrunc,filetext,webidlist))
                index=PodIndexer.aclindextupleswebidnew(filetuples)
                n=len(index.keys())
                pbar = tqdm.tqdm(total=n,desc=podzipindexfile)
                with ZipFile(podzipindexfile, 'w') as podindexzip:
                    for (name,body) in index.items():
                        
                        podindexzip.writestr(name,body)
                        info = podindexzip.getinfo(name)
                        info.external_attr = 0o777 << 16
                        pbar.update(1)
                pbar.close()

    def assignlocalimage(self,dir):
        i=0
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            sword='S'+str(i)
            i=i+1
            self.image.add((snode,self.namespace.LocalAddress,Literal(dir+self.podname+'/'+sword)))
            pass
        
    def storelocalindexzipdirs(self,zipdir):
        #os.makedirs(self.localimage,exist_ok=True)
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            serdir=zipdir+str(self.image.value(snode,self.namespace.Sword))
            os.makedirs(serdir,exist_ok=True)
            for pnode in self.image.objects(snode,self.namespace.Contains):
                podzipindexfile=serdir +'/'+str(self.image.value(pnode,self.namespace.Name))+'index.zip'
                podaddress=str(self.image.value(pnode,self.namespace.Address))
                filetuples=[]
                for fnode in self.image.objects(pnode,self.namespace.Contains):
                        targetUrl=str(self.image.value(fnode,self.namespace.Address))
                        filetype=str(self.image.value(fnode,self.namespace.Filetype))
                        filename=str(self.image.value(fnode,self.namespace.Filename))
                        f=str(self.image.value(fnode,self.namespace.LocalAddress))
                        file = open(f, "r")
                        filetext=file.read()
                        file.close()
                        webidlist=[]
                        for anode in self.image.objects(fnode,self.namespace.AccessibleBy):
                            webid=str(self.image.value(anode,self.namespace.WebID))
                            webidlist.append(webid)
                        if fnode in self.image.subjects(self.namespace.Type,self.namespace.OpenFile):
                            webidlist.append('*')
                        ftrunc=targetUrl[len(podaddress):]
                        filetuples.append((ftrunc,filetext,webidlist))
                index=PodIndexer.aclindextupleswebidnewdirs(filetuples)
                n=len(index.keys())
                pbar = tqdm.tqdm(total=n,desc=podzipindexfile)
                podindexzip=ZipFile(podzipindexfile, 'w')
                for (name,body) in index.items():
                        
                        podindexzip.writestr(name,body)
                        info = podindexzip.getinfo(name)
                        info.external_attr = 0o777 << 16
                        pbar.update(1)
                pbar.close()
                podindexzip.close()

    def distributezips(self,zipdir,SSHUser,SSHPassword,targetdir='/srv/espresso/'):
        #serverlist=[a.rsplit('/')[-2].rsplit(':')[0] for a in serverlistglobal]

        #print(serverlist)
        i=0
        for snode in self.image.subjects(self.namespace.Type,self.namespace.Server):
            server=str(self.image.value(snode,self.namespace.Address)).rsplit('/')[-2].rsplit(':')[0]
            print('Uploading',server)
            client = SSHClient()
        #client.load_system_host_keys()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh = SSHClient()
            client.load_system_host_keys()    
            client.connect(server, port=22, username=SSHUser, password=SSHPassword)
            scp = SCPClient(client.get_transport())
            sdir=zipdir+str(self.image.value(snode,self.namespace.Sword))+'/'
            pbar=tqdm.tqdm(total=len(os.listdir(sdir)))
            for filename in os.listdir(sdir):
                filepath = os.path.join(sdir, filename)
            # checking if it is a file
                if os.path.isfile(filepath) and not filename.startswith('.'):
                    #print('sending',filepath)
                    scp.put(filepath,targetdir)
                    #print(res)
                pbar.update(1)
            pbar.close()
            #scpuploader.serverscpupload(scp,sdir)


def loadexp(filename):
        podname=filename[:-7]
        experiment=ESPRESSOexperiment(podname=podname)
        experiment.loadexp(filename)
        return experiment


