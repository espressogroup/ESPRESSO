#from solid.solid_api import SolidAPI
#from solid_client_credentials import SolidClientCredentialsAuth, DpopTokenProvider
import dpop_utils
import requests
import os, json
import CSSaccess
import tqdm

#from solid.auth import Auth

def putdirCSS (directory,pod,IDP,USERNAME,PASSWORD,indexfile=''):
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    #a=CSSA.create_authstring()
    #t=CSSA.create_authtoken()
    CSSA.new_session()

    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f) and filename[0]!='.' and filename != indexfile:
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            file.close()
            file_url=pod+filename
            print('putting '+filename+' to the pod '+ pod)
            print(CSSA.put_file(pod, filename, filetext, 'text/plain'))
            #api.put_file(file_url, filetext, 'text/markdown')
    indexpath=os.path.join(directory, indexfile)
    if os.path.isfile(indexpath):
        CSSA.put_file(pod, indexfile, filetext, 'text/turtle')
    return pod
    
def putlistCSS (filelist,pod,IDP,USERNAME,PASSWORD):
    CSSA=CSSaccess.CSSaccess(IDP, USERNAME, PASSWORD)
    a=CSSA.create_authstring()
    t=CSSA.create_authtoken()
    #CSSA.new_session()

    for f in filelist:
        # checking if it is a file
        filename=f.rsplit('/')[-1]
        if os.path.isfile(f):
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            file.close()
            file_url=pod+filename
            print('putting '+filename+' to the pod '+ pod)
            r=CSSA.put_file(pod, filename, filetext, 'text/plain')
            filename=CSSA.idp+pod+'/'+filename
            #print(CSSA.get_file(filename))
            #api.put_file(file_url, filetext, 'text/markdown')
    

def postdirtopod (directory,pod,api):
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        # checking if it is a file
        if os.path.isfile(f) and filename[0]!='.':
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            #.decode('utf-8')
            #x.encode('ascii', 'ignore').decode()
            file.close()
            file_url=pod+filename
            print('putting '+filename+' to the pod '+ pod)
            api.put_file(file_url, filetext, 'text/markdown')
    return pod

def uploadllistwithbar (filetuplelist,podaddress,CSSA):
    pbar=tqdm.tqdm(len(filetuplelist),desc=podaddress)
    for f,targetUrl,filetype in filetuplelist:
            file = open(f, "rb")
            filetext=file.read().decode('latin1')
            file.close()
            res=CSSA.put_url(targetUrl, filetext, filetype)
            if not res.ok:
                print(res)
                continue
            pbar.update(1)
    pbar.close()

def uploadllistaclwithbar (filetuplelist,podaddress,CSSA):
    pbar=tqdm.tqdm(len(filetuplelist),desc=podaddress)
    for fileaddress,openfile,webidlist in filetuplelist:
        if openfile:
            CSSA.makefileaccessible(podname,filename)
        else:
            res=CSSA.adddefaultacl(targetUrl)            
        CSSA.addreadrights(targetUrl,webidlist)
        pbar.update(1)
    pbar.close()