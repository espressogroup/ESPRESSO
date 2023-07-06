import os

# Define the path of the directory containing the input files
input_files_directory = "./50Files/"

# Define the path of the directory where the duplicated files will be created
output_files_directory = "./50Files/"

# Define the number of files to duplicate
num_files_to_duplicate = 50

# Loop over the existing files
for i in range(1, num_files_to_duplicate + 1):
    input_file_path = os.path.join(input_files_directory, f"File{i}.dat")
    output_file_path = os.path.join(output_files_directory, f"DuplicatedFile{i}.dat")

    # Read the content of the input file
    with open(input_file_path, "r") as input_file:
        content = input_file.read()

    # Write the content to the output file
    with open(output_file_path, "w") as output_file:
        output_file.write(content)

