import os, re, math, random, shutil,pandas

def distribute(files,places,zipf):
    a=1
    total=0
    for i in range(places):
        total +=1/((i+1)*zipf)
        a/=((i+1)*zipf)
    print (total)
    numbers=[]
    for i in range(places):
        numbers.append(math.floor(len(files)/(total*(i+1)*zipf)))
    print(sum(numbers))
    for i in range(len(files)-sum(numbers)):
        j=math.floor(random.random()*places)
        numbers[j]=numbers[j]+1
    print(numbers)
    res=[]
    pos=0
    for i in range(places):
        res.append(files[pos:pos+numbers[i]])
        pos=pos+numbers[i]
    return (res)

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

class Database:
    """
    In memory database representing the already indexed documents.
    """
    def __init__(self):
        self.db = dict()
    def __repr__(self):
        """
        String representation of the Database object
        """
        return str(self.__dict__)
    
    def get(self, id):
        return self.db.get(id, None)
    
    def add(self, document):
        """
        Adds a document to the DB.
        """
        return self.db.update({document['id']: document})
    def remove(self, document):
        """
        Removes document from DB.
        """
        return self.db.pop(document['id'], None)

class InvertedIndex:
    """
    Inverted Index class.
    """
    def __init__(self, db):
        self.index = dict()
        self.db = db
    def __repr__(self):
        """
        String representation of the Database object
        """
        return str(self.index)
        
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
        update_dict = { key: [appearance]
                       if key not in self.index
                       else self.index[key] + [appearance]
                       for (key, appearance) in appearances_dict.items() }
        self.index.update(update_dict)
        # Add the document into the database
        self.db.add(document)
        return document
    
    def lookup_query(self, query):
        """
        Returns the dictionary of terms with their correspondent Appearances. 
        This is a very naive search since it will just split the terms and show
        the documents where they appear.
        """
        return { term: self.index[term] for term in query.split(' ') if term in self.index }

def highlight_term(id, term, text):
    replaced_text = text.replace(term, "\033[1;32;40m {term} \033[0;0m".format(term=term))
    return "--- document {id}: {replaced}".format(id=id, replaced=replaced_text)

def InvIndex(directory):
    #directory = '/Users/yurysavateev/Python/InvertedIndex/invind.py'
    db = Database()
    index = InvertedIndex(db)
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f):
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            document = {
                'id':filename,
                'text':filetext
            }
            file.close()
            print('indexing '+filename)
            index.index_document(document)
    return index
    
    
def main():
    datasource = '/Users/yurysavateev/iweb data'
    targetdir ='/Users/yurysavateev/Python/dir'
    shutil.rmtree(targetdir)
    os.mkdir(targetdir)
    #print(directory)
    filelist=[]
    for filename in os.listdir(datasource):
        f = os.path.join(datasource, filename)
        # checking if it is a file
        if os.path.isfile(f):
            filelist.append(filename)
    #print(filelist)
    podlist=distribute(filelist,60,1)
    random.shuffle(podlist)
    final=distribute(podlist,5,1)
    j=0
    for s in range(len(final)):
        servername = 'server'+str(s)
        serverpath = os.path.join(targetdir, servername)
        os.mkdir(serverpath)
        for p in range(len(final[s])):
            podname = servername+'pod'+str(p)
            podpath = os.path.join(serverpath, podname)
            os.mkdir(podpath)
            for f in final[s][p]:
                src = os.path.join(datasource,f)
                dst = os.path.join(podpath,f)
                j=j+1
                print(j)
                shutil.copy(src, dst)
            print ('Indexing '+ podpath)
            podindex=InvIndex(podpath)
            podindexfilename='s'+str(s)+'p'+str(p)+'index.csv'
            podindexpath=os.path.join(podpath, podindexfilename)
            podindexfile=open(podindexpath,'w')
            #df = pandas.json_normalize(podindex.index)
            #df.to_csv(podindexpath, index=False, encoding='utf-8')
            podindexfile.write(podindex.__repr__())
            podindexfile.close()
            print('Done')
            #print (p)
        print("end server")
