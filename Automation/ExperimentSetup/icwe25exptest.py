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



#
def deployexperiment(experiment):  
    experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    #experiment.inserttriples()
    #print('Triples inserted')
    experiment.aclmetaindex()
    print('metaindices created')
    experiment.indexpub()
    print('indices opened')
    experiment.metaindexpub()
    print('metaindices opened')

def uploadexperiment(experiment):
    experiment.uploadfiles()
    print('Pods populated')
    experiment.uploadacls()
    print('Acls populated')
    

def indexexperiment(experiment):
    #experiment.uploadfiles()
    #print('Pods populated')
    #experiment.uploadacls()
    #print('Acls populated')
    #experiment.aclindexwebidnewthreaded()
    #print('pods indexed')
    experiment.indexfixerwebidnew()
    print('indices checked')

def zip(experiment,zipdir,SSHuser,SSHPassword):
    
    #experiment.storelocalfileszip(zipdir)
    #experiment.storelocalindexzipdirs(zipdir)
    experiment.distributezips(zipdir,SSHuser,SSHPassword)


def createexperiment(podname):
    serverlist=serverlistglobal[12:13]
    
    sourcedir='/Users/yurysavateev/ESPRESSO/ESPRESSOExperiments/50000f5MB/'

    
    #name of the ESPRESSO pod. ESPRESSO is default.
    espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
    espressoemail='espresso@example.com'
    #email to register the pod. the emails will be podname0@example.org, podname1@example.org, etc.
    podemail='@example.org'
    #folder where the pod indices will go
    podindexdir='espressoindex/'
    #same password for all the logins
    password='12345'
    #percs of sp.agents
    percs=[100,50,25,10]
    #percent of openfiles
    openperc=10
    #number of agents
    numofwebids=50
    #on average how many webids can read a given file
    mean=5
    #relative deviation of the previous, can be left 0
    disp=0

    experiment=flexexperiment.ESPRESSOexperiment(espressopodname=espressopodname, espressoemail=espressoemail, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)

    experiment.loadserverlist(serverlist)
    
    print('serverlist loaded')
    
    #experiment.loaddir(sourcedir1,'FHIR','text/turtle')
    experiment.loaddirtopool(sourcedir)
    print('files loaded')
    experiment.createlogicalpods(50,0)
    experiment.logicaldistfilestopodsfrompool(50000,0,'text/plain',filelabel='file',podlabel='pod',subdir='file',predicatetopod='',replacebool=False)
    

    print('files distributed')
#experiment.imagineaclnormal(openperc,numofwebids,mean,disp)
    experiment.imagineaclnormal(10,numofwebids,mean, disp)
    experiment.imagineaclspecial(percs)
    print('files acl imagined')
    experiment.saveexp(podname+'exp.ttl')

    print('experiment saved')

podname='icwe25exp'
zipdir='/Users/yurysavateev/ESPRESSO/'+podname+'/'
#createexperiment(podname)
experiment=flexexperiment.loadexp(podname+'exp.ttl')
print('Experiment loaded')
#deployexperiment(experiment)
#uploadexperiment(experiment)
#indexexperiment(experiment)
zip(experiment,zipdir,'ys1v22','40hfap90k0023')