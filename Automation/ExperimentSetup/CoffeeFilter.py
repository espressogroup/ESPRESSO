import CSSaccess, cleantext, string
from rdflib import URIRef, BNode, Literal, Graph, Namespace
#from rdflib.namespace import ACL
import concurrent.futures
import time, tqdm
from multiprocessing import Pool
import brewmaster
from sys import argv

def askindex(podindexaddress, keyword, webid):
    begtime=time.time_ns()
    wordaddress=podindexaddress+keyword+'.ndx'
    #print(wordaddress)
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



def coffeefilterthreaded(metaindexaddress,keyword,webid):
    res=CSSaccess.get_file(metaindexaddress)
    #print(res.text)
    podindexlist=res.text.rsplit('\r\n')[:-1]
    #print(podindexlist)
    ans=dict()
    #begtime=time.time_ns()
    #print(n)
   
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(podindexlist)) as executor:
        futurelist = {executor.submit(askindex, podindex, keyword, webid): podindex for podindex in podindexlist}
        for future in concurrent.futures.as_completed(futurelist):
            url = futurelist[future]
            try:
                data = future.result()
            except Exception as exc:
                print('%r generated an exception: %s' % (url, exc))
            else:
                ans|=data

    #print(time.time_ns()-begtime)
    
    return ans

def coffeefilterunthreaded(metaindexaddress,keyword,webid):
    res=CSSaccess.get_file(metaindexaddress)
    #print(res.text)
    podindexlist=res.text.rsplit('\r\n')[:-1]
    print(podindexlist)
    #print(podindexlist)
    ans=dict()
    #begtime=time.time_ns()
    #print(n)
    for podindex in podindexlist:
        res=askindex(podindex, keyword, webid)
        #print(res)
        ans|=res
    
    #print(time.time_ns()-begtime)
    
    return ans

def searchapp(metaindexaddress,word,webid):
    #metaindexaddress='https://srv03918.soton.ac.uk:3000/ESPRESSO/Exp4dirsmetaindex.csv'
    #word='job'
    keyword='/'.join(word)
    #webid='mailto:sagent0@example.org'
    #webidfile= webid.translate(str.maketrans('', '', string.punctuation))+'.webid'
    #openfile='openaccess.webid'
    #res=CSSaccess.get_file(metaindexaddress)
    #metaindex=pandas.read_csv(metaindexaddress,header=None)
    #begtime=time.time_ns()
    #print (len(metaindex))
    #result=pandas.DataFrame(index=['File','Freq'])
    #for i in range(len(metaindex)):
    #    podindex=metaindex.iloc[i,0]
    #    podaddress=podindex[:-13]
    #    res=CSSaccess.get_file(podindex+wordfile)
    #    if res.ok:
    #        wordframe=pandas.read_csv(podindex+wordfile,header=None)
            #wordframe.columns = ['fword', 'Freq']
            #print(wordframe)
            #res=CSSaccess.get_file(podindex+openfile)
            #if res.ok:
            #    openframe=pandas.read_csv(podindex+openfile,header=None)
            #    openframe.columns=['fword','address']
    #        res=CSSaccess.get_file(podindex+webidfile)
    #        if res.ok:
    #            webidframe=pandas.read_csv(podindex+webidfile,header=None)
                #webidframe.columns=['fword','address']

            #openframe=pandas.read_csv(podindex+openfile,header=None)
            #both=pandas.concat([webidframe,openframe])
            #print(both)
    #        podres=pandas.concat([webidframe, wordframe], axis=0, join="inner")
    #        print(podres)
    #        result=pandas.concat([result,podres])
    #print(time.time_ns()-begtime)
    #print(result)        
    begtime=time.time_ns()
    ans=coffeefilterthreaded(metaindexaddress,keyword,webid)
    t=time.time_ns()-begtime
    
    
    for (key,value) in ans.items():
        print (key,value)
    print(len(ans.keys()),t,time.time_ns()-begtime)

metaindexaddress=argv[1]
word=argv[2]
webid=argv[3]

searchapp(metaindexaddress,word,webid)