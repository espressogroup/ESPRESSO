import os


def split_servers_to_rdf(input_file, output_dir, servers_per_file=5):
    """
    Splits the contents of an RDF file into smaller RDF files containing the specified number of servers.
    Args:
        input_file (str): Path to the input text file.
        output_dir (str): Directory where the output files will be saved.
        servers_per_file (int): Number of servers per output file.
    """
    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Markers for the start and end of a server's content
    server_start_marker = "[] ns1:Address "
    server_end_marker = "ns1:Type ns1:Server ."

    # RDF prefixes to add to each file
    rdf_prefixes = (
        "@prefix ns1: <http://example.org/SOLIDindex/> .\n"
        "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n"
    )

    try:
        with open(input_file, 'r') as infile:
            lines = infile.readlines()

        # Variables to track the current server content and file
        current_servers = []
        server_count = 0
        file_index = 1

        for line in lines:
            if server_start_marker in line:
                # Start of a new server
                current_server = [line]
            elif server_end_marker in line:
                # End of the current server
                current_server.append(line)
                current_servers.append("".join(current_server))
                server_count += 1

                # Check if we need to write to a new file
                if server_count == servers_per_file:
                    output_file = os.path.join(output_dir, f"vldb_exp{file_index}.ttl")
                    with open(output_file, 'w') as outfile:
                        outfile.write(rdf_prefixes)
                        outfile.writelines(current_servers)

                    # Reset for the next file
                    current_servers = []
                    server_count = 0
                    file_index += 1
            elif 'current_server' in locals():
                # Continue adding lines to the current server
                current_server.append(line)

        # Write any remaining servers to a new file
        if current_servers:
            output_file = os.path.join(output_dir, f"vldb_exp{file_index}.ttl")
            with open(output_file, 'w') as outfile:
                outfile.write(rdf_prefixes)
                outfile.writelines(current_servers)

        print(f"Split completed. Files saved in {output_dir}")

    except FileNotFoundError:
        print(f"Error: The file {input_file} does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")


# Example usage
input_file = "/Users/ragab/vldb_exp.ttl"
output_dir = "output_servers_5s"
split_servers_to_rdf(input_file, output_dir)
