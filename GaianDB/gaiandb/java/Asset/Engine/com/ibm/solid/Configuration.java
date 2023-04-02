package com.ibm.solid;

/**
 * @author Reza Moosaei 14.03.23
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
                "TERM VARCHAR(255), ADDRESS VARCHAR(255)");
        PropertiesManagement.getInstance(fileName).addProperty(
                "LT" + logicalTableName + "_DS0_VTI",
                "com.ibm.db2j.FileImport");
        System.out.println("The SOLID properties has been configured...");
    }
}