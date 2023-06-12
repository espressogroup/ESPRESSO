import CSSaccess, rdfindex, cleantext
from rdflib import URIRef, BNode, Literal, Graph, Namespace


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
            d=crawl(f,CSSa,indexaddress)
            filelist+=d
        else:
            filelist.append(f)
      
    return filelist

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
            termword=term+'.ndx'
            term_frequency = appearances_dict[termword] if termword in appearances_dict else 0
            appearances_dict[termword] =  term_frequency + 1
            
        fileword='f'+str(self.f)
        self.f=self.f+1
        filename=fileword+'.file'
        self.index[filename]=id
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

def uploadldpindex(ldpindex,podname,espressodir,CSSA):
    n=len(ldpindex.keys())
    i=0
    for (name,body) in ldpindex.items():
        print('putting '+str(i)+'/'+str(n)+' '+name+' in ' + podname)
        i=i+1
        filename=espressodir+name
        res=CSSA.put_file(podname,filename,body,'text/csv')
        print(res)
        if (not res.ok):
            CSSA.create_authtoken()
            res=CSSA.put_file(podname,filename,body,'text/csv')

        

def coffeefilter(metaindexaddress,keyword):
    res=CSSaccess.get_file(metaindexaddress)
    #print(res.text)
    podindexlist=res.text.rsplit('\r\n')[:-1]
    #print(podindexlist)
    ans=dict()
    for podindex in podindexlist:
        wordaddress=podindex+keyword+'.ndx'
        res=CSSaccess.get_file(wordaddress)
        
        if res.ok:
            filelist=res.text.rsplit('\r\n')[:-1]
            #print(filelist)
        
            for filefreq in filelist:
                #print(filefreq)
                filepath=podindex+filefreq.rsplit(',')[0]+'.file'
                filename=CSSaccess.get_file(filepath).text
                freq=filefreq.rsplit(',')[1]
                #print(filename, freq)
                ans[filename]=int(freq)
    ans=dict(sorted(ans.items(), key=lambda x:x[1], reverse=True))
    return ans
