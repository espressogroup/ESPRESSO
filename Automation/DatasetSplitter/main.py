import os

# Define the number of output files
num_output_files = 2400

# Define the paths to the two input files
input_file_path_1 = "train.dat"
input_file_path_2 = "test.dat"

# Define the path to the output file
merged_file_path = "merged_file.dat"

# Merge the two input files into one
with open(merged_file_path, "w") as merged_file:
    with open(input_file_path_1, "r") as input_file_1:
        for line in input_file_1:
            merged_file.write(line)
        merged_file.write("\n")
    with open(input_file_path_2, "r") as input_file_2:
        for line in input_file_2:
            merged_file.write(line)

# Open the merged file and split it into 100 smaller files
with open(merged_file_path, "r") as merged_file:

    # Get the total number of lines in the merged file
    num_lines = sum(1 for line in merged_file)

    # Calculate the number of lines to write to each output file
    lines_per_file = num_lines // num_output_files

    # Rewind the merged file to the beginning
    merged_file.seek(0)

    # Loop over the output files and write the appropriate number of lines to each
    for i in range(num_output_files):
        output_file_path = f"/Users/yurysavateev/dataset4/File{i+1}.dat"
        with open(output_file_path, "w") as output_file:
            for j in range(lines_per_file):
                output_file.write(merged_file.readline())
            # If there are any remaining lines, write them to the last file
            if i == num_output_files - 1:
                for line in merged_file:
                    output_file.write(line)

# Remove the merged file
os.remove(merged_file_path)


