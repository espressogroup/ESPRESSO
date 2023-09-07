package com.ibm.solid;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Properties;
import java.util.Set;

/**
 * @author Reza Moosaei
 * Generate gaiandb_Config.properties
 */
public class PropertiesManagement {
    private static PropertiesManagement propertiesManagement;
    private String configFileName = "gaiandb_config.properties";
    private final Properties configProp = new Properties();

    private PropertiesManagement(String configFileName) {
        try {
            if (configFileName != null)
                this.configFileName = configFileName;
            //Private constructor to restrict new instances
            FileReader reader = new FileReader(this.configFileName);
            System.out.println("Reading all properties from the file");
            configProp.load(reader);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public static PropertiesManagement getInstance(String configFileName) {
        if (propertiesManagement == null)
            propertiesManagement = new PropertiesManagement(configFileName);
        return propertiesManagement;
    }

    public String getProperty(String key) {
        return configProp.getProperty(key);
    }

    public Set<String> getAllPropertyNames() {
        return configProp.stringPropertyNames();
    }

    public boolean containsKey(String key) {
        return configProp.containsKey(key);
    }

    public void addProperty(String key, String value) {
        configProp.setProperty(key, value);
        try {
            configProp.store(new FileWriter(this.configFileName), null);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}