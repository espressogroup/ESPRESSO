import subprocess
import json
import os

# Sample dictionary (use your actual data structure)
dictionary = {
    "https-srv03812-soton-ac-uk-3000-webid1-profile-card-me": {
        "srv03812": {
            "pod1": ["AlecFile.txt", "AlphaFile.txt"],
            "pod2": ["Jamal.txt"]
        },
        "srv03813": {
            "pod4": ["Toer.txt"]
        }
    },
    "https-srv03813-soton-ac-uk-3000-webid2-profile-card-me": {
        "srv03812": {
            "pod3": ["Mo.txt", "Helen.txt"]
        }
    }
}

# Specify file paths
json_file_path = "dictionary.json"  # Save JSON to this file
source_dir = "/Users/thanassis/Documents/Files"
output_dir = "/Users/thanassis/Documents/Index"
jar_file = "Index.jar"

# Save the dictionary to a JSON file
with open(json_file_path, "w") as json_file:
    json.dump(dictionary, json_file, indent=4)

# Ensure the file exists
if not os.path.exists(json_file_path):
    raise FileNotFoundError(f"The JSON file {json_file_path} could not be created.")

# Run the Java program with the JSON file
result = subprocess.run([
    "java", "-jar", jar_file, json_file_path, source_dir, output_dir
], capture_output=True, text=True)

# Print the output from the Java program
print("STDOUT:")
print(result.stdout)
print("\nSTDERR:")
print(result.stderr)  # If there were any errors
