#!/bin/bash

# Directory containing the vldb_pod* directories
base_dir="/srv/espresso/storage" 

for dir in "$base_dir"/vldb_pod*; do
  echo "Processing directory: $dir" 
  find "$dir/espressoindex" -name "*.bloom" -delete
  echo "Deleted .bloom files from $dir"
done
