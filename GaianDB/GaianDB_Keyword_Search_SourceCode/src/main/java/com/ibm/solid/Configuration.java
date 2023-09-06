package com.ibm.solid;

/**
 * @author Reza Moosaei
 * Configuration of Logical Table
 */
public class Configuration {
    public static void config(String fileName) {

        String logicalTableName = "SOLID";
        PropertiesManagement.getInstance(fileName).addProperty(
                "LT" + logicalTableName + "_DS0_ARGS",
                "<GAIAN_WORKSPACE>/csvtestfiles/solid.csv");
        PropertiesManagement.getInstance(fileName).addProperty(
                "LT" + logicalTableName + "_CONSTANTS",
                "");
        PropertiesManagement.getInstance(fileName).addProperty(
                "LT" + logicalTableName + "_DS0_OPTIONS",
                "MAP_COLUMNS_BY_POSITION");
        PropertiesManagement.getInstance(fileName).addProperty(
                "LT" + logicalTableName + "_DEF",
                "Search_Parameters VARCHAR(255), Document_URL VARCHAR(255), RELEVANCE VARCHAR(3)");
        PropertiesManagement.getInstance(fileName).addProperty(
                "LT" + logicalTableName + "_DS0_VTI",
                "com.ibm.db2j.FileImport");
        System.out.println("The SOLID properties has been configured...");
    }
}