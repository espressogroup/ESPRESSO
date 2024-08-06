from Automation.ExperimentSetup import FileDistributor
import os
from math import floor
import paramiko
from paramiko import SSHClient
from scp import SCPClient




def zipdistribute(serverlistg,sourcedir,user,password,targetdir='/srv/espresso'):
    serverlist=[a.rsplit('/')[-2].rsplit(':')[0] for a in serverlistg]
    

    print(serverlist)
    i=0
    for server in serverlist:
        print('Uploading',server)
        client = SSHClient()
        #client.load_system_host_keys()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        host = server                    #hard-coded
        port = 22
    
                       #hard-coded
                        #hard-coded
        #ssh = SSHClient()
        client.load_system_host_keys()    
        client.connect(host, port=22, username=user, password=password)
        scp = SCPClient(client.get_transport())
        serword='S'+str(i)
        i=i+1
        sdir=sourcedir+serword+'/'
        print(sdir)
        filelist=next(os.walk(sdir))[2]
        for filename in filelist:
            print('sending',sdir+filename,'to',targetdir,'at',server)
            scp.put(sdir+filename,targetdir)
        client.close()
        scp.close()
