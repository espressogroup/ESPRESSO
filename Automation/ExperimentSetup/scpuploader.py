import paramiko
from paramiko import SSHClient
from scp import SCPClient
from zipfile import ZipFile
import subprocess
import os

import logging
import paramiko
import getpass

class SSH:
    def __init__(self):
        pass

    def get_ssh_connection(self, ssh_machine, ssh_username, ssh_password):
        """Establishes a ssh connection to execute command.
        :param ssh_machine: IP of the machine to which SSH connection to be established.
        :param ssh_username: User Name of the machine to which SSH connection to be established..
        :param ssh_password: Password of the machine to which SSH connection to be established..
        returns connection Object
        """
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=ssh_machine, username=ssh_username, password=ssh_password, timeout=10)
        return client
      
    def run_sudo_command(self, ssh_username="root", ssh_password="abc123", ssh_machine="localhost", command="ls",
                         jobid="None"):
        """Executes a command over a established SSH connectio.
        :param ssh_machine: IP of the machine to which SSH connection to be established.
        :param ssh_username: User Name of the machine to which SSH connection to be established..
        :param ssh_password: Password of the machine to which SSH connection to be established..
        returns status of the command executed and Output of the command.
        """
        conn = self.get_ssh_connection(ssh_machine=ssh_machine, ssh_username=ssh_username, ssh_password=ssh_password)
        command = "sudo -S -p '' %s" % command
        logging.info("Job[%s]: Executing: %s" % (jobid, command))
        stdin, stdout, stderr = conn.exec_command(command=command)
        stdin.write(ssh_password + "\n")
        stdin.flush()
        stdoutput = [line for line in stdout]
        stderroutput = [line for line in stderr]
        for output in stdoutput:
            logging.info("Job[%s]: %s" % (jobid, output.strip()))
        # Check exit code.
        logging.debug("Job[%s]:stdout: %s" % (jobid, stdoutput))
        logging.debug("Job[%s]:stderror: %s" % (jobid, stderroutput))
        logging.info("Job[%s]:Command status: %s" % (jobid, stdout.channel.recv_exit_status()))
        if not stdout.channel.recv_exit_status():
            logging.info("Job[%s]: Command executed." % jobid)
            conn.close()
            if not stdoutput:
                stdoutput = True
            return True, stdoutput
        else:
            logging.error("Job[%s]: Command failed." % jobid)
            for output in stderroutput:
                logging.error("Job[%s]: %s" % (jobid, output))
            conn.close()
            return False, stderroutput


def getscp(server,user):
    client = SSHClient()
    #client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = server                    #hard-coded
    port = 22
    
    password = getpass.getpass()               #hard-coded
    username = user                #hard-coded
    ssh = SSHClient()
    client.load_system_host_keys()    
    client.connect(host, port=22, username=user, password=password)
    scp = SCPClient(client.get_transport())
    return scp



def scpfiles(filelist,remotesrv,remotetempdir,remotedir):
    ssh = SSHClient()
    ssh.load_system_host_keys()
    ssh.connect(remotesrv)
    with SCPClient(ssh.get_transport()) as scp:
        for f in filelist:
            filename=f.rsplit('/')[-1]
            scp.put(f, remotetempdir+'/'+filename) # Copy my_file.txt to the server

def scpfilessub(f,user,srv,remotedir):
    client = SSHClient()
    #client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = srv                    #hard-coded
    port = 22
    
    password = getpass.getpass()               #hard-coded
    username = user                #hard-coded
    ssh = SSHClient()
    client.load_system_host_keys()    
    client.connect(host, port=22, username=user, password=password)
    scp = SCPClient(client.get_transport())


    
    scp.put(f,remotedir, recursive=True)
    
            #stdin, stdout, stderr = client.exec_command('sudo mv '+tempadd+' '+permadd)
            #stdin.write(password + "\n")
            #stdin.flush()
            #print(stdin)
            #print(stdout)
            #print(stderr)

    scp.close()
    client.close()


def serverscpupload(scp,sourcedir,targetdir='/srv/espresso/'):
    for subdir in os.listdir(sourcedir):
        dpath=sourcedir+subdir

        if os.path.isdir(dpath):
            scp.put(dpath+'/',targetdir+subdir, recursive=True)

def zipdir(dirtozip,dirtostore, zipname):
    with ZipFile(dirtostore+zipname, 'w') as zip_object:
   # Traverse all files in directory
        for folder_name, sub_folders, file_names in os.walk(dirtozip):
            for filename in file_names:
         # Create filepath of files in directory
                
                file_path = os.path.join(folder_name, filename)
                #print(file_path)
         # Add files to zip file
                zip_object.write(file_path,file_path[len(dirtozip):])


# SCPCLient takes a paramiko transport as its only argument





#f='/Users/yurysavateev/testing/'
#srv='srv03812.soton.ac.uk'
#remotedir='/srv/espresso/storage/test/'

#remotedir='/home/ys1v22/test/'
#user='ys1v22'
#scp=getscp(srv,user)
#serverscpupload(scp,f,remotedir)
#scpfilessub(f,user,srv,remotedir)