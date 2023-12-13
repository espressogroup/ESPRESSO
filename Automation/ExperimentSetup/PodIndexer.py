import CSSaccess, cleantext, string
from rdflib import URIRef, BNode, Literal, Graph, Namespace
#from rdflib.namespace import ACL
import concurrent.futures
import time, tqdm
from multiprocessing import Pool

def crawl(address, CSSa):
    filedict= dict()
    data = CSSa.get_file(address)
    #print(data)
    g=Graph().parse(data=data,publicID=address)
    #q1='''
    #prefix ldp: <http://www.w3.org/ns/ldp#>
    
    #SELECT ?s ?p ?o WHERE{
    #   ?s ?p ?o .
    #}
    #'''
    #for r in g.query(q1):
    #    print(r)
    q='''
    prefix ldp: <http://www.w3.org/ns/ldp#>
    
    SELECT ?f WHERE{
        ?a ldp:contains ?f.
    }
    '''
    for r in g.query(q):
        #print(r["f"])
        f=str(r["f"])
        if f[-1]=='/':
            d=crawl(f,CSSa)
            filedict|=d
        elif ('.' in f.rsplit('/')[-1]) and (not f.endswith('ttl')) and (not f.endswith('.ndx')) and (not f.endswith('.file')):
            filedict[f]=CSSa.get_file(f)
        else:
            pass

    return filedict




def aclcrawlwebidnew(address,podaddress, CSSa):
    filetuples= []
    data = CSSa.get_file(address)
    #print(data)
    g=Graph().parse(data=data,publicID=address)
    #q1='''
    #prefix ldp: <http://www.w3.org/ns/ldp#>
    
    #SELECT ?s ?p ?o WHERE{
    #   ?s ?p ?o .
    #}
    #'''
    #for r in g.query(q1):
    #    print(r)
    q='''
    prefix ldp: <http://www.w3.org/ns/ldp#>
    
    SELECT ?f WHERE{
        ?a ldp:contains ?f.
    }
    '''
    for r in g.query(q):
        #print(r["f"])
        f=str(r["f"])
        if f[-1]=='/':
            d=aclcrawlwebidnew(f,podaddress,CSSa)
            filetuples=filetuples+d
        elif ('.' in f.rsplit('/')[-1]) and (not f.endswith('ttl')) and (not f.endswith('.ndx')) and (not f.endswith('.file')) and (not f.endswith('.sum')) and (not f.endswith('.webid')):
            text=CSSa.get_file(f)
            webidlist=getwebidlistlist(f,CSSa)
            ftrunc=f[len(podaddress):]
            filetuples.append((ftrunc,text,webidlist))
        else:
            pass

    return filetuples

def crawllist(address, CSSa):
    filelist= []
    data = CSSa.get_file(address)
    #print(data)
    g=Graph().parse(data=data,publicID=address)
    #q1='''
    #prefix ldp: <http://www.w3.org/ns/ldp#>
    
    #SELECT ?s ?p ?o WHERE{
    #   ?s ?p ?o .
    #}
    #'''
    #for r in g.query(q1):
    #    print(r)
    q='''
    prefix ldp: <http://www.w3.org/ns/ldp#>
    
    SELECT ?f WHERE{
        ?a ldp:contains ?f.
    }
    '''
    for r in g.query(q):
        #print(r["f"])
        f=str(r["f"])
        if f[-1]=='/':
            d=crawllist(f,CSSa)
            filelist+=d
        else:
            filelist.append(f)
      
    return filelist

def indexchecker(address, CSSa):
    files= []
    data = CSSa.get_file(address)
    #print(data)
    g=Graph().parse(data=data,publicID=address)
    #q1='''
    #prefix ldp: <http://www.w3.org/ns/ldp#>
    
    #SELECT ?s ?p ?o WHERE{
    #   ?s ?p ?o .
    #}
    #'''
    #for r in g.query(q1):
    #    print(r)
    q='''
    prefix ldp: <http://www.w3.org/ns/ldp#>
    
    SELECT ?f WHERE{
        ?a ldp:contains ?f.
    }
    '''
    for r in g.query(q):
        f=str(r["f"])
        files.append(f.rsplit('/')[-1])

    return files


