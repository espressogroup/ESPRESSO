import re
import csv
from statistics import mean

def parse_log_file(log_file_path, output_csv_path):
    with open(log_file_path, 'r') as log_file:
        log_data = log_file.readlines()

    results = []
    entry = {}
    server_pod_times = {}
    server_result_times = {}
    server_rows = {}

    for line in log_data:
        if "Search Word:" in line:
            if entry:  # Save previous entry
                finalize_entry(entry, server_pod_times, server_result_times, server_rows, results)
            entry = {
                "Keyword": re.search(r'Search Word: \"(.+?)\"', line).group(1),
                "WebID": "",
                "ServersSelectionTime": 0,
                "PodsSelectionTimes": [],
                "RankingTime": 0,
                "TotalTime": 0,
                "TotalRows": 0,
                "ServerDetails": {}
            }
            server_pod_times = {}
            server_result_times = {}
            server_rows = {}

        elif "WebID:" in line:
            entry["WebID"] = re.search(r'WebID: \"(.+?)\"', line).group(1)

        elif "Timer Ended: FindRelevantServers" in line:
            entry["ServersSelectionTime"] = float(re.search(r'Elapsed Time: ([0-9.]+)ms', line).group(1))

        elif "Timer Ended: FindRelevantPods" in line:
            server = re.search(r'FindRelevantPods@__(.+?):', line).group(1)
            server = remove_suffix(server, ".soton.ac.uk")
            time = float(re.search(r'Elapsed Time: ([0-9.]+)ms', line).group(1))
            server_pod_times[server] = time

        elif "Timer Ended: CombineResults" in line:
            server = re.search(r'CombineResults@__(.+?):', line).group(1)
            server = remove_suffix(server, ".soton.ac.uk")
            time = float(re.search(r'Elapsed Time: ([0-9.]+)ms', line).group(1))
            server_result_times[server] = time

        elif "RowsFetched@__" in line:
            server = re.search(r'RowsFetched@__(.+?):', line).group(1)
            server = remove_suffix(server, ".soton.ac.uk")
            rows = int(re.search(r'RowsFetched@__.+?: ([0-9]+)', line).group(1))
            server_rows[server] = rows

        elif "RowsFetched@ALL" in line:
            entry["TotalRows"] = int(re.search(r'RowsFetched@ALL: ([0-9]+)', line).group(1))

        elif "Timer Ended: RankingResults@ALL" in line:
            entry["RankingTime"] = float(re.search(r'Elapsed Time: ([0-9.]+)ms', line).group(1))

        elif "Timer Ended: TotalTime" in line:
            entry["TotalTime"] = float(re.search(r'Elapsed Time: ([0-9.]+)ms', line).group(1))

    # Finalize last entry
    if entry:
        finalize_entry(entry, server_pod_times, server_result_times, server_rows, results)

    # Write to CSV
    write_to_csv(output_csv_path, results)

def finalize_entry(entry, server_pod_times, server_result_times, server_rows, results):
    avg_pod_selection_time = round(mean(server_pod_times.values()), 2) if server_pod_times else 0
    entry["PodsSelectionTimes"] = avg_pod_selection_time

    for server in server_pod_times:
        pod_time = server_pod_times.get(server, 0)
        result_time = server_result_times.get(server, 0)
        rows = server_rows.get(server, 0)
        entry["ServerDetails"][server] = [pod_time, result_time, rows]

    results.append(entry)

def remove_suffix(text, suffix):
    if text.endswith(suffix):
        return text[: -len(suffix)]
    return text

# def write_to_csv(output_csv_path, results):
#     with open(output_csv_path, 'w', newline='') as csv_file:
#         writer = csv.writer(csv_file)
#         header = ["Keyword", "WebID", "ServersSelectionTime", "PodsSelectionTime"]
#
#         # Gather unique server names
#         unique_servers = sorted(
#             {server for entry in results for server in entry["ServerDetails"]}
#         )
#         for server in unique_servers:
#             header.extend([f"{server}Time", f"{server}Rows"])
#
#         header.extend(["RankingTime", "TotalTime", "TotalRows"])
#         writer.writerow(header)
#
#         for entry in results:
#             row = [
#                 entry["Keyword"],
#                 entry["WebID"],
#                 entry["ServersSelectionTime"],
#                 entry["PodsSelectionTimes"]
#             ]
#
#             for server in unique_servers:
#                 details = entry["ServerDetails"].get(server, [0, 0, 0])
#                 row.extend(details[-2:])
#
#             row.extend([entry["RankingTime"], entry["TotalTime"], entry["TotalRows"]])
#             writer.writerow(row)

def write_to_csv(output_csv_path, results):
    with open(output_csv_path, 'w', newline='') as csv_file:
        writer = csv.writer(csv_file)

        previous_keyword = None
        previous_webid = None

        for entry in results:
            # Start a new section if Keyword or WebID changes
            if entry["Keyword"] != previous_keyword or entry["WebID"] != previous_webid:
                # Write a new header
                header = ["Keyword", "WebID", "ServersSelectionTime", "PodsSelectionTime"]
                unique_servers = sorted(entry["ServerDetails"].keys())
                for server in unique_servers:
                    header.extend([f"{server}Time", f"{server}Rows"])
                header.extend(["RankingTime", "TotalTime", "TotalRows"])
                writer.writerow(header)

                previous_keyword = entry["Keyword"]
                previous_webid = entry["WebID"]

            # Write the data row
            row = [
                entry["Keyword"],
                entry["WebID"],
                entry["ServersSelectionTime"],
                entry["PodsSelectionTimes"]
            ]

            for server in unique_servers:
                details = entry["ServerDetails"].get(server, [0, 0, 0])
                row.extend(details[-2:])

            row.extend([entry["RankingTime"], entry["TotalTime"], entry["TotalRows"]])
            writer.writerow(row)



# Example usage
parse_log_file('./runtimes.log', 'output.csv')
