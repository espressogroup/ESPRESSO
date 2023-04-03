package com.ibm.solid;

import com.ibm.gaiandb.GaianNode;
import com.ibm.gaiandb.Logger;
import com.opencsv.CSVWriter;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author Reza Moosaei, 3/7/23 4:57 PM
 */
public class SolidServiceCall {
    private static final Logger logger = new Logger("SolidServiceCall", 35);

    public void filterData(String data) throws IOException {
        String whereClause;
        if (data != null)
            whereClause = data.replace("'", "");
        else {
            return;
        }
        String solidConfigFileName = GaianNode.SOLID_CONFIG_FILE_NAME;
        String apiUrl = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_API_URL");
        String csvFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_CSV_FILE_PATH");
        try {
            List<Map.Entry<String, String>> dataListMap = new ArrayList<>();
            //String apiUrl = "https://rezamoosa.solidcommunity.net/public/reza.csv";
            //String csvFilePath = "csvtestfiles/solid.csv";

            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(3000);//100
            connection.setReadTimeout(8000);//100

            CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
            String[] header = {"TERM", "ADDRESS"};
            csvWriter.writeNext(header);
            int status = connection.getResponseCode();
            String formatDescription =
                    String.format("Solid service (%s) has been called, the status is %s", apiUrl, status);
            logger.logAlways(formatDescription);
            logger.logImportant(formatDescription);
            logger.logThreadImportant(formatDescription);
            logger.logThreadAlways(formatDescription);
            if (status == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    String[] fields = inputLine.split(",");
                    dataListMap.add(
                            new AbstractMap.SimpleEntry<>(
                                    fields[0],
                                    fields[1]
                            )
                    );
                }
                Map.Entry<String, String> entry =
                        dataListMap.stream()
                                .filter(rawData ->
                                        rawData.getKey().equals(whereClause)
                                                || rawData.getValue().equals(whereClause)
                                ).findFirst().get();
                String[] fields = new String[2];
                fields[0] = entry.getKey();
                fields[1] = entry.getValue();
                csvWriter.writeNext(fields);
                in.close();
                csvWriter.close();
                System.out.println("Data saved to file: " + csvFilePath);
            } else {
                String[] fields = new String[2];
                fields[0] = whereClause;
                String messageError = "API request failed with status code: " + status + "  " + csvFilePath;
                fields[1] = messageError;
                csvWriter.writeNext(fields);
                csvWriter.close();
                System.out.println(messageError);
                //System.out.println("API request failed with status code: " + status);
                throw new RuntimeException(messageError);
            }
        } catch (Exception e) {
            try {
                CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
                String[] header = {"TERM", "ADDRESS"};
                csvWriter.writeNext(header);
                String[] fields = new String[2];
                fields[0] = whereClause;
                String messageError = "API request failed with status code: " + e.getMessage() + "  " + csvFilePath;
                fields[1] = messageError;
                csvWriter.writeNext(fields);
                csvWriter.close();
            } catch (Exception exception) {
                throw e;
            }
            //System.out.println("API request failed with status code: " + status);
            throw e;
        }
    }
}