def getwebidlist(address,CSSA):
    acladdress=address+'.acl'
    acldata=CSSA.get_file(acladdress)
    #print(acldata)
    g=Graph().parse(data=acldata,publicID=acladdress)
    ACL=Namespace('http://www.w3.org/ns/auth/acl')
    #for s,p,o in g:
        #print(s,p,o)
    webidlist=[]
    q='''prefix acl: <http://www.w3.org/ns/auth/acl#>

    SELECT ?a ?f WHERE{
        ?a a acl:Authorization.
        ?a acl:mode acl:Read.
        ?a acl:agent ?f.
    }
    '''
    q1='''prefix acl: <http://www.w3.org/ns/auth/acl#>
    SELECT (COUNT(?a) as ?n) WHERE{
        ?a a acl:Authorization.
        ?a acl:mode acl:Read.
        ?a acl:agentClass foaf:Agent.
    } 
    '''
    #for i in g.subjects('acl:mode','acl.Read'):
        #print(i)
        #for webid in g.object(i,ACL.agent):
            #webidlist.append(str(webid))

    for r in g.query(q1):
        if int(r['n'])>0:
            webidlist.append('*')
    for r in g.query(q):
        #print(r["f"])
        f=str(r["f"])
        webidlist.append(f)
    webidstring=','.join(webidlist)
    return webidstring

def getwebidlistlist(address,CSSA):
    acladdress=address+'.acl'
    #print('getting webidlist for '+address)
    acldata=CSSA.get_file(acladdress)
    #print(acldata)
    g=Graph().parse(data=acldata,publicID=acladdress)
    ACL=Namespace('http://www.w3.org/ns/auth/acl')
    #for s,p,o in g:
        #print(s,p,o)
    webidlist=[]
    q='''prefix acl: <http://www.w3.org/ns/auth/acl#>

    SELECT ?a ?f WHERE{
        ?a a acl:Authorization.
        ?a acl:mode acl:Read.
        ?a acl:agent ?f.
    }
    '''
    q1='''prefix acl: <http://www.w3.org/ns/auth/acl#>
    SELECT (COUNT(?a) as ?n) WHERE{
        ?a a acl:Authorization.
        ?a acl:mode acl:Read.
        ?a acl:agentClass foaf:Agent.
    } 
    '''
    #for i in g.subjects('acl:mode','acl.Read'):
        #print(i)
        #for webid in g.object(i,ACL.agent):
            #webidlist.append(str(webid))

    for r in g.query(q1):
        if int(r['n'])>0:
            webidlist.append('*')
    for r in g.query(q):
        #print(r["f"])
        f=str(r["f"])
        webidlist.append(f)
    return list(set(webidlist))



class Appearance:
    """
    Represents the appearance of a term in a given document, along with the
    frequency of appearances in the same one.
    """
    def __init__(self, docId, frequency):
        self.docId = docId
        self.frequency = frequency
        
    def __repr__(self):
        """
        String representation of the Appearance object
        """
        return str(self.__dict__)

def myclean(text):
    res=cleantext.clean_words(text,
    clean_all= False, # Execute all cleaning operations
    extra_spaces=True ,  # Remove extra white spaces 
    stemming=False , # Stem the words
    stopwords=True ,# Remove stop words
    lowercase=True ,# Convert to lowercase
    numbers=True ,# Remove all digits 
    punct=True ,# Remove all punctuations
    #reg: str = '<regex>', # Remove parts of text based on regex
    #reg_replace: str = '<replace_value>', # String to replace the regex used in reg
    stp_lang='english'  # Language for stop words
    )
    return res

