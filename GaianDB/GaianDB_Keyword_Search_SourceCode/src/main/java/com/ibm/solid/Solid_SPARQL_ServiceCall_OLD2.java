package com.ibm.solid;

import com.google.gson.Gson;
import com.ibm.gaiandb.GaianNode;
import com.ibm.gaiandb.Logger;
import com.opencsv.CSVWriter;

import java.io.*;
import java.lang.reflect.Field;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Solid_SPARQL_ServiceCall_OLD2 {

    private static final Logger logger = new Logger("Gaian-SOLID Connector", 30);

    public class SearchResult {
        private String person;
        private String name;
        private String email;

        public String getPerson() {
            return person;
        }

        public void setPerson(String person) {
            this.person = person;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public void filterData(String data) throws Exception {
        String sparqlquery = data;

        if (data != null)
            sparqlquery = data.replace("'", "");
        else {
            return;
        }

        String solidConfigFileName = GaianNode.SOLID_CONFIG_FILE_NAME;
        String responseFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_SPARQL_RESPONSE_FILE_PATH");
        String apiUrl = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_SPARQL_API_URL");
        String csvFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_SPARQL_CSV_FILE_PATH");

        try {
            sparqlquery = data.replace("'", "");
            sparqlquery = sparqlquery.replace("#", "%23"); // Ensure '#' is encoded as '%23'

            System.out.println(">>>>SPARQL QUERY>>>>" + sparqlquery);

//            CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));

//            String[] header = {"PERSON_URL", "NAME", "EMAIL"};
//            csvWriter.writeNext(header);

            long start = System.currentTimeMillis();
            String start2 = String.valueOf(java.time.LocalTime.now());
            logger.logAlways("Send SPARQL Query Request to Search APP: " + sparqlquery + "\n");

            // Create a URL object
            String encodedQuery = encodeSparqlQuery(sparqlquery);
            System.out.println(">>>>" + encodedQuery);
            String fullUrl = apiUrl + "?q=" + encodedQuery;
            System.out.println(fullUrl);
            URL url = new URL(fullUrl);

            // Open a connection with a timeout
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(60000);
            connection.setReadTimeout(180000);

            // Set request method and headers if needed
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-Type", "application/json");

            // Get the response
            int responseCode = connection.getResponseCode();
            System.out.println(">>>>RESPONSE_CODE>>> " + responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Read the response data here
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();

                String line;

                while ((line = reader.readLine()) != null) {
                    response.append(line);
                    System.out.println(">>>>LINE>>> " + line);
                }

                reader.close();

                long end = System.currentTimeMillis();
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                String timeStamp = String.valueOf(timestamp);
                String end2 = String.valueOf(java.time.LocalTime.now());
                String duration = String.valueOf(end - start);
                String[] total = {timeStamp, "Search APP Start Time: " + start2, " End time: " + end2, " Total Time: " + duration};
                logger.logAlways("Receive Response from Search APP" + "  Total Execution Time: " + Arrays.toString(total) + "\n");

                FileWriter fileWriter = new FileWriter(responseFilePath, true);
                BufferedWriter bufferWriter = new BufferedWriter(fileWriter);
                bufferWriter.write(Arrays.toString(total));
                bufferWriter.newLine();
                bufferWriter.close();

                // Process the response data using Gson
                Gson gson = new Gson();
                String res = response.toString();
                System.out.println(">>>>>RES:>>>>" + res);

                // Parse the JSON response as an array of strings
                SearchResult[] searchResults = gson.fromJson(res, SearchResult[].class);

                writeResultsToCSV(Arrays.asList(searchResults), csvFilePath);



//                // Process each SearchResult object
//                try (CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath))) {
//                    String[] header = {"PERSON_URL", "NAME", "EMAIL"};
//                    csvWriter.writeNext(header);
//
//                    // Write each SearchResult object to the CSV file
//                    for (SearchResult result : searchResults) {
//                        String[] row = {
//                                result.getPerson(),
//                                result.getName() != null ? result.getName().replace("\"", "") : "",
//                                result.getEmail() != null ? result.getEmail().replace("\"", "") : ""
//                        };
//                        System.out.println(">>>>>ROW:>>>>" + result.getPerson() + result.getName() + result.getEmail());
//                        csvWriter.writeNext(row);
//                    }
//
//                    // Close the CSV writer
//                    csvWriter.close();
//
//                } catch (IOException e) {
//                    logger.logAlways("Error writing to CSV file: " + e.getMessage());
//                }

//                for (SearchResult personResult : personResults) {
//                    SearchResult result = new SearchResult();
//                    result.setPersonURL(personResult.getPersonURL());
//                    result.setName(personResult.getName() != null ? personResult.getName() : ""); // Handle null name
//                    result.setEmail(personResult.getEmail() != null ? personResult.getEmail() : ""); // Handle null email
//                    resultList.add(result);
//                }
//
//                // Write the results to CSV
//                for (SearchResult result : resultList) {
//                    String[] fields = new String[3];
//                    fields[0] = result.getPersonURL();
//                    fields[1] = result.getName();
//                    fields[2] = result.getEmail();
//                    csvWriter.writeNext(fields);
//                }

//                // Process the array in groups of three elements (personURL, name, email)
//                for (int i = 0; i < jsonArray.length; i += 3) {
//                    SearchResult result = new SearchResult();
//                    result.setPersonURL(jsonArray[i]);
//                    result.setName(jsonArray[i + 1]);
//                    result.setEmail(jsonArray[i + 2]);
//                    resultList.add(result);
//                }
//
//                // Write the results to CSV
//                for (SearchResult result : resultList) {
//                    String[] fields = new String[3];
//                    fields[0] = result.getPersonURL();
//                    fields[1] = result.getName();
//                    fields[2] = result.getEmail();
//                    csvWriter.writeNext(fields);
//                }


            } else {
                // Handle the error case, e.g., by logging or throwing an exception
                logger.logAlways("API request failed with status code: " + responseCode);
            }

            connection.disconnect();

        } catch (Exception e) {
            try {
                CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
                String[] header = {"PERSON", "NAME", "EMAIL"};
                csvWriter.writeNext(header);
                String[] fields = new String[3];
                fields[0] = sparqlquery;
                String messageError = "API request failed with status code: ";
                fields[1] = messageError;
                fields[2] = e.getMessage() + "  " + csvFilePath;
                csvWriter.writeNext(fields);
                csvWriter.close();
            } catch (Exception exception) {
                throw e;
            }
            throw e;
        }
    }

    private static String encodeValue(String value) throws UnsupportedEncodingException {
        String encoded = URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
        return encoded.replaceAll("\\+", "%20");
    }

    private static String encodeSparqlQuery(String query) {
        return query.replaceAll(" ", "%20")
                .replaceAll("\\{", "%7B")
                .replaceAll("\\}", "%7D")
                .replaceAll("#", "%23");
    }


private void writeResultsToCSV(List<SearchResult> searchResults, String csvFilePath) throws IOException {
    // Use reflection to get field names for headers, excluding synthetic fields
    Field[] fields = SearchResult.class.getDeclaredFields();
    List<String> validFieldNames = new ArrayList<>();
    for (Field field : fields) {
        if (!field.isSynthetic()) { // Check if the field is not synthetic
            validFieldNames.add(field.getName().toUpperCase()); // Add valid field names to the list
        }
    }

    String[] headers = validFieldNames.toArray(new String[0]); // Convert list to array

    // Initialize CSVWriter with the headers
    try (CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath),
                                             CSVWriter.DEFAULT_SEPARATOR,
                                             CSVWriter.NO_QUOTE_CHARACTER,
                                             CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                                             CSVWriter.DEFAULT_LINE_END)) {
        csvWriter.writeNext(headers);

        // Write each SearchResult object to the CSV file
        for (SearchResult result : searchResults) {
            List<String> rowValues = new ArrayList<>();
            for (Field field : fields) {
                if (!field.isSynthetic()) {
                    field.setAccessible(true); // Make private fields accessible
                    Object value = field.get(result);
                    rowValues.add(value != null ? value.toString() : ""); // Handle null values
                }
            }
            csvWriter.writeNext(rowValues.toArray(new String[0]), false); // Convert list to array, no quotes
        }
    } catch (IllegalAccessException e) {
        // Handle exception
        throw new RuntimeException("Error accessing SearchResult fields", e);
    }
}


}
