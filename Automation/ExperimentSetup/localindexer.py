import brewmaster, CSSaccess, dpop_utils, requests
from sys import argv

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
    
IDP=argv[1]
espressoindexfile=argv[2]
podname=argv[3]
podindexdir=argv[4]  
print(IDP,espressoindexfile,podname,podindexdir)
indexpod(IDP,espressoindexfile,podname,podindexdir)