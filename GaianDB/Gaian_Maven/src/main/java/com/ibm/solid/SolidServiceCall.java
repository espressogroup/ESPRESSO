package com.ibm.solid;

import com.google.gson.Gson;
import com.ibm.gaiandb.GaianNode;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
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

import static org.junit.Assert.assertEquals;

/**
 author: Reza Moosaei 09.04.2023
 */


public class SolidServiceCall {

    public class SearchResult {
        public int frequency;
        public String address;
    }

    public void filterData(String data) throws Exception {
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
    whereClause = data.replace("'", "");
    CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));


    String[] header = {"TERM", "ADDRESS", "RELEVANCE"};
    csvWriter.writeNext(header);

    HttpResponse<JsonNode> response = null;
    response = Unirest.post("http://localhost:3000/query")
                .header("accept", "application/json")
                .header("Content-Type", "application/json")
                .body("{ \"keyword\" : \""+ whereClause +"\" }")
                .asJson();

        Gson gson = new Gson();
        String res = response.getBody().toString();
    SearchResult[] resultArray = gson.fromJson(res, SearchResult[].class);
    for (SearchResult result : resultArray) {
        String[] fields = new String[3];
        fields[0] = whereClause;
        fields[1] = result.address;
        fields[2] = String.valueOf(result.frequency);
        csvWriter.writeNext(fields);
        System.out.println(result.address + " " + result.frequency);
    }
    csvWriter.close();
} catch (Exception e) {
    try {
        CSVWriter csvWriter = new CSVWriter(new FileWriter(csvFilePath));
        String[] header = {"TERM", "ADDRESS", "RELEVANCE"};
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

