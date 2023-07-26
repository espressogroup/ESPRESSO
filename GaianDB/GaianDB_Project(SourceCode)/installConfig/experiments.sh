#!/bin/bash

# Set the path to the file containing keywords
keyword_file="keywords.txt"

# For Unix, when double-clicking on this script, we want the home+workspace dirs to be the install location (NOT the user's home folder!):
[[ `dirname $0` != "$PWD" ]] && [[ -z "$GDBH" ]] && export GDBH=`dirname $0` && [[ -z "$GAIAN_WORKSPACE" ]] && export GAIAN_WORKSPACE=$GDBH

[[ -z $GDBH ]] && export GDBH=.

# Loop over each keyword in the file
while read keyword; do
  # Generate the SQL command for the current keyword
  sql_command="SELECT * FROM LTSOLID WHERE Search_Parameters LIKE '%$keyword%'"

  # Measure the execution time of the SQL command
  start_time=$(date +%s.%N)
  $GDBH/queryDerby.sh $* "$sql_command" > /dev/null
  end_time=$(date +%s.%N)
  elapsed_time=$(echo "scale=6; $end_time - $start_time" | bc)

  # Print the keyword and execution time to the console
  echo "Keyword: $keyword"
  echo "Execution time: $elapsed_time seconds"
  echo
done < $keyword_file







