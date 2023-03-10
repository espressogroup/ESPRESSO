import os, re, math, random, shutil,pandas
from rdflib import URIRef, BNode, Literal, Graph, Namespace
from rdflib.plugin import register, Serializer
#from SPARQLWrapper import SPARQLWrapper

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



class RdfIndex:
    """
    Inverted Index class.
    """
    def __init__(self,namespace):
        self.index = Graph()
        self.n=0
        self.namespace=Namespace(namespace)
    def __repr__(self):
        """
        String representation of the Database object
        """
        return self.index.serialize(format='turtle')
        #return self.index.serialize(format='json-ld', indent=4)
        
    def index_document(self, document):
        """
        Process a given document, save it to the DB and update the index.
        """
        
        # Remove punctuation from the text.
        clean_text = re.sub(r'[^\w\s]','', document['text'])
        terms = clean_text.split(' ')
        appearances_dict = dict()
        # Dictionary with each term and the frequency it appears in the text.
        for term in terms:
            term_frequency = appearances_dict[term].frequency if term in appearances_dict else 0
            appearances_dict[term] = Appearance(document['id'], term_frequency + 1)
            
        # Update the inverted index
        
        #update_dict = { key: [appearance]
        #               if key not in self.index
        #               else self.index[key] + [appearance]
        #               for (key, appearance) in appearances_dict.items() }

        for (key, appearance) in appearances_dict.items():
            if (None, None, Literal(key)) not in self.index:
                wordnode=BNode(key)
                self.index.add((wordnode,self.namespace.lemma,Literal(key)))
            for s, p, o in self.index.triples((None, self.namespace.lemma, Literal(key))):
                appword='A'+str(self.n)
                self.n=self.n+1
                appnode=BNode(appword)
                self.index.add((s,self.namespace.appearsIn,appnode))
                self.index.add((appnode,self.namespace.address,URIRef(document['id'])))
                self.index.add((appnode,self.namespace.frequency,Literal(appearance.frequency)))

                       
        #self.index.update(update_dict)
        return document
    
   # def lookup_query(self, query):
        """
        Returns the dictionary of terms with their correspondent Appearances. 
        This is a very naive search since it will just split the terms and show
        the documents where they appear.
        """
   #     return { term: self.index[term] for term in query.split(' ') if term in self.index }

#def highlight_term(id, term, text):
  #  replaced_text = text.replace(term, "\033[1;32;40m {term} \033[0;0m".format(term=term))
 #   return "--- document {id}: {replaced}".format(id=id, replaced=replaced_text)

def InvIndex(directory,podname,podaddress,namespace):
    #directory = '/Users/yurysavateev/Python/InvertedIndex/invind.py'
    #db = Database()
    index = RdfIndex(namespace)
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f) and filename[0]!='.':
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            document = {
                'id':podaddress+filename,
                'text':filetext
            }
            file.close()
            print('indexing '+filename)
            index.index_document(document)
    return index

def indexer(podpath,podname,podaddress,namespace):
    print ('Indexing '+ podname)
    podindexfilename=podname+'index.ttl'
    podindexpath=os.path.join(podpath, podindexfilename)
    if os.path.exists(podindexpath):
        print('Removing old index')
        os.remove(podindexpath)
    podindex=InvIndex(podpath,podname,podaddress,namespace)
    podindexfile=open(podindexpath,'w')
    #df = pandas.json_normalize(podindex.index)
    #df.to_csv(podindexpath, index=False, encoding='utf-8')
    podindexfile.write(podindex.__repr__())
    podindexfile.close()
    print('Done')
    

