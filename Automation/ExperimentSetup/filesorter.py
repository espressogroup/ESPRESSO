import os, math, random, shutil

def distribute(files,places,zipf):
    #a=1
    total=0
    if zipf==0:
        numbers=[math.floor(len(files)/places)]*places
    else:
        for i in range(places):
            total +=1/((i+1)*zipf)
            #a/=((i+1)*zipf)
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

def powerdistribute(files,places,p):
    #a=1
    total=0
    if p==0:
        numbers=[math.floor(len(files)/places)]*places
    else:
        for i in range(places):
            total +=1/((i+1)**p)
            #a/=((i+1)*zipf)
        print (total)
        numbers=[]
        for i in range(places):
            numbers.append(math.floor(len(files)/(total*((i+1)**p))))
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

def sort_local (datasource,targetdir, numberofservers, serverzipf,numberofpods,podzipf):
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
    podlist=distribute(filelist,numberofpods,podzipf)
    random.shuffle(podlist)
    final=distribute(podlist,numberofservers,serverzipf)
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
        print("end server")



class sortimage:
    def __init__(self):
        self.filelist = []
        self.preview = dict()
        self.podlist= dict()

    def __repr__(self):
        return str(self.preview)

    def loaddir(self,datasource):
        for filename in os.listdir(datasource):
            f = os.path.join(datasource, filename)
            # checking if it is a file
            if os.path.isfile(f):
                self.filelist.append(f)

    def loadpodlist(self,newpodlist):
        d=self.podlist
        for p in newpodlist:
            s=p.rsplit('/', 1)[0]
            listofpodsonthisserver = d[s] if s in d else []
            listofpodsonthisserver.append(p)
            d[s] = listofpodsonthisserver
        self.podlist=d

    def clearpodlist(self):
        self.podlist=dict()

    def sort(self,n,numberofservers, numberofpods, serverzipf=1, podzipf=1):
        k=min(n,len(self.filelist))
        files=self.filelist[:k]
        random.shuffle(files)
        podlist=distribute(files,numberofpods,podzipf)
        random.shuffle(podlist)
        final=distribute(podlist,numberofservers,serverzipf)
        d=dict()
        servers=list(self.podlist.keys())[:numberofservers]
        for s in range(numberofservers):
            k=len(final[s])
            pods=self.podlist[servers[s]][:k]
            serverdict=dict()
            for p in range(k):
                serverdict[pods[p]]=final[s][p]
            d[servers[s]]=serverdict

        self.preview=d
        

        

 