import filesorter, dpop_utils, CSSaccess, brewmaster, scpuploader,zipdistribute
import os,csv,re, random, shutil, requests, json, base64, urllib.parse, cleantext
from rdflib import URIRef, BNode, Literal, Graph, Namespace
from math import floor
import threading
import time, tqdm, getpass
import concurrent.futures
import paramiko
from paramiko import SSHClient
from scp import SCPClient
from zipfile import ZipFile
from sys import argv

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

def experimenttrimmer(podname,newmetaindexname,firstserver,lastserver,trimto,espressopodname='ESPRESSO/',espressoemail='espresso@example.com',password='12345'):
    serverlist=serverlistglobal[firstserver:lastserver+1]
    #serverlist=["https://srv04031.soton.ac.uk:3000/"]
    for IDP in serverlist:
        metaindexaddress=IDP+espressopodname+podname+'metaindex.csv'
        print(metaindexaddress)
        res=CSSaccess.get_file(metaindexaddress)
        print(res.text)
        podindexlist=res.text.rsplit('\r\n')[:-1]
        samplemeta=random.sample(podindexlist, trimto)
        metaindexdata='\r\n'.join(samplemeta)+'\r\n'
        print(metaindexdata)
        #for indexaddress in samplemeta:
        #        addstring=indexaddress+'\r\n'
        #        metaindexdata+=addstring    
                
        CSSAe=CSSaccess.CSSaccess(IDP, espressoemail, password)
        a=CSSAe.create_authstring()
        t=CSSAe.create_authtoken()
        #print(t)
        targeturl=IDP+espressopodname+newmetaindexname
        print(metaindexaddress)

        print(targeturl)
        print(CSSAe.put_url(targeturl, metaindexdata, 'text/csv'))
        CSSAe.makeurlaccessible(targeturl,newmetaindexname)
        print(res)

podname=argv[1]
newmetaindexname=argv[2]
firstserver=int(argv[3])
lastserver=int(argv[4])
trimto=int(argv[5])
experimenttrimmer(podname,newmetaindexname,firstserver,lastserver,trimto)