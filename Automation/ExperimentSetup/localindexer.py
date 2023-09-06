import brewmaster, CSSaccess, dpop_utils, requests
from sys import argv
import threading
import time, tqdm
import concurrent.futures

def index(IDP,espressoindexfile,podname,podnum,podindexdir,espressopodname='ESPRESSO', espressoemail='espresso@example.com', podemail='@example.org', password='12345'):
            metaindexdata=''
            print('indexing '+ IDP)
            for p in range(podnum):
                pod=podname+str(p)
                print('indexing pod '+pod)
                email=pod+podemail
                CSSA=CSSaccess.CSSaccess(IDP, email, password)
                a=CSSA.create_authstring()
                #print(a)
                t=CSSA.create_authtoken()
                #print(t)
                podaddress=IDP+pod+'/'
                indexaddress=podaddress+podindexdir
                d=brewmaster.crawl(podaddress, CSSA)
                #print(d.keys())

                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
                index=brewmaster.ldpindexdict(d)
                brewmaster.uploadldpindex(index, pod, podindexdir, CSSA)
                addstring=indexaddress+'\r\n'
                metaindexdata+=addstring
                
            CSSAe=CSSaccess.CSSaccess(IDP, espressoemail, password)
            a=CSSAe.create_authstring()
            t=CSSAe.create_authtoken()
            
            print(CSSAe.put_file(espressopodname, espressoindexfile, metaindexdata, 'text/csv'))
            
def indexpod(IDP,espressoindexfile,podname,podindexdir,espressopodname='ESPRESSO', espressoemail='espresso@example.com', podemail='@example.org', password='12345'):
            metaindexdata=''
            print('indexing '+ IDP+podname)
            email=podname+podemail
            CSSA=CSSaccess.CSSaccess(IDP, email, password)
            a=CSSA.create_authstring()
                #print(a)
            t=CSSA.create_authtoken()
                #print(t)
            podaddress=IDP+podname+'/'
            indexaddress=podaddress+podindexdir
            d=brewmaster.crawl(podaddress, CSSA)
                #print(d.keys())

                #index=rdfindex.podlistindexer(d,namespace,podaddress,reprformat)
            index=brewmaster.ldpindexdict(d)
            brewmaster.uploadldpindex(index, podname, podindexdir, CSSA)
            addstring=indexaddress+'\r\n'
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
            targetUrl=indexaddress+'.acl'
                #print(targetUrl)
            headers={ 'content-type': 'text/turtle', 'authorization':'DPoP '+CSSA.authtoken, 'DPoP': dpop_utils.create_dpop_header(targetUrl, "PUT", CSSA.dpopKey)}
            res= requests.put(targetUrl,headers=headers,data=acldef)
                #res=CSSAccess.get_file(indexaddress+'.acl')
            print(res)
            print(indexaddress)

def indexexperiment(IDP,podname,numberofpods,podindexdir,podemail='@example.org',password='12345'):
    print('indexing '+ IDP+podname)
    #IDP=str(self.image.value(snode,self.namespace.Address))
    with concurrent.futures.ThreadPoolExecutor(max_workers=int(numberofpods)) as executor:
        # submit tasks
            
        for i in range(int(numberofpods)):
            thispodname=podname+str(i)
            podaddress=IDP+thispodname+'/'
            #podname=str(self.image.value(pnode,self.namespace.Name))
            USERNAME=thispodname+podemail
            PASSWORD=password
            CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
            CSSA.create_authstring()
            CSSA.create_authtoken()
            d=brewmaster.aclcrawlwebidnew(podaddress,podaddress, CSSA)
            indexaddress=podaddress+podindexdir
            index=brewmaster.aclindextupleswebidnew(d)
            executor.submit(brewmaster.uploadaclindexwithbar, index, indexaddress, CSSA)
            #brewmaster.uploadaclindexwithbar(index,indexaddress,CSSA)

def uploadlocalindexexperiment(IDP,podname,serno,numberofpods,podindexdir,locdir,podemail='@example.org',password='12345'):
    with concurrent.futures.ThreadPoolExecutor(max_workers=60) as executor:
                serword='S'+serno
                for i in range(int(numberofpods)):
                    thispodname=podname+str(i)
                    podaddress=IDP+thispodname+'/'
                    #podname=str(self.image.value(pnode,self.namespace.Name))
                    USERNAME=thispodname+podemail
                    PASSWORD=password
                    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
                    CSSA.create_authstring()
                    CSSA.create_authtoken()
                    indexaddress=podaddress+podindexdir
                    filename=locdir+'/'+serword+podname+'.locind'
                    f = open(filename, "r")
                    indexstr=f.read()
                    f.close()
                    index=eval(indexstr)
                    print('starting uploading',filename)
                    executor.submit(brewmaster.uploadaclindexwithbar, index, indexaddress, CSSA)


IDP=argv[1]
#espressoindexfile=argv[2]
podname=argv[2]
#serno=argv[2]
numberofpods=argv[3]
podindexdir=argv[4]  
#locdir=argv[5]
print(IDP,podname,numberofpods,podindexdir)
#uploadlocalindexexperiment(IDP,podname,serno,numberofpods,podindexdir,locdir)
indexexperiment(IDP,podname,numberofpods,podindexdir)