import os
import paramiko

def write_acl_file_on_server(ssh_client, root_directory):
    # Define the content for the .acl file
    acl_content = """@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix c: <profile/card#>.

<#owner> a acl:Authorization;
acl:agent c:me;
acl:mode acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>.

<#public> a acl:Authorization;
acl:mode  acl:Control, acl:Read, acl:Write;
acl:accessTo <./>;
acl:default <./>;
acl:agentClass foaf:Agent.
"""

    # Find all subdirectories starting with "vldb_pod*" in the root directory
    stdin, stdout, stderr = ssh_client.exec_command(f"ls {root_directory}")
    subdirs = stdout.read().decode().splitlines()

    for subdir in subdirs:
        if subdir.startswith("vldb_pod"):
            espressoindex_path = os.path.join(root_directory, subdir, "espressoindex")
            stdin, stdout, stderr = ssh_client.exec_command(f"[ -d {espressoindex_path} ] && echo exists || echo missing")
            if stdout.read().decode().strip() == "missing":
                print(f"espressoindex directory does not exist in {subdir}")
                continue

            # Path to the .acl file
            acl_file_path = os.path.join(espressoindex_path, ".acl")

            # Check if the .acl file already exists
            stdin, stdout, stderr = ssh_client.exec_command(f"[ -f {acl_file_path} ] && echo exists || echo missing")
            if stdout.read().decode().strip() == "exists":
                print(f".acl file already exists in {espressoindex_path}")
            else:
                # Write the .acl file
                try:
                    acl_file_command = f"echo \"{acl_content}\" > {acl_file_path}"
                    ssh_client.exec_command(acl_file_command)
                    print(f".acl file created in {espressoindex_path}")
                except Exception as e:
                    print(f"Failed to create .acl file in {espressoindex_path}: {e}")

def process_servers(servers, username, private_key_path, root_directory):
    # Create SSH client
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    for server in servers:
        print(f"Processing server: {server}")
        try:
            ssh_client.connect(hostname=server, username=username, key_filename=private_key_path)
            write_acl_file_on_server(ssh_client, root_directory)
        except Exception as e:
            print(f"Failed to process server {server}: {e}")
        finally:
            ssh_client.close()

# List of servers to process
servers = ["srv03952.soton.ac.uk"]
username = "01121809885_Soton"  # Replace with your SSH username
root_directory = "/srv/espresso/storage/"

# Call the function
process_servers(servers, username, root_directory)
