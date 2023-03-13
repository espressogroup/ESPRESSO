def main3():
    namespace="http://example.org/SOLID/"
    #targetdir ='/Users/yurysavateev/Python/dir/server0/server0pod0'
    reprformat='json-ld'
    podname=''
    #podname='public'
    IDP='localhost:3000'
    #IDP='https://solidcommunity.net/'
    POD_ENDPOINT = 'localhost:3000/test1'
    #POD_ENDPOINT = 'https://rezamoosa.solidcommunity.net/'
    sourcedir = '../Datasets/babydir'
    
    
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'
    
    
    
    if len(podname)==0:
        pod=POD_ENDPOINT
    else:
        pod=POD_ENDPOINT+podname+'/'

    #rdfindex.indexer(sourcedir,podname,pod,namespace)
    distributor.postdir(sourcedir,pod,IDP,USERNAME,PASSWORD)

    
        

    

main3()