class LdpIndex:
    """
    Inverted Index class.
    """
    def __init__(self):
        self.index = dict()
        self.f=0
    def __repr__(self):
        """
        String representation of the index
        """
        return self.index
        #return self.index.serialize(format='json-ld', indent=4)
        
    
    def index_id_text(self, id, text):
        """
        Process a given document, save it to the DB and update the index.
        """
        
        terms=myclean(text)
        #print(terms)
        appearances_dict = dict()
        # Dictionary with each term and the frequency it appears in the text.
        for term in terms:
            if len(term)<50:
                termword=term+'.ndx'
                term_frequency = appearances_dict[termword] if termword in appearances_dict else 0
                appearances_dict[termword] =  term_frequency + 1
            
        fileword='f'+str(self.f)
        self.f=self.f+1
        filename=fileword+'.file'
        self.index[filename]=id
        self.index['index.sum']=str(self.f)
        #print(fileword,id)
        for (key, freq) in appearances_dict.items():
            if key not in self.index.keys():
                self.index[key]=''           
            self.index[key]=self.index[key]+fileword+','+str(freq)+'\r\n'                      

        return id

    def index_id_text_acl(self, id, text, webidliststring):
        """
        Process a given document, save it to the DB and update the index.
         """
        
        terms=myclean(text)
            #print(terms)
        appearances_dict = dict()
            # Dictionary with each term and the frequency it appears in the text.
        for term in terms:
            if len(term)<50:
                termword=term+'.ndx'
                term_frequency = appearances_dict[termword] if termword in appearances_dict else 0
                appearances_dict[termword] =  term_frequency + 1
            
        fileword='f'+str(self.f)
        self.f=self.f+1
        filename=fileword+'.file'
        self.index[filename]=id+','+ webidliststring
        self.index['index.sum']=str(self.f)
        #print(fileword,id)
        for (key, freq) in appearances_dict.items():
            if key not in self.index.keys():
                self.index[key]=''           
            self.index[key]=self.index[key]+fileword+','+str(freq)+'\r\n'                      

        return id
    
    def indexwebid(self, id, text, webidlist):
        terms=myclean(text)
            #print(terms)
        appearances_dict = dict()
            # Dictionary with each term and the frequency it appears in the text.
        for term in terms:
            if len(term)<50:
                termword=term+'.ndx'
                term_frequency = appearances_dict[termword] if termword in appearances_dict else 0
                appearances_dict[termword] =  term_frequency + 1
            
        fileword='f'+str(self.f)
        self.f=self.f+1
        filename=fileword+'.file'
        self.index[filename]=id
        for webid in webidlist:
            if webid=="*":
                webidword='openaccess.webid'
            else:
                webidword=webid.translate(str.maketrans('', '', string.punctuation))+'.webid'
            if webidword not in self.index.keys():
                self.index[webidword]=''
            self.index[webidword]=self.index[webidword]+fileword+'\r\n'
        self.index['index.sum']=str(self.f)
        #print(fileword,id)
        for (key, freq) in appearances_dict.items():
            if key not in self.index.keys():
                self.index[key]=''           
            self.index[key]=self.index[key]+fileword+','+str(freq)+'\r\n'                      

        return id

    def indexwebidnew(self, id, text, webidlist):
        terms=myclean(text)
            #print(terms)
        appearances_dict = dict()
            # Dictionary with each term and the frequency it appears in the text.
        for term in terms:
            if len(term)<50:
                termword=term+'.ndx'
                term_frequency = appearances_dict[termword] if termword in appearances_dict else 0
                appearances_dict[termword] =  term_frequency + 1
            
        fileword='f'+str(self.f)
        self.f=self.f+1
        #filename=fileword+'.file'
        #self.index[filename]=id
        for webid in webidlist:
            if webid=="*":
                webidword='openaccess.webid'
            else:
                webidword=webid.translate(str.maketrans('', '', string.punctuation))+'.webid'
            if webidword not in self.index.keys():
                self.index[webidword]=''
            self.index[webidword]=self.index[webidword]+fileword+','+id+'\r\n'
        self.index['index.sum']=str(self.f)
        #print(fileword,id)
        for (key, freq) in appearances_dict.items():
            if key not in self.index.keys():
                self.index[key]=''           
            self.index[key]=self.index[key]+fileword+','+str(freq)+'\r\n'                      

        return id

    def indexwebidnewdirs(self, id, text, webidlist):
        terms=myclean(text)
            #print(terms)
        appearances_dict = dict()
            # Dictionary with each term and the frequency it appears in the text.
        for term in terms:
            if len(term)<50:
                termword='/'.join(term)+'.ndx'
                term_frequency = appearances_dict[termword] if termword in appearances_dict else 0
                appearances_dict[termword] =  term_frequency + 1
            
        fileword='f'+str(self.f)
        self.f=self.f+1
        #filename=fileword+'.file'
        #self.index[filename]=id
        for webid in webidlist:
            if webid=="*":
                webidword='openaccess.webid'
            else:
                webidword=webid.translate(str.maketrans('', '', string.punctuation))+'.webid'
            if webidword not in self.index.keys():
                self.index[webidword]=''
            self.index[webidword]=self.index[webidword]+fileword+','+id+'\r\n'
        self.index['index.sum']=str(self.f)
        #print(fileword,id)
        for (key, freq) in appearances_dict.items():
            if key not in self.index.keys():
                self.index[key]=''           
            self.index[key]=self.index[key]+fileword+','+str(freq)+'\r\n'                      

        return id



