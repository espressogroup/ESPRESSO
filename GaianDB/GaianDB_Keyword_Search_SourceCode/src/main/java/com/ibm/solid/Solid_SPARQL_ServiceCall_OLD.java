package com.ibm.solid;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.ibm.gaiandb.GaianNode;
import com.ibm.gaiandb.Logger;
import com.opencsv.CSVWriter;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Solid_SPARQL_ServiceCall_OLD {

    private static final Logger logger = new Logger( "Gaian-SOLID Connector", 30 );


    public class SearchResult {
        private String personURL;
        private String name;
        private String email;

        public String getPersonURL() {
            return personURL;
        }

        public void setPersonURL(String personURL) {
            this.personURL = personURL;
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

    private String encodeValue(String value) throws UnsupportedEncodingException {
        return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
    }

    public void filterData(String data) throws Exception {
        String sparqlquery=data;

        if (data != null)
            sparqlquery = data.replace("'", "");
        else {
            return;
        }

        String solidConfigFileName = GaianNode.SOLID_CONFIG_FILE_NAME;
        String responseFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_RESPONSE_FILE_PATH");
        String apiUrl = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_SPARQL_API_URL");
        String csvFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_CSV_FILE_PATH");

        try {
            sparqlquery = data.replace("'", "");
            CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));

            String[] header = {"PERSON_URL", "NAME", "EMAIL"};
            csvWriter.writeNext(header);

            long start = System.currentTimeMillis();
            String start2 = String.valueOf(java.time.LocalTime.now());
            logger.logAlways( "Send SPARQL Query Request to Search APP: " + sparqlquery + "\n" );

            // Create a URL object
//            URL url = new URL(apiUrl + "?q=" + encodeValue(sparqlquery));

            URL url = new URL("http://localhost:8081/query?q=PREFIX%20foaf:%3Chttp://xmlns.com/foaf/0.1/%3E%20SELECT%20DISTINCT%20?person%20?name%20?email%20WHERE%20{%20%3Chttps://srv03911.soton.ac.uk:3000/LTQP0/profile/card%23me%3E%20foaf:knows%20?person.%20?person%20foaf:name%20?name.%20OPTIONAL%20{?person%20foaf:mbox%20?email}%20}");

            System.out.println("Searching SPARQL...");
            System.out.println(">>>>url>>>" +url);

            // Open a connection with a timeout
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(60000);
            connection.setReadTimeout(180000);

            // Set request method and headers if needed
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-Type", "application/json");

            // Get the response
            int responseCode = connection.getResponseCode();
            System.out.println(">>>>RESPONSE_CODE>>> "+responseCode);
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Read the response data here
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                StringBuilder response = new StringBuilder();


                while ((line = reader.readLine()) != null) {
                    response.append(line);
                    System.out.println("Response Content: "+ response.toString());
                }

                reader.close();

                long end = System.currentTimeMillis();
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                String timeStamp = String.valueOf(timestamp);
                String end2 = String.valueOf(java.time.LocalTime.now());
                String duration = String.valueOf(end - start);
                String[] total = {timeStamp, "Search APP Start Time: " + start2, " End time: " + end2, " Total Time: " + duration};
                logger.logAlways( "Receive Response from Search APP" + "  Total Execution Time: " + Arrays.toString(total) + "\n" );

                FileWriter fileWriter = new FileWriter(responseFilePath, true);
                BufferedWriter bufferWriter = new BufferedWriter(fileWriter);
                bufferWriter.write(Arrays.toString(total));
                bufferWriter.newLine();
                bufferWriter.close();

                try {

                    // Process the response data using Gson
                    // Assuming res is the JSON response string
                    Gson gson = new Gson();
                    String res = response.toString();
                    String[] jsonArray = gson.fromJson(res, String[].class);

                    List<SearchResult> resultList = new ArrayList<>();

                    for (int i = 0; i < jsonArray.length; i += 3) {
                        SearchResult result = new SearchResult();
                        result.setPersonURL(jsonArray[i]);
                        result.setName(jsonArray[i + 1]);
                        result.setEmail(jsonArray[i + 2]);
                        System.out.println(">>>>RESULT>>>>"+result);
                        resultList.add(result);
                    }

                    /*
                    Gson gson = new Gson();
                    String res = response.toString();
                    System.out.println(">>>>>RES:>>>>"+res);

                    SearchResult[] resultArray = gson.fromJson(res, SearchResult[].class);

                    for (SearchResult result : resultArray) {
                        String[] fields = new String[3];

                        fields[0] = result.personURL;
                        fields[1] = result.name;
                        fields[2] = result.email;
                        System.out.println(fields[0]+":::"+fields[1]+":::"+fields[2]+":::");
                        csvWriter.writeNext(fields);
                    } */

                     }
                catch (JsonSyntaxException e) {
                     e.printStackTrace();
                     logger.logAlways("Error parsing JSON response: " + e.getMessage());
                }

                // Close the CSV writer
                csvWriter.close();

            } else {
                // Handle the error case, e.g., by logging or throwing an exception
                logger.logAlways( "API request failed with status code: " + responseCode );
            }

            connection.disconnect();

        } catch (Exception e) {
            try {
                CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
                String[] header = {"PERSON_URL", "NAME", "EMAIL"};
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

}
