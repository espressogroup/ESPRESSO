import paramiko
import sys


def execute_command_on_server(host, user, password, command):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=host, username=user, password=password)

        stdin, stdout, stderr = client.exec_command(command)
        exit_status = stdout.channel.recv_exit_status()  # Blocking call

        if exit_status == 0:
            # print(f"Command executed successfully on {host}")
            # Searching for the "Active:" line in the output
            for line in stdout:
                if "Active:" in line:
                    print(line.strip())
                    break
        else:
            print(f"Error in command execution on {host}: {stderr.read().decode()}")

        client.close()
    except Exception as e:
        print(f"Failed to execute command on {host}: {e}")


def main(server_file, user, password, action):
    command = f"systemctl {action} solid"
    try:
        with open(server_file, 'r') as file:
            for line in file:
                host = line.strip()
                if host:
                    print(f"Processing {host}...")
                    execute_command_on_server(host, user, password, command)
    except Exception as e:
        print(f"Error reading file: {e}")


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python script.py <server_file.txt> <username> <password> <action>")
        sys.exit(1)

    server_file = sys.argv[1]
    user = sys.argv[2]
    password = sys.argv[3]
    action = sys.argv[4]
    main(server_file, user, password, action)
