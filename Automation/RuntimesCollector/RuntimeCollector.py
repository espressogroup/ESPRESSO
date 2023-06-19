import csv
import paramiko
import os


# Experiments (Multi-Servers)
servers = ['srv03768.soton.ac.uk',
           'srv03812.soton.ac.uk',
           'srv03911.soton.ac.uk',
           'srv03814.soton.ac.uk',
           'srv03815.soton.ac.uk',
           'srv03816.soton.ac.uk'
           ]

# # Experiments (Single-Server)
# servers = ['srv03768.soton.ac.uk']


# SSH connection parameters
username = 'mrmm1f23@soton.ac.uk'
password = '01121809885_Soton'


script_directory = '/usr/local/Reza-WorkSpace/BuildGaian/GaianDB_BuildMaven_Keyword_20230611/'
log_directory = '/usr/local/Reza-WorkSpace/BuildGaian/GaianDB_BuildMaven_Keyword_20230611/csvtestfiles/'


# keywords = ['disease', 'corona','hemoproteins']

keywords = ['disease']

num_runs = 1
csv_file = 'runtimes.csv'
first_server = servers[0]


try:
    with open(csv_file, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Server', 'Keyword', 'Search Time', 'Execution Time', 'Total Time', 'Rows Fetched'])

        for keyword in keywords:
            for run in range(1, num_runs + 1):
                # Connect to the first server
                ssh = paramiko.SSHClient()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh.connect(first_server, username=username, password=password)
                print("Connected to "+ first_server)

                # Run the script on the first server
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

                    # Close SSH connection to the first server
                    ssh.close()

                # Collect search time from log files of all servers
                for server in servers:
                    try:
                        # Connect to the log file server
                        log_ssh = paramiko.SSHClient()
                        log_ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                        log_ssh.connect(server, username=username, password=password)

                        log_file_path = os.path.join(log_directory, 'response.csv')
                        try:
                            with log_ssh.open_sftp().file(log_file_path, 'r') as log_file:
                                for line in log_file:
                                    pass  # Read the last line of the log file
                                search_time_start = line.rfind('Total Time:') + len('Total Time:')
                                search_time_end = line.rfind(']', search_time_start)
                                search_time = line[search_time_start:search_time_end].strip()

                            # Write to CSV
                            writer.writerow([server, keyword, search_time, execution_time, total_time, rows_fetched])

                        except IOError:
                            print(f'Log file {log_file_path} not found.')

                        # Close SSH connection to the log file server
                        log_ssh.close()

                    except paramiko.AuthenticationException:
                        search_time="Failed"
                        writer.writerow([server, keyword, search_time, execution_time, total_time, rows_fetched])
                        print(f'Authentication failed for {server}')
                    except paramiko.SSHException as e:
                        print(f'Error occurred while connecting to {server}: {str(e)}')
                    except Exception as e:
                        print(f'Error occurred for {server}: {str(e)}')

    if ssh:
        ssh.close()

except paramiko.AuthenticationException:
    print(f'Authentication failed for {first_server}')
except paramiko.SSHException as e:
    print(f'Error occurred while connecting to {first_server}: {str(e)}')
except Exception as e:
    print(f'Error occurred for {first_server}: {str(e)}')

print('Runtimes collected and written to the CSV file.')