def ldpindexdict(filedict):
    ldpindex=LdpIndex()
    for (id,text) in filedict.items():
        print('indexing '+id)
        ldpindex.index_id_text(id, text)
    return ldpindex.index

def aclindextuples(filetuples):
    ldpindex=LdpIndex()
    for (id,text,webidlist) in filetuples:
        print('indexing '+id)
        ldpindex.index_id_text_acl(id, text, webidlist)
    return ldpindex.index



def aclindextupleswebid(filetuples):
    ldpindex=LdpIndex()
    for (id,text,webidlist) in filetuples:
        print('indexing '+id)
        ldpindex.indexwebid(id, text, webidlist)
    return ldpindex.index

def aclindextupleswebidnew(filetuples):
    ldpindex=LdpIndex()
    pbar=tqdm.tqdm(len(filetuples))
    for (id,text,webidlist) in filetuples:
        #print('indexing '+id)
        ldpindex.indexwebidnew(id, text, webidlist)
        pbar.update(1)
    pbar.close()
    return ldpindex.index

def aclindextupleswebidnewdirs(filetuples):
    ldpindex=LdpIndex()
    pbar=tqdm.tqdm(len(filetuples))
    for (id,text,webidlist) in filetuples:
        #print('indexing '+id)
        ldpindex.indexwebidnewdirs(id, text, webidlist)
        pbar.update(1)
    pbar.close()
    return ldpindex.index


def uploadaclindexwithbar(ldpindex,indexdir,CSSA):
    n=len(ldpindex.keys())
    i=1
    pbar = tqdm.tqdm(total=n,desc=indexdir)
    
    
    for (name,body) in ldpindex.items():
        #print('putting '+str(i)+'/'+str(n),end=' ')
        i=i+1
        targetUrl=indexdir+name
        #print(targetUrl,end=' ')
        res=CSSA.put_url(targetUrl,body,'text/csv')
        #print(res,end='\r')
        if (not res.ok):
            CSSA.create_authtoken()
            res=CSSA.put_url(targetUrl,body,'text/csv')
            if (not res.ok):
                print('Cannot upload index')
                break
        pbar.update(1)
    pbar.close()
    print('index for',indexdir,'is uploaded',n,'files')

