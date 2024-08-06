import cleantext, string,flexexperiment
import concurrent.futures
import time, tqdm,os
from sys import argv


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

class WordIndex:
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
        
    
    def indextext(self, text):
        """
        Process a given document, save it to the DB and update the index.
        """
        if len(text)>0:
            terms=set(myclean(text))
        else:
            return
        #print(terms)
        
        self.f=self.f+1
        #print(fileword,id)
        for key in terms:
            if key not in self.index.keys():
                self.index[key]=0           
            self.index[key]=self.index[key]+1                      

    

    
def keywordfinderexp(experimentfile,kfile,label='file'):
    experiment=flexexperiment.loadexp(experimentfile)
    #filelist=os.listdir(kdir)
    #print(filelist)
    index=WordIndex()
    pbar=tqdm.tqdm(total=experiment.filenum)
    for fnode in experiment.image.subjects(experiment.namespace.Type,experiment.namespace.File):
        filepath=experiment.image.value(fnode,experiment.namespace.LocalAddress)
        if str(experiment.image.value(fnode,experiment.namespace.Label))==label:
            file = open(filepath, "r")
            filetext=file.read()
            file.close()
            index.indextext(filetext)
        pbar.update(1)
    pbar.close()

    reslist = sorted(index.index.items(), key=lambda x:x[1])
    file = open(kfile, "w")
    for (key,val) in reslist:
        file.write(key+','+str(val)+'\n')
    file.close()



def keywordfinder(kdir,kfile):
    filelist=next(os.walk(kdir))[2]
    #filelist=os.listdir(kdir)
    #print(filelist)
    index=WordIndex()
    pbar=tqdm.tqdm(total=len(filelist))
    for filename in filelist:
        if not filename.startswith('.'):
            filepath=os.path.join(kdir,filename)
            file = open(filepath, "r")
            filetext=file.read()
            file.close()
            index.indextext(filetext)
            pbar.update(1)
    pbar.close()

    reslist = sorted(index.index.items(), key=lambda x:x[1])
    file = open(kfile, "w")
    for (key,val) in reslist:
        file.write(key+','+str(val)+'\n')
    file.close()

kdir=argv[1]
kfile=argv[2]

keywordfinderexp(kdir,kfile,label='medhist')