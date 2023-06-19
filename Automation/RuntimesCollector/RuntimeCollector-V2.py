import csv
import paramiko
import os
import time


# Experiments (Multi-Servers)
servers = ['srv03768.soton.ac.uk',
           'srv03812.soton.ac.uk',
           # 'srv03813.soton.ac.uk',
           'srv03814.soton.ac.uk',
           'srv03815.soton.ac.uk',
           'srv03816.soton.ac.uk'
           ]

# SSH connection parameters
username = 'mrmm1f23@soton.ac.uk'
password = '01121809885_Soton'

script_directory = '/usr/local/Reza-WorkSpace/BuildGaian/GaianDB_BuildMaven_Keyword_20230611/'
log_directory = '/usr/local/Reza-WorkSpace/BuildGaian/GaianDB_BuildMaven_Keyword_20230611/csvtestfiles/'

# keywords = ['disease', 'corona','hemoproteins']
keywords = ['disease']

num_runs = 1
csv_file = 'runtimes.csv'

# Retry parameters
max_retries = 3
retry_delay = 5  # seconds

try:
    with open(csv_file, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Server', 'Keyword', 'Search Time', 'Execution Time', 'Total Time', 'Rows Fetched'])

        for keyword in keywords:
            for run in range(1, num_runs + 1):
                # Connect to the servers
                ssh_connections = {}

                for server in servers:
                    retries = 0
                    while retries < max_retries:
                        try:
                            ssh = paramiko.SSHClient()
                            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                            ssh.connect(server, username=username, password=password)
                            ssh_connections[server] = ssh
                            print(f'Connected to {server}')
                            break  # Connection successful, break out of the retry loop
                        except paramiko.AuthenticationException:
                            print(f'Authentication failed for {server}')
                            break  # Authentication failed, break out of the retry loop
                        except paramiko.SSHException as e:
                            print(f'Error occurred while connecting to {server}: {str(e)}')
                            retries += 1
                            time.sleep(retry_delay)
                        except Exception as e:
                            print(f'Error occurred for {server}: {str(e)}')
                            retries += 1
                            time.sleep(retry_delay)

                # Run the script on the first server
                first_server = servers[0]
                ssh = ssh_connections[first_server]

                query = f'SELECT * FROM LTSOLID WHERE TERM = \'{keyword}\' ORDER BY RELEVANCE DESC'
                command = f'cd {script_directory} && ./queryDerby.sh "{query}"'
                stdin, stdout, stderr = ssh.exec_command(command)
                output = stdout.read().decode()
                print(output)
                # Split the output into lines
                lines = output.strip().split('\n')

                # Extract values from the last line
                last_line = lines[-1]

                # Read execution time, total time, and rows fetched
                execution_time = None
                total_time = None
                rows_fetched = None

                if last_line.startswith('Fetched'):
                    rows_fetched = last_line.split()[1]

                    # Find the indices of 'Total Time:' and 'Execution Time:' in the last line
                    total_time_index = last_line.find('Total Time:')
                    execution_time_index = last_line.find('Execution Time:')

                    # Extract total time and execution time from the last line
                    if total_time_index != -1 and execution_time_index != -1:
                        total_time_start = total_time_index + len('Total Time:')
                        total_time_end = last_line.find('ms', total_time_start)
                        total_time = last_line[total_time_start:total_time_end].strip()

                        execution_time_start = execution_time_index + len('Execution Time:')
                        execution_time_end = last_line.find('ms', execution_time_start)
                        execution_time = last_line[execution_time_start:execution_time_end].strip()

                # Collect search time from log files of all servers
                for server in servers:
                    ssh = ssh_connections[server]
                    try:
                        log_file_path = os.path.join(log_directory, 'response.csv')
                        try:
                            with ssh.open_sftp().file(log_file_path, 'r') as log_file:
                                for line in log_file:
                                    pass  # Read the last line of the log file
                                search_time_start = line.rfind('Total Time:') + len('Total Time:')
                                search_time_end = line.rfind(']', search_time_start)
                                search_time = line[search_time_start:search_time_end].strip()

                            # Write to CSV
                            writer.writerow([server, keyword, search_time, execution_time, total_time, rows_fetched])

                        except IOError:
                            print(f'Log file {log_file_path} not found.')

                    except paramiko.AuthenticationException:
                        search_time = "Failed"
                        writer.writerow([server, keyword, search_time, execution_time, total_time, rows_fetched])
                        print(f'Authentication failed for {server}')
                    except paramiko.SSHException as e:
                        print(f'Error occurred while connecting to {server}: {str(e)}')
                    except Exception as e:
                        print(f'Error occurred for {server}: {str(e)}')

        # Close SSH connections
        for ssh in ssh_connections.values():
            ssh.close()

except paramiko.AuthenticationException:
    print(f'Authentication failed for {first_server}')
except paramiko.SSHException as e:
    print(f'Error occurred while connecting to {first_server}: {str(e)}')
except Exception as e:
    print(f'Error occurred for {first_server}: {str(e)}')

print('Runtimes collected and written to the CSV file.')
