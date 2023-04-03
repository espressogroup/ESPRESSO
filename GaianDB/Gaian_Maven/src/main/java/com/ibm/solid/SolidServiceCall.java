package com.ibm.solid;

import com.ibm.gaiandb.GaianNode;
import com.opencsv.CSVWriter;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author Reza Moosaei 14.03.23
 */
public class SolidServiceCall {

    public void filterData(String data) throws Exception {

        List<Map.Entry<String, String>> dataListMap = new ArrayList<>();

        String solidConfigFileName = GaianNode.SOLID_CONFIG_FILE_NAME;

        String apiUrl = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_API_URL");
        String csvFilePath = PropertiesManagement.getInstance(solidConfigFileName)
                .getProperty("SOLID_CSV_FILE_PATH");

        URL url = new URL(apiUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(4000);
        connection.setReadTimeout(4000);

        int status = connection.getResponseCode();
        if (status == HttpURLConnection.HTTP_OK) {
            System.out.println("Accessed the file already!");
            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
            String[] header = {"TERM", "ADDRESS"};
            csvWriter.writeNext(header);

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
                                    {
                                        if (data != null) {
                                            String replace = data.replace("'", "");
                                            return rawData.getKey().equals(replace)
                                                    || rawData.getValue().equals(replace);

                                        }
                                        return false;
                                    }
                            ).findFirst().get();
            String[] fields = new String[2];
            fields[0] = entry.getKey();
            fields[1] = entry.getValue();
            System.out.println(fields[0] +"::" + fields[1]);
            csvWriter.writeNext(fields);
            in.close();
            csvWriter.close();
            System.out.println("Data saved to file: " + csvFilePath);
        } else {
            System.out.println("API request failed with status code: " + status);
        }
    }
}
