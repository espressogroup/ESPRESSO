import paramiko
import csv
import os

# SSH configuration
hostname = "srv04031.soton.ac.uk"
username = "mrmm1f23@soton.ac.uk"
password = "01121809885_Soton"
root_directory = "/srv/ESPRESSO_HOliver_fork/Ragab/Automation/lucenetestsink__/"
output_csv = "webid_server_mapping.csv"
unique_servers_csv = "unique_servers.csv"
# Establish SSH connection
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, username=username, password=password)
# Function to execute remote commands
def execute_command(command):
    stdin, stdout, stderr = ssh.exec_command(command)
    return stdout.read().decode().splitlines()

# List to hold extracted data and unique servers
data = []
unique_servers = set()

# Get directories under the root directory
directories = execute_command(f"ls -d {root_directory}*/")

for dir_path in directories:
    dir_name = os.path.basename(dir_path.strip('/'))
    server_level_path = os.path.join(dir_path, "server-level")

    # Check if "server-level" directory exists
    if execute_command(f"[ -d {server_level_path} ] && echo exists || echo not_exists")[0] == "exists":
        server_dirs = execute_command(f"ls {server_level_path}")

        for server_dir in server_dirs:
            server_id = server_dir.split('.')[0]  # Extract the simplified server ID (e.g., "srv03812")
            full_url = f"https://{server_id}.soton.ac.uk:3000"
            data.append([dir_name, server_id, full_url])
            unique_servers.add((server_id, full_url))

# Close SSH connection
ssh.close()

# Write the data to the main CSV file
with open(output_csv, mode='w', newline='') as csv_file:
    csv_writer = csv.writer(csv_file)
    # Write rows without headers
    csv_writer.writerows(data)

# Write the unique servers to another CSV file
with open(unique_servers_csv, mode='w', newline='') as csv_file:
    csv_writer = csv.writer(csv_file)
    # Write rows without headers
    csv_writer.writerows(unique_servers)

# Write grouped CSV files by server ID
for server_id, full_url in unique_servers:
    grouped_csv = f"grouped_{server_id}.csv"
    with open(grouped_csv, mode='w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        # Write rows filtered by server ID without headers
        csv_writer.writerows([row for row in data if row[1] == server_id])

print(f"CSV files created: '{output_csv}', '{unique_servers_csv}', and grouped files for each server ID.")
