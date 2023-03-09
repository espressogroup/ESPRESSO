import os, math, random

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

