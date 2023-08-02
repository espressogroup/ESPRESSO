import filesorter, distributor, dpop_utils, CSSaccess, brewmaster, rdfindex
import os,sys,csv,re, math, random, shutil, requests, json, base64, urllib.parse, cleantext
from rdflib import URIRef, BNode, Literal, Graph, Namespace
import threading
import time
import concurrent.futures

IDP="https://srv03911.soton.ac.uk:3000/"
podaddress="https://srv03911.soton.ac.uk:3000/ragab1pod1/"
podname="ragab1pod1"
USERNAME="ragab1pod1@example.org"
PASSWORD="12345"
CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
CSSA.create_authstring()
CSSA.create_authtoken()

d=brewmaster.aclcrawlwebid(podaddress, CSSA)

print(d)



# indexaddress=str(self.image.value(pnode,self.namespace.IndexAddress))
# index=brewmaster.aclindextupleswebidnew(d)
# executor.submit(brewmaster.uploadaclindex, index, indexaddress, CSSA)





# def aclcrawlwebidnew(address,podaddress, CSSa):
#     filetuples= []
#     data = CSSa.get_file(address)
#     #print(data)
#     g=Graph().parse(data=data,publicID=address)
#     #q1='''
#     #prefix ldp: <http://www.w3.org/ns/ldp#>
    
#     #SELECT ?s ?p ?o WHERE{
#     #   ?s ?p ?o .
#     #}
#     #'''
#     #for r in g.query(q1):
#     #    print(r)
#     q='''
#     prefix ldp: <http://www.w3.org/ns/ldp#>
    
#     SELECT ?f WHERE{
#         ?a ldp:contains ?f.
#     }
#     '''
#     for r in g.query(q):
#         #print(r["f"])
#         f=str(r["f"])
#         if f[-1]=='/':
#             d=aclcrawlwebidnew(f,podaddress,CSSa)
#             filetuples=filetuples+d
#         elif ('.' in f.rsplit('/')[-1]) and (not f.endswith('ttl')) and (not f.endswith('.ndx')) and (not f.endswith('.file')) and (not f.endswith('.sum')) and (not f.endswith('.webid')):
#             text=CSSa.get_file(f)
#             webidlist=getwebidlistlist(f,CSSa)
#             ftrunc=f[len(podaddress):]
#             filetuples.append((ftrunc,text,webidlist))
#         else:
#             pass

#     return filetuples


# espressopodname = 'ESPRESSO'
# espressoemail = 'espresso@example.com'

# podname = 'ragab1pod'
# espressoindexfile = podname + 'metaindex.csv'
# podemail = '@example.org'



# aclcrawlwebidnew("https://srv03911.soton.ac.uk:3000/ragab1pod0/espressoindex/",)