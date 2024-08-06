import flexexperiment
from rdflib import URIRef

serverlistglobal=['https://srv03812.soton.ac.uk:3000/',
                    'https://srv03813.soton.ac.uk:3000/',
                    'https://srv03814.soton.ac.uk:3000/',
                    'https://srv03815.soton.ac.uk:3000/',
                    'https://srv03816.soton.ac.uk:3000/',
                    'https://srv03911.soton.ac.uk:3000/',
                    'https://srv03912.soton.ac.uk:3000/',
                    'https://srv03913.soton.ac.uk:3000/',
                    'https://srv03914.soton.ac.uk:3000/',
                    'https://srv03915.soton.ac.uk:3000/',
                    'https://srv03916.soton.ac.uk:3000/',
                    'https://srv03917.soton.ac.uk:3000/',
                    'https://srv03918.soton.ac.uk:3000/',
                    'https://srv03919.soton.ac.uk:3000/',
                    'https://srv03920.soton.ac.uk:3000/',
                    'https://srv03921.soton.ac.uk:3000/',
                    'https://srv03922.soton.ac.uk:3000/',
                    'https://srv03923.soton.ac.uk:3000/',
                    'https://srv03924.soton.ac.uk:3000/',
                    'https://srv03925.soton.ac.uk:3000/',
                    'https://srv03926.soton.ac.uk:3000/',
                    'https://srv03927.soton.ac.uk:3000/',
                    'https://srv03928.soton.ac.uk:3000/',
                    'https://srv03929.soton.ac.uk:3000/',
                    'https://srv03930.soton.ac.uk:3000/',
                    'https://srv03931.soton.ac.uk:3000/',
                    'https://srv03932.soton.ac.uk:3000/',
                    'https://srv03933.soton.ac.uk:3000/',
                    'https://srv03934.soton.ac.uk:3000/',
                    'https://srv03935.soton.ac.uk:3000/',
                    'https://srv03936.soton.ac.uk:3000/',
                    'https://srv03937.soton.ac.uk:3000/',
                    'https://srv03938.soton.ac.uk:3000/',
                    'https://srv03939.soton.ac.uk:3000/',
                    'https://srv03940.soton.ac.uk:3000/',
                    'https://srv03941.soton.ac.uk:3000/',
                    'https://srv03942.soton.ac.uk:3000/',
                    'https://srv03943.soton.ac.uk:3000/',
                    'https://srv03944.soton.ac.uk:3000/',
                    'https://srv03945.soton.ac.uk:3000/',
                    'https://srv03946.soton.ac.uk:3000/',
                    'https://srv03947.soton.ac.uk:3000/',
                    'https://srv03948.soton.ac.uk:3000/',
                    'https://srv03949.soton.ac.uk:3000/',
                    'https://srv03950.soton.ac.uk:3000/',
                    'https://srv03951.soton.ac.uk:3000/',
                    'https://srv03952.soton.ac.uk:3000/',
                    'https://srv03953.soton.ac.uk:3000/',
                    'https://srv03954.soton.ac.uk:3000/',
                    'https://srv03955.soton.ac.uk:3000/'
                    ]
serverlist=serverlistglobal[14:15]
print(serverlist)
    #name of the ESPRESSO pod. ESPRESSO is default.
espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
podname='flexE23'
    #name for the metaindex file.
espressoindexfile=podname+'metaindex.csv'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
podemail='@example.org'
    #folder where the pod indices will go
podindexdir='espressoindex/'
    #same password for all the logins
password='12345'
    #local directory from where to take the files
sourcedir='/Users/yurysavateev/ESPRESSO/ESPRESSOExperiments/10000f5MB/'
    #total number of pods
numberofpods=200
    #total number of files
    #n
    #percs of sp.agents
percs=[100,50]
    #percent of openfiles
openperc=10
    #number of agents
numofwebids=50
    #on average how many webids can read a given file
mean=10
    #relative deviation of the previous, can be left 0
disp=0
    #how many files on average a webid can read
    #initializing the experiment
experiment=flexexperiment.ESPRESSOexperiment(espressopodname=espressopodname, espressoemail=espressoemail, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)
#experiment.loadserverlist(serverlist)
print('serverlist loaded',serverlist,experiment.serverlist)
#experiment.loaddir(sourcedir)
print('files loaded')
#experiment.logicaldist(numberofpods,0,0)
print('files distributed')
#experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
#experiment.imagineaclspecial(percs)
print('files acl imagined')
#experiment.saveexp(podname+'exp.ttl')
print('experiment saved')
experiment.loadexp(podname+'exp.ttl')
#experiment.ESPRESSOcreate()
print('ESPRESSO checked')
#experiment.podcreate()
print('Pods created')
experiment.upload()
print('Pods populated')
experiment.aclindexwebidnewthreaded()
print('pods indexed')
experiment.aclmetaindex()
print('metaindices created')
experiment.indexpub()
print('indices opened')
experiment.metaindexpub()
print('metaindices opened')
experiment.indexfixerwebidnew()
print('indices checked')