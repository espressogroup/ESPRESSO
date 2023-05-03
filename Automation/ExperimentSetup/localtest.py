import filesorter, distributor, CSSaccess
#import rdfindex
import os, re, math, random, shutil

def main3():
    namespace="http://example.org/SOLID/"
    #targetdir ='/Users/yurysavateev/Python/dir/server0/server0pod0'
    reprformat='json-ld'
    podname=''
    #podname='public'
    IDP='http://localhost:3000'
    #IDP='https://solidcommunity.net/'
    POD_ENDPOINT = 'http://localhost:3000/test1'
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

def main4():
    USERNAME = 'ys1v22@soton.ac.uk'
    PASSWORD = '12345'

    # The server that provides your account (where you login)
   # issuer_url = 'http://srv03813.soton.ac.uk:3000/'
    IDP = 'http://srv03814.soton.ac.uk:3000/'
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    print(a)
    t=CSSA.create_authtoken()
    print(t)
    print(CSSA.put_file('test', 'file3.txt', 'abcde', 'text/plain'))
    print(CSSA.get_file(IDP+'test/file3.txt'))    
        

    

main4()
