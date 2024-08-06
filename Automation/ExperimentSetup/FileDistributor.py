import os, math, random, shutil, numpy

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

def distributenum(n,places,zipf):
    #a=1
    total=0
    if zipf==0:
        numbers=[math.floor(n/places)]*places
    else:
        for i in range(places):
            total +=1/((i+1)*zipf)
            #a/=((i+1)*zipf)
        print (total)
        numbers=[]
        for i in range(places):
            numbers.append(math.floor(n/(total*(i+1)*zipf)))
    print(sum(numbers))
    for i in range(n-sum(numbers)):
        j=math.floor(random.random()*places)
        numbers[j]=numbers[j]+1
    return (numbers)
    

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

def normaldistribute(files,places,disp):
    if disp==0:
        numbers=[math.floor(len(files)/places)]*places
    else:
        loc=float(len(files))/places
        scale=loc*disp
        ran=numpy.random.normal(loc,scale,places)
        total=0
        for i in range(places):
            if ran[i]<0:
                ran[i]=1
            total += ran[i]
            #a/=((i+1)*zipf)
        print (total)
        numbers=[]
        for i in range(places):
            numbers.append(math.floor(ran[i]*len(files)/total))
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
    

def paretopluck(files,places,alpha):
    res=[]
    for i in range(places):
        i=math.floor(random.paretovariate(alpha))
        if i>len(files):
            i=len(files)
        res.append(random.sample(files, i))
    return(res)