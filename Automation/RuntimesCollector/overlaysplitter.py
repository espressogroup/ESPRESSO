import csv
import os
import paramiko
from collections import defaultdict

# Function to split CSV into server-specific files
def split_csv_by_server(input_file):
    server_data = defaultdict(list)

    with open(input_file, 'r') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            if len(row) < 3:
                continue
            server = row[1]
            zip_file_name = os.path.basename(row[2])
            row[2] = f"/srv/espresso/storage/ESPRESSO/metaindex/{zip_file_name}"
            server_data[server].append(row)

    return server_data


def split_csv_by_servers_2(input_file_path, output_folder_path):
    server_data = defaultdict(list)
    # Create the output folder if it does not exist
    if not os.path.exists(output_folder_path):
        os.makedirs(output_folder_path)

    # Use defaultdict to store the rows based on server names
    server_dict = defaultdict(list)

    # Read the CSV file
    with open(input_file_path, mode='r', newline='') as file:
        reader = csv.reader(file)
        for row in reader:
            server_name = row[0]  # First column is the server name
            server_dict[server_name].append(row)

    # # Write each server's data to a separate CSV file
    # for server, rows in server_dict.items():
    #     output_file_path = os.path.join(output_folder_path, f"{server}.csv")
    #
    #     with open(output_file_path, mode='w', newline='') as file:
    #         writer = csv.writer(file)
    #         writer.writerows(rows)

    # print(f"Files have been split and saved in {output_folder_path}")
    return server_dict

# Function to write server-specific CSV files
def write_server_csv_files(server_data, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    file_paths = {}
    for server, rows in server_data.items():
        file_path = os.path.join(output_dir, f"{server}.csv")
        with open(file_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerows(rows)
        file_paths[server] = file_path

    return file_paths

# Function to copy files to servers via SSH
# def copy_to_servers(file_paths):
#     for server, file_path in file_paths.items():
#         destination_path = f"/home/mrmm1f23/LTOVERLAYLUCENE.csv"
#         remote_host = f"{server}.soton.ac.uk"
#
#         # Establish SSH connection
#         ssh = paramiko.SSHClient()
#         ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#
#         try:
#             ssh.connect(remote_host, username='mrmm1f23@soton.ac.uk', password='01121809885_Soton')
#             sftp = ssh.open_sftp()
#
#             # Copy file to remote server
#             sftp.put(file_path, destination_path)
#             print(f"Copied {file_path} to {remote_host}:{destination_path}")
#
#             sftp.close()
#         except Exception as e:
#             print(f"Failed to copy to {remote_host}: {e}")
#         finally:
#             ssh.close()

# Main workflow

def copy_to_servers(file_paths):
    for server, file_path in file_paths.items():
        destination_path = f"/home/mrmm1f23/LTOVERLAYLUCENE.csv"
        config_file_source = "./splitted_overlay/gaiandb_config.properties"
        config_file_destination = f"/home/mrmm1f23/gaiandb_config.properties"
        # servers_file_source = "./splitted_overlay/LTOVERLAYSERVERS.csv"
        # servers_file_destination = f"/home/mrmm1f23/LTOVERLAYSERVERS.csv"

        remote_host = f"{server}.soton.ac.uk"

        # Establish SSH connection
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            ssh.connect(remote_host, username="mrmm1f23@soton.ac.uk", password='01121809885_Soton')  # Use normal user

            # Use SFTP to copy file to remote server
            sftp = ssh.open_sftp()
            sftp.put(file_path, destination_path)
            sftp.put(config_file_source, config_file_destination)
            # sftp.put(servers_file_source, servers_file_destination)

            print(f"Copied {file_path} to {remote_host}:{destination_path}")
            print(f"Copied {config_file_source} to {remote_host}:{config_file_destination}")
            # print(f"Copied {servers_file_source} to {remote_host}:{servers_file_destination}")

            sftp.close()
        except Exception as e:
            print(f"Failed to copy to {remote_host}: {e}")
        finally:
            ssh.close()


def copy_to_servers_2(file_paths):
    for server, file_path in file_paths.items():
        destination_path = f"/home/mrmm1f23/LTOVERLAYSERVERS.csv"
        remote_host = f"{server}.soton.ac.uk"

        # Establish SSH connection
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            ssh.connect(remote_host, username="mrmm1f23@soton.ac.uk", password='01121809885_Soton')  # Use normal user

            # Use SFTP to copy file to remote server
            sftp = ssh.open_sftp()
            sftp.put(file_path, destination_path)


            print(f"Copied {file_path} to {remote_host}:{destination_path}")

            sftp.close()
        except Exception as e:
            print(f"Failed to copy to {remote_host}: {e}")
        finally:
            ssh.close()




def main():
    input_file = "/Users/ragab/EspressoProjRagabTests/GaianDB_Keyword_Search_SourceCode/installConfig/csvtestfiles/LTOVERLAYLUCENE.csv"
    output_dir = "./splitted_overlay"

    # Step 1: Split the CSV by server
    server_data = split_csv_by_server(input_file)

    input_file_2 = "/Users/ragab/EspressoProjRagabTests/GaianDB_Keyword_Search_SourceCode/installConfig/csvtestfiles/LTOVERLAYSERVERS.csv"
    output_dir_2 = "./splitted_overlay2"

    # Step 1: Split the CSV by server
    server_data_2 = split_csv_by_servers_2(input_file_2,output_dir_2)

    # print(server_data_2)


    # Step 2: Write server-specific CSV files
    file_paths = write_server_csv_files(server_data, output_dir)
    file_paths_2 = write_server_csv_files(server_data_2, output_dir_2)



    # Step 3: Copy files to corresponding servers
    copy_to_servers(file_paths)
    copy_to_servers_2(file_paths_2)

if __name__ == "__main__":
    main()
