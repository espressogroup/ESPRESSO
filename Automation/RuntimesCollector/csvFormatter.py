import csv

input_file = 'runtimes_old.csv'
output_file = 'output.csv'

# Read the input CSV file
with open(input_file, 'r') as file:
    reader = csv.reader(file)
    data = list(reader)

# Process the data and write to the output CSV file
with open(output_file, 'w', newline='') as file:
    writer = csv.writer(file)

    # Write the header for multiple server experiments
    writer.writerow(['index', 'keyword', 'cupsa', 'cups1',
                     'cups2', 'cup3', 'cups4', 'cups5',
                     'Execution Time', 'Total Time', 'Rows Fetched'])


    # # Write the header For the 1-server experiments
    # writer.writerow(['index', 'keyword', 'srv03768.soton.ac.uk_search_time',
    #                  'Execution Time', 'Total Time', 'Rows Fetched'])

    keyword_runs = {}
    keyword_index = {}

    # Process each row of data
    for row in data:
        server = row[0]
        keyword = row[1]
        search_time = row[2]
        execution_time = row[3]
        total_time = row[4]
        rows_fetched = row[5]

        # Check if it's a new keyword or a repeated keyword
        if keyword not in keyword_index:
            # New keyword
            keyword_index[keyword] = 1
            keyword_runs[keyword] = []

        # Append the search time for the server to the keyword runs
        keyword_runs[keyword].append(search_time)

        # Check if all servers have reported the search time for the current keyword
        if len(keyword_runs[keyword]) == 50:
            # Write the keyword runs to the output CSV file
            writer.writerow([keyword_index[keyword], keyword] + keyword_runs[keyword] +
                            [execution_time, total_time, rows_fetched])

            # Increment the index for the current keyword
            keyword_index[keyword] += 1

            # Clear the keyword runs for the next run
            keyword_runs[keyword] = []
