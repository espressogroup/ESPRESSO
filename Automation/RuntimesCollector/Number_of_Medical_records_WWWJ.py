import paramiko
import re


def ssh_command(ssh_host, ssh_port, ssh_user, ssh_password, command):
    try:
        # Create an SSH client instance
        client = paramiko.SSHClient()

        # Automatically add host keys from the system host keys
        client.load_system_host_keys()

        # Add host key automatically if missing (make sure the server's host key is in known_hosts)
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        # Connect to the SSH server
        client.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_password)

        # Execute the command
        stdin, stdout, stderr = client.exec_command(command)
        output = stdout.read().decode('utf-8')

        # Close the connection
        client.close()

        return output
    except Exception as e:
        print(f"Connection failed: {e}")
        return None


# Define the SSH credentials and the command to execute
ssh_host = 'srv03812.soton.ac.uk'
ssh_port = 22  # Default SSH port is 22
ssh_user = 'mrmm1f23'
ssh_password = '01121809885_Soton'

# Command to count files, adjust the find command as per your requirements
# command = "find /srv/espresso/storage/ -type d -name 'wwwj0partgoodpod1000' -exec find {} -type f -name 'hist*.txt' \; | wc -l"
# command = "for dir in $(ls -d /srv/espresso/storage/wwwj0partgoodpod*); do ls $dir/hist*.txt; done | wc -l"

# command = """
# for dir in /srv/espresso/storage/wwwj0partgoodpod*/; do
#     echo -n "$dir: "
#     ls $dir/hist*.txt 2>/dev/null | wc -l
# done
# """

command = """
for dir in /srv/espresso/storage/wwwj0partgoodpod*/; do 
    count=$(ls $dir/hist*.txt 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "$dir: $count"
    fi
done | sort -t: -k2 -nr | head -n 10
"""


# Execute the command on the remote machine
file_count = ssh_command(ssh_host, ssh_port, ssh_user, ssh_password, command)

if file_count:
    print(f"Number of files found: {file_count}")
else:
    print("Failed to execute the command or no files found.")
