import time, tqdm,os
from sys import argv
from collections import defaultdict

def loadkeywordfile(kfile):
    file1 = open(kfile, 'r')
    lines = file1.readlines()
    file1.close()
    print(lines[0])
    pairs=[(line.rsplit(',')[0],int(line.strip().rsplit(',')[1])) for line in lines]
    pairs.sort(key=lambda tup: tup[1])
    print(pairs[-1])
    shortpairs=[(a[0][:5],a[1]) for a in pairs]
    output = defaultdict(int)
    maxseen=0
    maxv=0
    for k, v in shortpairs:
        output[k] += v
        if output[k]>maxseen:
            maxseen=output[k]
            maxk=k
        if v>maxv:
            maxv=v
            
    maxcluster=[(a[0],a[1]) for a in pairs if a[0][:5]==maxk ]

    print(pairs[0],pairs[-1],len(pairs),len(output.keys()),maxv,maxk,maxseen,len(maxcluster))
    print(maxcluster)



if __name__=='__main__':
    loadkeywordfile(argv[1])