def uploadaclindex(ldpindex,indexdir,CSSA):
    n=len(ldpindex.keys())
    i=1
    for (name,body) in ldpindex.items():
        #print('putting '+str(i)+'/'+str(n),end=' ')
        i=i+1
        targetUrl=indexdir+name
        #print(targetUrl,end=' ')
        res=CSSA.put_url(targetUrl,body,'text/csv')
        #print(res,end='\r')
        if (not res.ok):
            CSSA.create_authtoken()
            res=CSSA.put_url(targetUrl,body,'text/csv')
            if (not res.ok):
                print('Cannot upload index')
                break
    print('index for',indexdir,'is uploaded',n,'files')

def getacl(podpath, targetUrl, CSSA):
    line=targetUrl[len(podpath):]
    res=CSSA.get_file(podpath+line+'.acl')  
    while not res.ok:
        line= '/'.join(line.rsplit('/')[:-1])
        res=CSSA.get_file(podpath+line+'.acl') 
        if len(line)==0:
            break
    return res.text    




def askindex(podindexaddress, keyword, webid):
    begtime=time.time_ns()
    wordaddress=podindexaddress+keyword+'.ndx'
    webidaddress=podindexaddress+webid.translate(str.maketrans('', '', string.punctuation))+'.webid'
    wordres=CSSaccess.get_file(wordaddress)
    ndxtime=time.time_ns()-begtime
    ans=dict()       
    if wordres.ok:
        openaccessaddress=podindexaddress+'openaccess.webid'
        #openaccessres=CSSaccess.get_file(openaccessaddress)
        opendic=dict()
        openaccesstime=time.time_ns()-begtime
        #if openaccessres.ok:
        #    openlist=openaccessres.text.rsplit('\r\n')[:-1]
        #    opendic={fwordfadd.rsplit(',')[0]: podadress+fwordfadd.rsplit(',')[1] for fwordfadd in openlist}
        podaddress=podindexaddress[:-14]
        webidaddress=podindexaddress+webid.translate(str.maketrans('', '', string.punctuation))+'.webid'
        webidfilelist=[]
        webidres=CSSaccess.get_file(webidaddress)
        webidtime=time.time_ns()-begtime
        
        if webidres.ok:
            webidfilelist=webidres.text.rsplit('\r\n')[:-1]
            opendic=opendic|{fwordfadd.rsplit(',')[0]: podaddress+fwordfadd.rsplit(',')[1] for fwordfadd in webidfilelist}

        wordfilelist=wordres.text.rsplit('\r\n')[:-1]
        worddic={filefreq.rsplit(',')[0]: filefreq.rsplit(',')[1] for filefreq in wordfilelist}
            #print(filelist)
        accessibleset =set(worddic.keys())&(set(opendic.keys()))
        settime=round(time.time_ns()-begtime)
        ans=dict((opendic[k], worddic[k]) for k in accessibleset if k in worddic)
        #for fword in accessibleset:
        #    filepath=podindexaddress+fword+'.file'
        #    filename=CSSaccess.get_file(filepath).text
        #    ans[filename]=int(worddic[fword])
        #for filefreq in wordfilelist:
                #print(filefreq)
        #    fword=filefreq.rsplit(',')[0]
        #    if fword in accessiblelist:
        #        filepath=podindexaddress+fword+'.file'
        #        filename=CSSaccess.get_file(filepath).text
        #        freq=filefreq.rsplit(',')[1]
                #print(filename, freq)
        #        ans[filename]=int(freq)
        totaltime=(time.time_ns()-begtime)
        print('for '+podaddress,'ndx',round(ndxtime/1000000,3),'oa',round((openaccesstime-ndxtime)/1000000,3),'webid',round((webidtime-openaccesstime)/1000000,3),'set',round((settime-webidtime)/1000000,3),'filetime',round((totaltime-settime)/1000000,3),'total',totaltime/1000000,'fetched',len(ans))
    return ans


