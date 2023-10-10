package com.ibm.solid;

import com.google.gson.Gson;
import com.ibm.gaiandb.GaianNode;
import com.ibm.gaiandb.Logger;
import com.opencsv.CSVWriter;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.Arrays;


public class SolidServiceCall {

    private static final Logger logger = new Logger( "Gaian-SOLID Connector", 30 );

    public class SearchResult {
        public int frequency;
        public String address;
    }

    private String encodeValue(String value) throws UnsupportedEncodingException {
        return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
    }

    public void filterData(String data) throws Exception {
        String whereClause;

        if (data != null)
            whereClause = data.replace("'", "");
        else {
            return;
        }

        String solidConfigFileName = GaianNode.SOLID_CONFIG_FILE_NAME;
        String responseFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_RESPONSE_FILE_PATH");
        String apiUrl = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_API_URL");
        String csvFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_CSV_FILE_PATH");

        try {
            whereClause = data.replace("'", "");
            CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));

            String[] header = {"Search_Parameters", "Document_URL", "RELEVANCE"};
            csvWriter.writeNext(header);

            long start = System.currentTimeMillis();
            String start2 = String.valueOf(java.time.LocalTime.now());
            logger.logAlways( "Send Keyword Search Request to Search APP: " + whereClause + "\n" );

            // Create a URL object
            URL url = new URL(apiUrl + "?keyword=" + encodeValue(whereClause));

            System.out.println("Searching New...");

            // Open a connection with a timeout
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(60000);
            connection.setReadTimeout(180000);

            // Set request method and headers if needed
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Content-Type", "application/json");

            // Get the response
            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // Read the response data here
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                StringBuilder response = new StringBuilder();

                while ((line = reader.readLine()) != null) {
                    response.append(line);
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


                // Process the response data using Gson
                Gson gson = new Gson();
                String res = response.toString();
                SearchResult[] resultArray = gson.fromJson(res, SearchResult[].class);

                for (SearchResult result : resultArray) {
                    String[] fields = new String[3];
                    fields[0] = whereClause;
                    fields[1] = result.address;
                    fields[2] = String.valueOf(result.frequency);
                    csvWriter.writeNext(fields);
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
                String[] header = {"Search Parameters", "Document URL", "RELEVANCE"};
                csvWriter.writeNext(header);
                String[] fields = new String[3];
                fields[0] = whereClause;
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
