package com.ibm.solid;

public class SolidServiceCall_Reza {
}

//package com.ibm.solid;
//
//import com.google.gson.Gson;
//import com.ibm.gaiandb.GaianNode;
//import com.ibm.gaiandb.Logger;
//import com.mashape.unirest.http.HttpResponse;
//import com.mashape.unirest.http.JsonNode;
//import com.mashape.unirest.http.Unirest;
//import com.mashape.unirest.http.exceptions.UnirestException;
//import com.opencsv.CSVWriter;
//
//import java.io.*;
//import java.net.HttpURLConnection;
//import java.net.URL;
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.sql.Timestamp;
//import java.util.*;
//import java.time.LocalDateTime;
//import java.time.format.DateTimeFormatter;
//import static org.junit.Assert.assertEquals;
//
///**
// author: Reza Moosaei 09.04.2023
// GaianDB-Solid connector
// */
//
//
//public class SolidServiceCall {
//
//    private static final Logger logger = new Logger( "Gaian-SOLID Connector", 30 );
//    public class SearchResult {
//        public int frequency;
//        public String address;
//    }
//    private String encodeValue(String value) throws UnsupportedEncodingException {
//        return URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
//    }
//        public void filterData(String data) throws Exception {
//        String whereClause;
//        if (data != null)
//            whereClause = data.replace("'", "");
//        else {
//            return;
//        }
//        String solidConfigFileName = GaianNode.SOLID_CONFIG_FILE_NAME;
//        String responseFilePath = PropertiesManagement.getInstance(solidConfigFileName)
//                    .getProperty("SOLID_RESPONSE_FILE_PATH");
//        String apiUrl = PropertiesManagement.getInstance(solidConfigFileName)
//                .getProperty("SOLID_API_URL");
//        String csvFilePath = PropertiesManagement.getInstance(solidConfigFileName)
//                .getProperty("SOLID_CSV_FILE_PATH");
//
//    try {
//    whereClause = data.replace("'", "");
//    CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
//
//    String[] header = {"Search_Parameters", "Document_URL", "RELEVANCE"};
//    csvWriter.writeNext(header);
//
//    long start = System.currentTimeMillis();
//    String start2 = String.valueOf(java.time.LocalTime.now());
//    logger.logAlways( "Send Keyword Search Request to Search APP: " + whereClause + "\n" );
//
//    HttpResponse<JsonNode> response = null;
//
//    response = Unirest.get(apiUrl + "?keyword=" + encodeValue(whereClause))
//            .asJson();
//
//        long end = System.currentTimeMillis();
//        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
//        String timeStamp = String.valueOf(timestamp);
//        String end2 = String.valueOf(java.time.LocalTime.now());
//        String duration = String.valueOf(end - start);
//        String[] total = {timeStamp, "Search APP Start Time: " + start2 , " End time: " + end2, " Total Time: " + duration };
//        logger.logAlways( "Receive Response from Search APP" + "  Total Execution Time: " + total + "\n" );
//
//        FileWriter fileWriter = new FileWriter(responseFilePath, true);
//        BufferedWriter bufferWriter = new BufferedWriter(fileWriter);
//        bufferWriter.write(Arrays.toString(total));
//        bufferWriter.newLine();
//        bufferWriter.close();
//
//    Gson gson = new Gson();
//    String res = response.getBody().toString();
//    SearchResult[] resultArray = gson.fromJson(res, SearchResult[].class);
//    for (SearchResult result : resultArray) {
//        String[] fields = new String[3];
//        fields[0] = whereClause;
//        fields[1] = result.address;
//        fields[2] = String.valueOf(result.frequency);
//        csvWriter.writeNext(fields);
//          }
//    csvWriter.close();
//} catch (Exception e) {
//    try {
//        CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
//        String[] header = {"Search Parameters", "Document URL", "RELEVANCE"};
//        csvWriter.writeNext(header);
//        String[] fields = new String[3];
//        fields[0] = whereClause;
//        String messageError = "API request failed with status code: ";
//        fields[1] = messageError;
//        fields[2] = e.getMessage() + "  " + csvFilePath;
//        csvWriter.writeNext(fields);
//        csvWriter.close();
//    } catch (Exception exception) {
//        throw e;
//    }
//        throw e;
//    }
//    }
//}
//