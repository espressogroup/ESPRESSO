import rdfindex
import os, re, math, random, shutil

def main():
    #datasource = '/Users/yurysavateev/iweb data'
    namespace="http://example.org/SOLID/"
    #targetdir ='/Users/yurysavateev/Python/dir/server0/server0pod0'
    reprformat='turtle'
    podname=''
    #podname='public'
    IDP='localhost:3000'
    #IDP='https://solidcommunity.net/'
    POD_ENDPOINT = 'localhost:3000/test1'
    #POD_ENDPOINT = 'https://rezamoosa.solidcommunity.net/'
    sourcedir = '../Datasets/babydir'

    if len(podname)==0:
        pod=POD_ENDPOINT
    else:
        pod=POD_ENDPOINT+podname+'/'

    rdfindex.indexer(sourcedir,podname,pod,namespace,reprformat)

main()
