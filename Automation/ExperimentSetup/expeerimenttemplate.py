import flexexperiment
from rdflib import URIRef




#
def deployexperiment(experiment):  
    experiment.ESPRESSOcreate()
    print('ESPRESSO checked')
    experiment.podcreate()
    print('Pods created')
    experiment.inserttriples()
    print('Triples inserted')
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
    
    experiment.aclindexwebidnewthreaded()
    print('pods indexed')
    experiment.indexfixerwebidnew()
    print('indices checked')

#Serverlists
serverlist1=[]
serverlist2=[]
#source directories for data
sourcedir1=''
sourcedir2=''
sourcedir3=''

    #name of the ESPRESSO pod. ESPRESSO is default.
espressopodname='ESPRESSO'
    #email to register the ESPRESSO pod. espresso@example.com is default.
espressoemail='espresso@example.com'
    #name for the pods in the experiment the pods will be called podname0, podmane1, etc.
    #podname
    
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
mean=10
    #relative deviation of the previous, can be left 0
disp=0
    #how many files on average a webid can read
    #initializing the experiment

def createexperiment(podname):
    #Initializing the experiment
    experiment=flexexperiment.ESPRESSOexperiment(espressopodname=espressopodname, espressoemail=espressoemail, podname=podname,podemail=podemail, podindexdir=podindexdir, password=password)

    #Server list loading
    experiment.loadserverlist(serverlist1,'Serverlabel1')
    experiment.loadserverlist(serverlist2,'Serverlabel2')
    print('serverlist loaded')

    #Creating connected pod pairs if needed
    experiment.createlogicalpairedpods(numberofpods=10,serverdisp=0,serverlabel1='server1',serverlabel2='server2',podlabel1='pod1',podlabel2='pod2',conpred=URIRef('http://espresso.org/haspersonalWebID'))

    #loading files into the file pool
    experiment.loaddirtopool(sourcedir1,'Filelabel1')
    experiment.loaddirtopool(sourcedir2,'Filelabel2')
    #distributing the files from the file pools into the pods
    experiment.logicaldistfilestopodsfrompool(numberoffiles=100,filedisp=0,filetype=0,filelabel='Filelabel1',podlabel='pod1',subdir='file',predicatetopod=URIRef('http://example.org/SOLIDindex/HasFile'),replacebool=False)
    experiment.logicaldistfilestopodsfrompool(numberoffiles=100,filedisp=0,filetype=0,filelabel='Filelabel2',podlabel='pod2',subdir='file',predicatetopod=URIRef('http://example.org/SOLIDindex/HasFile'),replacebool=False)
    #distributing the file bundles if needed
    experiment.distributebundles(numberofbundles=10,bundlesource=sourcedir3,filetype='text/turtle',filelabel='Filelabel3',subdir='file',podlabel='pod',predicatetopod=URIRef('http://example.org/SOLIDindex/HasFile'),hashliststring='')
    print('files loaded')
    #acl creation
    experiment.imagineaclnormal(openperc=100,numofwebids=20,mean=10, disp=0,filelabel='Filelabel1')
    experiment.imagineaclnormal(openperc=50,numofwebids=20,mean=10, disp=0,filelabel='Filelabel2')
    experiment.imagineaclnormal(openperc=10,numofwebids=20,mean=10, disp=0,filelabel='Filelabel3')
    experiment.imagineaclspecial(percs,'Filelabel1')
    experiment.imagineaclspecial(percs,'Filelabel2')
    experiment.imagineaclspecial(percs,'Filelabel3')
    print('files acl imagined')
    experiment.saveexp(podname+'exp.ttl')

    print('experiment saved')
    return experiment

#Pod name template and experiment name
podname='ardfhealth'

#name for the metaindex file.
espressoindexfile=podname+'metaindex.csv'

#creating the logical view and saving it
experiment=createexperiment(podname)

#Loading the experiment
experiment=flexexperiment.loadexp(podname+'exp.ttl')
print('Experiment loaded')
#Creating the experiment infrastructure - pods, metaindices, triples
deployexperiment(experiment)
#Uploading of the files and corresponding acls
uploadexperiment(experiment)
#Indexing of the experiment
indexexperiment(experiment)