import brewmaster, CSSaccess, dpop_utils
from sys import argv

def index(IDP,espressoindexfile,podname,podnum,podindexdir,espressopodname='ESPRESSO', espressoemail='espresso@example.com', podemail='@example.org', password='12345'):
            metaindexdata=''
            print('indexing '+ IDP)
            for p in podnum:
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
            

    
IDP=argv[1]
espressoindexfile=argv[2]
podname=argv[3]
podnum=int(argv[4])
podindexdir=argv[5]  
print(IDP,espressoindexfile,podname,podnum,podindexdir)
index(IDP,espressoindexfile,podname,podnum,podindexdir)