package com.mycompany.searcher;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.store.*;
import org.apache.lucene.index.*;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.search.*;
import org.apache.lucene.document.Document;
import org.apache.lucene.queryparser.classic.QueryParser;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.*;
import org.apache.lucene.util.BytesRef;

/**
 * @author Mohammad Bahrani for the ESPRESSO Project 2025
 * @author Helen Oliver for the ESPRESSO Project 2025
 * Conducts a UUID-specific search of the ESPRESSO-indexed HATs.
 */

public class Searcher {
    private static Map<String, Double> backgroundModel = null;
    /** Access token for the network-level ESPRESSO HAT. */
    private static String espressoAccessToken = "";
    /** userId of the network-level ESPRESSO HAT. */
    private static String espressoUserId = "";
    /** Username of the network-level ESPRESSO HAT. */
    private static final String ESPRESSO_USERNAME = "";
    /** Password for the network-level ESPRESSO HAT. */
    private static final String ESPRESSO_PASSWORD = "";
    /** URL of the network-level ESPRESSO HAT. */
    private static final String ESPRESSO_URL = "";

    /** Endpoint for getting access credentials from the Dataswyft API. */
    private static final String AUTHTOKEN_PATH = "users/access_token";
    /** Prefix for identifying ESPRESSO Index files stored in a HAT. */
    private static final String ESPRESSO_IDX_FILE_PREFIX = "espresso_metaindex";
    /** Our identifier for publicly accessible files stored in a HAT. */
    private static final String ESPRESSO_PUBLIC_IDX_FILENAME_STEM = "public";
    /** File type of an ESPRESSO index file. */
    private static final String ESPRESSO_IDX_FILE_TYPE = ".zip";
    /** Suffix for a network-level ESPRESSO index file. */
    private static final String NETWORK_LEVEL_IDX_FILE_SUFFIX = "-servers";
    /** Endpoint for file storage in the Dataswyft File API. */
    private static final String DATASWYFT_FILE_PATH = "api/v2.6/files/";
    /** Endpoint for getting a file's contents from the Dataswyft File API. */
    private static final String DATASWYFT_FILE_CONTENT_PATH = "api/v2.6/files/content/";
    /** Endpoint for getting a file's metadata from the Dataswyft File API. */
    private static final String DATASWYFT_FILE_METADATA_PATH = "api/v2.6/files/file/";
    /** Endpoint for ESPRESSO's metaindex in a given HAT. */
    private static final String ESPRESSO_METAINDEX_ENDPOINT = "api/v2.6/data/espresso/metaindex";
    /** Suffix for a pod-level ESPRESSO index file. */
    private static final String POD_LEVEL_IDX_FILE_SUFFIX = "";
    /** Suffix for a server-level ESPRESSO index file. */
    private static final String SERVER_LEVEL_IDX_FILE_SUFFIX = "-pods";
    /** Suffix for the output file containing the pod-level search results. */
    private static final String POD_LEVEL_RESULTS_SUFFIX = "-podlevel-searchresults.json";
    /** Suffix for the output file containing the server-level search results */
    private static final String SERVER_LEVEL_RESULTS_SUFFIX = "-serverlevel-searchresults.json";
    /** Suffix for the output file containing the network-level search results  */
    private static final String NETWORK_LEVEL_RESULTS_SUFFIX = "-networklevel-searchresults.json";
    /** Output folder for the files containing the results of an exhaustive search */
    private static final String EXHAUSTIVE_SEARCH_RESULTS_FOLDER = "exhaustive_search_results/";
    /** Root folder for the search results output files. */
    private static final String SEARCH_RESULTS_PATH = "searchresults/";
    /** Folder for the network-level search results output files. */
    private static final String NETWORK_SEARCH_RESULTS_PATH = "networksearchresults/";
    /** Folder for the server-level search results output files. */
    private static final String SERVER_SEARCH_RESULTS_PATH = "serversearchresults/";
    /** Folder for the pod-level search results output files. */
    private static final String POD_SEARCH_RESULTS_PATH = "podsearchresults/";
    //private static final String SERVER_SEARCH_RESULTS_FILE_SUFFIX = "-serverlevel-searchresults.json";
    /** The two possible Dataswyft domains, which are not interoperable */
    private static final String[] HAT_DOMAINS = new String[]{".hubofallthings.net/", ".hubat.net/"};
    /** Folder where the index files are saved after indexing TODO is this still in use? */
    private static final String TEST_SINK_PATH = "Dataswyfttestsink/";
    private static final String TEST_OUTPUT_METAINDEX_PATH = "metaindex/";

    /** Username of the search party, passed in as arg */
    private static String searchPartyUsername = "";
    /** The search party's password, passed in as arg */
    private static String searchPartyPassword = "";
    /** The search party's URL, constructed from username and domain */
    private static String searchPartyUrl = "";
    /** The authenticated search party's access token */
    private static String searchPartyAccessToken = "";
    /** The search party's UUID */
    private static String searchPartyUserId = "";
    /** Domain of the search party's HAT */
    private static String searchPartyDomain = "";

    /** All the server-level ESPRESSO HATs */
    private static ArrayList<String> allEspressoServers = null;
    /** Credentials of all the server-level ESPRESSOs NOTE: the main logged-in ESPRESSO
     * should have access to all the files in the server-level ESPRESSOs, but that is not
     * implemented yet, so this is the workaround. */
    private static HashMap<String, String> espressoServerCreds = null;
    /** All the HATs registered with ESPRESSO */
    private static ArrayList<String> allRegisteredHATs = null;

    /**
     * Saves the access token to the network-level ESPRESSO HAT for the current session.
     * @param strAccessToken - a String containing the access token to the network-level ESPRESSO HAT
     *                       for the current session.
     */
    public static void setEspressoAccessToken(String strAccessToken) {
            espressoAccessToken = strAccessToken;
    }

    /**
     * Gets the access token to the network-level ESPRESSO HAT for the current session.
     * @return espressoAccessToken - a String containing the access token to the network-level ESPRESSO HAT
     *                               for the current session.
     */
    public static String getEspressoAccessToken() {
        return espressoAccessToken;
    }

    /**
     * Saves the UUID of the network-level ESPRESSO HAT.
     * @param strUserId, the UUID of the network-level ESPRESSO HAT.
     */
    public static void setEspressoUserId(String strUserId) {
        espressoUserId = strUserId;
    }

    /**
     * Gets the UUID of the network-level ESPRESSO HAT.
     * @return espressoUserId, the UUID of the network-level ESPRESSO HAT.
     */
    public static String getEspressoUserId() {
        return espressoUserId;
    }

    /**
     * Saves the username of the logged-in search party.
     * @param strSearchPartyUsername, a String containing the username of the search party.
     */
    public static void setSearchPartyUsername(String strSearchPartyUsername) {
        searchPartyUsername = strSearchPartyUsername;
    }

    /**
     * Gets the username of the search party.
     * @return searchPartyUsername, a String containing the username of the search party.
     */
    public static String getSearchPartyUsername() {
        return searchPartyUsername;
    }

    /**
     * Saves the password of the logged-in search party.
     * @param strSearchPartyPassword, a String containing the password of the search party.
     */
    public static void setSearchPartyPassword(String strSearchPartyPassword) {
        searchPartyPassword = strSearchPartyPassword;
    }

    /**
     * Gets the password of the search party.
     * @return searchPartyPassword, a String containing the password of the search party.
     */
    public static String getSearchPartyPassword() {
        return searchPartyPassword;
    }

    /**
     * Saves the URL of the search party's HAT.
     * @param strSearchPartyUrl, a String containing the URL of the search party's HAT.
     */
    public static void setSearchPartyUrl(String strSearchPartyUrl) {
        searchPartyUrl = strSearchPartyUrl;
    }

    /**
     * Gets the URL of the search party's HAT.
     * @return searchPartyUrl, a String containing the URL of the search party's HAT.
     */
    public static String getSearchPartyUrl() {
        return searchPartyUrl;
    }

    /**
     * Saves the access token of the logged-in search party for the current session.
     * @param strSearchPartyAccessToken, a String containing the access token of the logged-in
     *                                   search party for the current session.
     */
    public static void setSearchPartyAccessToken(String strSearchPartyAccessToken) {
        searchPartyAccessToken = strSearchPartyAccessToken;
    }

    /**
     * Gets the access token of the logged-in search party for the current session.
     * @return searchPartyAccessToken, a String containing the access token of the logged-in
     * search party for the current session.
     */
    public static String getSearchPartyAccessToken() {
        return searchPartyAccessToken;
    }

    /**
     * Saves the UUID of the logged-in search party.
     * @param strSearchPartyUserId, a String containing the UUID of the logged-in search party.
     */
    public static void setSearchPartyUserId(String strSearchPartyUserId) {
        searchPartyUserId = strSearchPartyUserId;
    }

    /**
     * Gets the UUID of the logged-in search party.
     * @return searchPartyUserId, a String containing the UUID of the logged-in search party.
     */
    public static String getSearchPartyUserId() {
        return searchPartyUserId;
    }

    /**
     * Saves the domain of the search party's HAT.
     * @param strSearchPartyDomain, a String containing the domain of the search party's HAT.
     */
    public static void setSearchPartyDomain(String strSearchPartyDomain) {
        searchPartyDomain = strSearchPartyDomain;
    }

    /**
     * Gets the domain of the search party's HAT.
     * @return searchPartyDomain, a String containing the domain of the search party's HAT.
     */
    public static String getSearchPartyDomain() {
        return searchPartyDomain;
    }

    /**
     * Saves a list of all the server-level ESPRESSO HATs.
     * @param listEspressoServers, an ArrayList of Strings representing the list of all server-level ESPRESSO
     *                             HATs.
     */
    public static void setAllEspressoServers(ArrayList<String> listEspressoServers) {
        allEspressoServers = listEspressoServers;
    }

    /**
     * Gets the list of server-level ESPRESSO HATs.
     * @return allEspressoServers, an ArrayList of Strings representing the list of all server-level
     * ESPRESSO HATs.
     */
    public static ArrayList<String> getAllEspressoServers() {
        return allEspressoServers;
    }

    /**
     * Saves the login credentials for all the server-level ESPRESSO HATs for the current session.
     * @param serverCreds, a HashMap of Strings representing the server-level ESPRESSO HATs mapped to
     *                     their login credentials for the current session.
     *
     *                     Note that this is a workaround; in real life, the network-level ESPRESSO
     *                     HAT should have access to the index files in the server-level ESPRESSO HATs.
     *                     Since we haven't yet been able to grant file permissions to users other than
     *                     the HAT owner, we authenticate the server-level HATs and get them to
     *                     look up the index files as themselves. It would probably have been more efficient
     *                     to make the server-level index files public for the purpose of this exercise,
     *                     but ultimately we don't want them to be public, we just want the network-level
     *                     ESPRESSO HAT to have access to them.
     */
    public static void setEspressoServerCreds(HashMap<String, String> serverCreds) {
        espressoServerCreds = serverCreds;
    }

    /**
     * Gets the login credentials for all the server-level ESPRESSO HATs for the current session.
     * @return espressoServerCreds, a HashMap of Strings representing the server-level ESPRESSO HATs mapped to
     * their login credentials for the current session.
     *
     * Note that this is a workaround; in real life,
     * the ESPRESSO network-level HAT should have access to the index files in the ESPRESSO server-level
     * HATs.
     */
    public static HashMap<String, String> getEspressoServerCreds() {
        return espressoServerCreds;
    }

    /**
     * Sets the list of all HATs registered with the server-level ESPRESSO HATs.
     * @param listRegisteredHATs, an ArrayList of Strings representing the list of all HATs registered
     *                            with the server-level ESPRESSO HATs.
     */
    public static void setAllRegisteredHATs(ArrayList<String> listRegisteredHATs) {
        allRegisteredHATs = listRegisteredHATs;
    }

    /**
     * Gets the list of all HATs registered with the server-level ESPRESSO HATs.
     * @return allRegisteredHATs, an ArrayList of Strings representing the list of all HATs registered
     * with the server-level ESPRESSO HATs.
     */
    public static ArrayList<String> getAllRegisteredHATs() {
        return allRegisteredHATs;
    }

    public static void main(String[] args) throws Exception {
        // The minimum number of arguments that should have been received as input.
        int minArgs = 5;
        // Validate the number of arguments.
        if (args.length < minArgs) {
            System.err.println("Usage: java com.mycompany.searcher.Searcher <query> [k] <username> <domain> <password>");
            System.exit(1);
        }

        // for performance measurement
        long startTime = System.currentTimeMillis();

        // first argument is the query string
        String queryStr = args[0].toLowerCase();
        // default model
        String model = "LM";
        // default top-k
        int topK = 10;
        // default initial retrieve
        int initialRetrieve = 50; // Reduce to 5K for performance
        // default layer
        String layer = "document";

        // validate the top-K
        if (args.length >= 2) {
            try {
                topK = Integer.parseInt(args[1]);
                if (topK <= 0) {
                    System.err.println("The value of k must be a positive integer.");
                    System.exit(1);
                }
            } catch (NumberFormatException e) {
                System.err.println("Invalid value for k. It must be an integer.");
                System.exit(1);
            }
        }

        // third argument is the search party user name, as in blorf.hubofallthings.net
        if (args.length >= 3) {
            if(!args[2].isEmpty()) {
                setSearchPartyUsername(args[2].toString().toLowerCase());
            }
        }

        // fourth argument is the domain of the search party's HAT,
        // which must match one of the entries in a finite list
        if (args.length >= 4) {
            for (int i=0; i< HAT_DOMAINS.length; i++) {
                String strInputDomain = args[3].toString().toLowerCase();
                if (HAT_DOMAINS[i].contains(strInputDomain))
                {
                    setSearchPartyDomain(HAT_DOMAINS[i]);
                    // rebuild the search party's HAT URL from the username and domain
                    setSearchPartyUrl("https://".concat(getSearchPartyUsername().concat(getSearchPartyDomain())));
                    break;
                }
            }
            if (getSearchPartyDomain().isEmpty()) {
                // use a default domain if there somehow isn't a value here by now
                setSearchPartyDomain(HAT_DOMAINS[0]);
            }
        }

        // fifth argument is the search party's password
        if(args.length >= 5) {
            if (args[4].toString().isEmpty()) {
                System.err.println("You must enter a password.");
                System.exit(1);
            }

            setSearchPartyPassword(args[4].toString());
        }

        // authenticate the search party
        String strSearchPartyCreds = authenticateSearchParty();
        // get the search party's access token and userId
        extractSearchPartyAccessDetails(strSearchPartyCreds);
        // if we didn't get anything back, quit
        // TODO we need better validation than just string length
        if (strSearchPartyCreds.isEmpty()) {
            System.err.println("Invalid search party credentials.");
            System.exit(1);
        }

        // the UUID will be the basis for the filenames we search for
        String strUUID = getSearchPartyUserId();

        // log in to ESPRESSO (i.e. the ESPRESSO network-level HAT), as ESPRESSO
        String strCreds = logIntoEspresso();
        // get the ESPRESSO access token out of there
        // NOTE: this should give access to all ESPRESSO-related files in all HATs,
        // but that is not implemented yet
        extractEspressoAccessDetails(strCreds);
        // TODO we need better validation than just string length
        if (!strCreds.isEmpty()) {
            // get a list of all ESPRESSO servers
            listAllEspressoServers();
            // map all the ESPRESSO server credentials so we don't have to login repeatedly
            // NOTE: this is a workaround; ESPRESSO should have access to the server-level indexes
            // so it shouldn't be necessary to authenticate the server-level ESPRESSO HATs as themselves
            mapEspressoServerCreds();

            // Search each registered pod, one at a time, for a UUID-specific index
            exhaustiveSearch(strUUID, queryStr, initialRetrieve, model, layer, topK);
            // Search each registered pod, one at a time, for a public index
            // TODO search each pod in one hit
            exhaustiveSearch("public", queryStr, initialRetrieve, model, layer, topK);

            // Selectively search network level, then server level, and then pod level
            searchByLevels(strUUID, queryStr, initialRetrieve, model, layer, topK);
            // search for public results too
            // TODO search each pod in one hit
            searchByLevels("public", queryStr, initialRetrieve, model, layer, topK);
        }
        // for performance measurement
        long estimatedTime = System.currentTimeMillis() - startTime;
        System.out.println("Time elapsed: " + estimatedTime + " milliseconds");
    }

    /**
     * Searches each pod, one at a time.
     * @param strUUID a String representing the UUID of the logged-in search party.
     * @param queryStr a String containing the search query
     * @param initialRetrieve an int representing the initial retrieve
     * @param model a String representing the model to use
     * @param layer a String representing the search layer
     * @param topK an int representing the top-k
     */
    private static void exhaustiveSearch(String strUUID, String queryStr, int initialRetrieve, String model, String layer, int topK) {
        // input validation goes here
        if (strUUID.isEmpty()) {
            return;
        }

        // InputStream for querying the index files
        InputStream instr = null;

        // Get the list of all registered HATs to be searched
        ArrayList<String> podsToSearch = getAllRegisteredHATs();
        if (podsToSearch == null || podsToSearch.isEmpty()) {
            // if the list is empty, initialize it
            listAllRegisteredHATs();
            podsToSearch = getAllRegisteredHATs();
            // if the list is still empty, there's nothing to search
            if (podsToSearch == null || podsToSearch.isEmpty()) {
                System.err.println("Failed to find any registered HATs.");
                System.exit(1);
            }
        }

        String podLevelUUIDSpecificResultsPath = SEARCH_RESULTS_PATH.concat(EXHAUSTIVE_SEARCH_RESULTS_FOLDER).concat(strUUID).concat("/");
        String podname = "";
        // Full path to UUID-specific pod-level results output
        String podLevelSearchResultsPath = "";
        String UUIDSpecificPodLevelResults = "";

        for (int i = 0; i < podsToSearch.size(); i++) {
            // get the index file for this UUID from each pod in turn
            instr = fetchZipIndexFile(podsToSearch.get(i), strUUID, POD_LEVEL_IDX_FILE_SUFFIX, getSearchPartyAccessToken());
            if (instr != null) {
                // DEV output the search results to the local file structure
                // results of a direct pod search get their owm folder
                if (podsToSearch.get(i).startsWith("http")) {
                    int pos = podsToSearch.get(i).indexOf("://");
                    if (pos != -1) {
                        podname = podsToSearch.get(i).substring(pos + 3);
                        podLevelSearchResultsPath = podLevelUUIDSpecificResultsPath.concat(podname);
                        if (!podLevelSearchResultsPath.endsWith("/")) {
                            podLevelSearchResultsPath = podLevelSearchResultsPath.concat("/");
                        }

                        // Full path of UUID-specific pod-level search results file
                        UUIDSpecificPodLevelResults = podLevelSearchResultsPath.concat(strUUID.concat(POD_LEVEL_RESULTS_SUFFIX));
                        List<String> foundFiles = conductSearch(instr, queryStr, initialRetrieve, model, layer, topK, strUUID, UUIDSpecificPodLevelResults);
                        // Output links to search results listed in a text file
                        // which is what the results would look like to the search party.
                        // All the other output is for dev purposes.
                        String simpleResultsFile = "";
                        if (foundFiles != null && !foundFiles.isEmpty()) {
                            File podresdir = new File(podLevelUUIDSpecificResultsPath);
                            if (!podresdir.exists()) {
                                podresdir.mkdirs();
                            }
                            try (BufferedWriter writer = new BufferedWriter(new FileWriter(simpleResultsFile, true))) {
                                // output the file URLs to a separate text file
                                // this is what the search party will see
                                simpleResultsFile = podLevelUUIDSpecificResultsPath.concat("results.txt");

                                for (String file : foundFiles) {
                                    // URL format in a HAT's file API: https://blorf.hubofallthings.net/api/v2.6/files/
                                    String fileToGet = (podsToSearch.get(i)).concat(DATASWYFT_FILE_PATH).concat(file);

                                    writer.write(fileToGet);
                                    writer.newLine();
                                }

                                // close the simple results file
                                writer.close();
                            } catch (IOException ex) {
                                ex.printStackTrace();
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Carries out selective search first at network level, then server level, then pod level.
     * @param strUUID a String representing the UUID of the logged-in search party
     * @param queryStr a String containing the search query
     * @param initialRetrieve int representing the initial retrieve
     * @param model a String representing the model to use
     * @param layer a String representing the layer to search
     * @param topK an int representing the top-k
     * @param podsToSearch an ArrayList of Strings representing the pods to search.
     */
    private static void selectivePodSearch(String strUUID, String queryStr, int initialRetrieve, String model, String layer, int topK, ArrayList<String> podsToSearch) {
        // input validation goes here
        if (strUUID.isEmpty()) {
            return;
        }

        InputStream instr = null;

        if (podsToSearch == null || podsToSearch.isEmpty()) {
            // if the list is empty, there's nothing to search
            return;
        }

        String podLevelUUIDSpecificResultsPath = SEARCH_RESULTS_PATH.concat(POD_SEARCH_RESULTS_PATH).concat(strUUID).concat("/");
        String podname = "";
        // Full path to UUID-specific pod-level results output
        String podLevelSearchResultsPath = "";
        String UUIDSpecificPodLevelResultsFile = "";

        for (int i = 0; i < podsToSearch.size(); i++) {
            instr = fetchZipIndexFile(podsToSearch.get(i), strUUID, POD_LEVEL_IDX_FILE_SUFFIX, getSearchPartyAccessToken());
            if (instr != null) {
                // DEV output the search results to the local file structure
                // results of a direct pod search get their owm folder
                if (podsToSearch.get(i).startsWith("http")) {
                    int pos = podsToSearch.get(i).indexOf("://");
                    if (pos != -1) {
                        podname = podsToSearch.get(i).substring(pos + 3);
                        pos = podname.indexOf("/");
                        podname = podname.substring(0, pos);

                        // if the output folders don't exist, create them.
                        File podresdir = new File(podLevelUUIDSpecificResultsPath);
                        if (!podresdir.exists()) {
                            podresdir.mkdirs();
                        }
                        // Full path of UUID-specific pod-level search results file
                        UUIDSpecificPodLevelResultsFile = podLevelUUIDSpecificResultsPath.concat(strUUID.concat(POD_LEVEL_RESULTS_SUFFIX));
                        List<String> foundFiles = conductSearch(instr, queryStr, initialRetrieve, model, layer, topK, strUUID, UUIDSpecificPodLevelResultsFile);
                        // Output links to search results listed in a text file
                        // which is what the results would look like to the search party
                        String simpleResultsFile = podLevelUUIDSpecificResultsPath.concat("results.txt");
                        try (BufferedWriter writer = new BufferedWriter(new FileWriter(simpleResultsFile, true))) {
                            if(foundFiles != null && !foundFiles.isEmpty()) {
                                for (String file : foundFiles) {
                                    // URL format in a HAT's file API: https://blorf.hubofallthings.net/api/v2.6/files/
                                    String fileToGet = (podsToSearch.get(i)).concat(DATASWYFT_FILE_PATH).concat(file);

                                    writer.write(fileToGet);
                                    writer.newLine();
                                }
                            }
                            // close the simple results file
                            writer.close();
                        } catch (IOException ex) {
                            ex.printStackTrace();
                        }
                    }
                }
            }
        }
    }

    /**
     * Lists all the ESPRESSO server-level HATs registered at network level.
     */
    private static void listAllEspressoServers() {
        // construct the metaindex endpoint of the network-level ESPRESSO HAT
        String strEndpoint = ESPRESSO_URL.concat(ESPRESSO_METAINDEX_ENDPOINT);
        // list to hold all the ESPRESSO servers
        ArrayList<String> theServers = null;

        // the URL for the endpoint
        URL url = null;

        try {
            url = new URL(strEndpoint);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }

        // connect to the ESPRESSO network-level HAT
        HttpURLConnection con = null;

        try {
            con = (HttpURLConnection) url.openConnection();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        try {
            con.setRequestMethod("GET");
        } catch (ProtocolException e) {
            throw new RuntimeException(e);
        }

        // Use the network-level ESPRESSO's credentials
        String strAuthToken = getEspressoAccessToken();

        con.setRequestProperty("Content-Type", "application/json");
        con.setRequestProperty("x-auth-token", strAuthToken);

        int responseCode = 0;
        try {
            responseCode = con.getResponseCode();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Response Code: " + responseCode);

        // I'm not OK, you're not OK
        if(responseCode != 200) {
            return;
        }

        String strResp = returnResponseAsString(con);

        // if there was no response, return null
        if (strResp.isEmpty()) {
            return;
        }

        // if there was a response, find and save the URLs of all the server-level ESPRESSO HATs
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(strResp);
            theServers = (ArrayList<String>) node.findValuesAsText("url");

            if(theServers == null || theServers.isEmpty()) {
                System.err.println("Failed to find any server-level ESPRESSO HATs.");
            }
            setAllEspressoServers(theServers);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * A workaround for the fact that ESPRESSO doesn't currently have access to everything
     * in the server-level ESPRESSO HATs, the way it should. Until that is implemented,
     * get their credentials and store them for the duration of the session.
     */
    private static void mapEspressoServerCreds() {
        String strUrl = "";

        // list of ESPRESSO servers
        ArrayList<String> theServers = getAllEspressoServers();
        // map of ESPRESSO servers and their credentials
        HashMap<String, String> serversAndCreds = new HashMap<String, String>();

        // go round all the ESPRESSO servers
        for(int i=0; i<theServers.size(); i++) {
            // get all the ESPRESSO server-level HATs registered at network level
            URL url = null;

            strUrl = theServers.get(i);
            // extract the username so we can use it to log in
            String strUsername = getUsernameFromURL(strUrl);

            if (!strUrl.endsWith("/")) {
                strUrl = strUrl.concat("/");
            }

            // log into the ESPRESSO server
            String strAuthResponse = logIntoEspressoServer(strUrl, strUsername);
            if (strAuthResponse.isEmpty()) {
                continue;
            }
            // save the ESPRESSO server creds, as we'll need them again
            serversAndCreds.put(strUrl, strAuthResponse);
        }

        // save the server credentials to use again
        setEspressoServerCreds(serversAndCreds);
    }

    /**
     * Lists all the HATs registered with the server-level ESPRESSO HATs.
     */
    private static void listAllRegisteredHATs() {
        String strUrl = "";
        // list of registered HATs
        ArrayList<String> theHATs = new ArrayList<String>();
        // list of ESPRESSO servers
        ArrayList<String> theServers = getAllEspressoServers();

        // map of ESPRESSO servers and their credentials
        HashMap<String, String> serversAndCreds = getEspressoServerCreds();

        // go round all the ESPRESSO servers (note: IRL the network-level ESPRESSO HAT
        // should have access to the index files with its own credentials)
        for (Map.Entry<String, String> entry : serversAndCreds.entrySet()) {
            // get all the ESPRESSO server-level HATs registered at network level
            URL url = null;

            strUrl = entry.getKey();
            String strCreds = entry.getValue();

            if (!strUrl.endsWith("/")) {
                strUrl = strUrl.concat("/");
            }

            // get the auth token for this ESPRESSO server
            String strAuthToken = extractAuthToken(strCreds);
            if (strAuthToken.isEmpty()) {
                return;
            }

            // now get the endpoint for the ESPRESSO metaindex
            String strEndpoint = strUrl.concat(ESPRESSO_METAINDEX_ENDPOINT);

            try {
                url = new URL(strEndpoint);
            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            }

            HttpURLConnection con = null;

            try {
                con = (HttpURLConnection) url.openConnection();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            try {
                con.setRequestMethod("GET");
            } catch (ProtocolException e) {
                throw new RuntimeException(e);
            }

            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("x-auth-token", strAuthToken);

            int responseCode = 0;
            try {
                responseCode = con.getResponseCode();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            System.out.println("Response Code: " + responseCode);

            // I'm not OK, you're not OK
            if(responseCode != 200) {
                return;
            }

            // get the response
            String strResp = returnResponseAsString(con);
            if (strResp.isEmpty()) {
                return;
            }

            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode node = mapper.readTree(strResp);
                // get all the HATs registered on tis server
                ArrayList<String> theseHATs = (ArrayList<String>) node.findValuesAsText("url");
                if(theseHATs == null || theseHATs.isEmpty()) {
                    System.err.println("Failed to find any ESPRESSO HATs on this server.");
                }
                // add the HATs on this server to the list
                theHATs.addAll(theseHATs);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }

        // save the list of registered HATs
        setAllRegisteredHATs(theHATs);
    }

    /**
     * Fetches an index .zip file from a HAT.
     * @param strHatUrl a String representing the URL of the HAT containing the index file.
     * @param strUUID a String representing the UUID relating to a UUID-specific index.
     * @param strLevelSuffix a String representing the suffix of the index file that indicates whether it's a
     *                       network-level, server-level, or pod-level index.
     * @param strAuth a String containing the auth token needed to access this index file
     * @return InputStream the Input Stream from the index file.
     */
    private static InputStream fetchZipIndexFile(String strHatUrl, String strUUID, String strLevelSuffix, String strAuth) {
        if (strHatUrl.isEmpty()) {
            System.err.println("No HAT URL provided.");
            System.exit(1);
        }

        if (!strHatUrl.endsWith("/")) {
            strHatUrl = strHatUrl.concat("/");
        }

        // We must search by fileId, which we don't control. The File API strips the hyphens out so we have to do the same
        // in order to find our target file
        String cleansedUserId = strUUID.replaceAll("-","");
        String strFileIdName = ESPRESSO_IDX_FILE_PREFIX.concat(cleansedUserId);
        String cleansedLevelSuffix = strLevelSuffix.replaceAll("-","");
        if (strHatUrl.endsWith(DATASWYFT_FILE_PATH)) {
            strHatUrl = strHatUrl.concat("content/");
        }
        if (!strHatUrl.endsWith(DATASWYFT_FILE_CONTENT_PATH)) {
            strHatUrl = strHatUrl.concat(DATASWYFT_FILE_CONTENT_PATH);
        }
        String strSearchUrl = strHatUrl.concat(strFileIdName).concat(cleansedLevelSuffix).concat(ESPRESSO_IDX_FILE_TYPE);

        // URL of the index file
        URL url = null;

        try {
            url = new URL(strSearchUrl);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }

        HttpURLConnection con = null;

        try {
            con = (HttpURLConnection) url.openConnection();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        try {
            con.setRequestMethod("GET");
        } catch (ProtocolException e) {
            throw new RuntimeException(e);
        }

        String strAuthToken = strAuth;

        con.setRequestProperty("Content-Type", "application/json");
        con.setRequestProperty("x-auth-token", strAuthToken);

        int responseCode = 0;
        try {
            responseCode = con.getResponseCode();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Response Code: " + responseCode);

        // I'm not OK, you're not OK
        if(responseCode != 200) {
            return null;
        }

        // if we found the file, return it to read as a zip stream
        try {
            return con.getInputStream();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Extracts the access details for the ESPRESSO pod from the authentication response.
     * @param strAuthResponse, String containing the response from the authentication API call.
     *
     *  Note there is no reason there should be separate functions for ESPRESSO and the search party,
     *                         other than readability.
     */
    private static void extractEspressoAccessDetails(String strAuthResponse) {
        String strAuth = "";
        String strUserId = "";

        if (strAuthResponse.isEmpty()) {
            return;
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(strAuthResponse);
            strAuth = node.get("accessToken").asText();
            if(strAuth == null || strAuth.isEmpty()) {
                System.err.println("Failed to get an access token from ESPRESSO.");
                System.exit(1);
            }
            setEspressoAccessToken(strAuth);
            strUserId = node.get("userId").asText();
            if(strUserId == null || strUserId.isEmpty()) {
                System.err.println("Failed to get a user ID from ESPRESSO.");
                System.exit(1);
            }
            setEspressoUserId(strUserId);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Extracts the access details for the search party from the authentication response.
     * @param strAuthResponse, String containing the response from the authentication API call.
     *
     *  Note there is no reason there should be separate functions for ESPRESSO and the search party,
     *                         other than readability.
     */
    private static void extractSearchPartyAccessDetails(String strAuthResponse) {
        String strAuth = "";
        String strUserId = "";

        if (strAuthResponse.isEmpty()) {
            return;
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(strAuthResponse);
            strAuth = node.get("accessToken").asText();
            if(strAuth == null || strAuth.isEmpty()) {
                System.err.println("User authentication failed.");
                System.exit(1);
            }
            setSearchPartyAccessToken(strAuth);
            strUserId = node.get("userId").asText();
            if(strUserId == null || strUserId.isEmpty()) {
                System.err.println("Failed to get a user ID from ESPRESSO.");
                System.exit(1);
            }
            setSearchPartyUserId(strUserId);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Extracts the auth token from a response string.
     * @param strAuthResponse, a String containing the response from an authentication API call.
     * @return a String containing the auth token, if any, or an empty string if none.
     */
    private static String extractAuthToken(String strAuthResponse) {
        String strAuth = "";

        if (strAuthResponse.isEmpty()) {
            return strAuth;
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(strAuthResponse);
            strAuth = node.get("accessToken").asText();
            if(strAuth == null || strAuth.isEmpty()) {
                System.err.println("User authentication failed.");
                System.exit(1);
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        return strAuth;
    }

    /**
     * Extracts the UUID from a response string.
     * @param strAuthResponse, a String containing the response from an authentication API call.
     * @return a String containing the UUID, if any, or an empty string if none.
     */
    private static String extractUserId(String strAuthResponse) {
        String strUserId = "";

        if (strAuthResponse.isEmpty()) {
            return strUserId;
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(strAuthResponse);
            strUserId = node.get("userId").asText();
            if(strUserId == null || strUserId.isEmpty()) {
                System.err.println("Could not extract userId.");
                System.exit(1);
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return strUserId;
    }

    /**
     * Logs into the network-level ESPRESSO HAT.
     * @return a String representing the response from the authentication API call.
     *
     * Note that there is no reason there has to be a separate function for logging into
     * the ESPRESSO HAT, apart from readability.
     *
     * In real life we will get two sets of credentials: ESPRESSO's, and the logged-in search party's.
     */
    private static String logIntoEspresso() {
        String strRet = "";

        URL url = null;
        try {
            url = new URL(ESPRESSO_URL.concat(AUTHTOKEN_PATH));
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
        HttpURLConnection con = null;
        try {
            con = (HttpURLConnection) url.openConnection();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        try {
            con.setRequestMethod("GET");
        } catch (ProtocolException e) {
            throw new RuntimeException(e);
        }

        con.setRequestProperty("Accept", "application/json");
        con.setRequestProperty("username", ESPRESSO_USERNAME);
        con.setRequestProperty("password", ESPRESSO_PASSWORD);

        int responseCode = 0;
        try {
            responseCode = con.getResponseCode();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Response Code: " + responseCode);

        strRet = returnResponseAsString(con);
        return strRet;
    }

    /**
     * Logs into a server-level ESPRESSO HAT. IRL the network-level ESPRESSO should have access
     * so this shouldn't be necessary.
     * @param strUrl a String representing the URL of the server-level ESPRESSO HAT
     * @param strUsername a String representing the username of the server-level ESPRESSO HAT
     * @return a String containing the response to the authentication API call
     */
    private static String logIntoEspressoServer(String strUrl, String strUsername) {
        String strRet = "";

        if (strUrl.isEmpty()) {
            return strRet;
        }

        URL url = null;
        try {
            url = new URL(strUrl.concat(AUTHTOKEN_PATH));
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
        HttpURLConnection con = null;
        try {
            con = (HttpURLConnection) url.openConnection();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        try {
            con.setRequestMethod("GET");
        } catch (ProtocolException e) {
            throw new RuntimeException(e);
        }

        con.setRequestProperty("Accept", "application/json");
        con.setRequestProperty("username", strUsername);
        con.setRequestProperty("password", ESPRESSO_PASSWORD);

        int responseCode = 0;
        try {
            responseCode = con.getResponseCode();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Response Code: " + responseCode);

        strRet = returnResponseAsString(con);
        return strRet;
    }

    /**
     * Extracts a username from a HAT URL.
     * @param strUrl the HAT URL from which to extract the username.
     * @return a String representing the username of the given HAT URL.
     */
    private static String getUsernameFromURL(String strUrl) {
        String strUsername = "";

        if (strUrl.isEmpty()) return strUsername;

        if (strUrl.startsWith("http")) {
            int pos = strUrl.indexOf("://");
            if (pos != -1) {
                strUsername = strUrl.substring(pos + 3);
                pos = strUsername.indexOf(".");
                if (pos != -1) {
                    strUsername = strUsername.substring(0, pos);
                }
            }
        }

        return strUsername;
    }

    /**
     * Returns a HTTP response as a String.
     * @param con the HttpURLConnection
     * @return the response as a String.
     */
    private static String returnResponseAsString(HttpURLConnection con) {
        if (con == null) {
            System.err.println("No connection from which to return response as string.");
            return null;
        }

        BufferedReader in = null;
        try {
            in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        String inputLine;
        StringBuilder response = new StringBuilder();

        while (true) {
            try {
                if (!((inputLine = in.readLine()) != null)) break;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            response.append(inputLine);
        }
        try {
            in.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String strRet = response.toString();
        System.out.println("Response: " + strRet);
        return strRet;
    }

    /**
     * Authenticates the search party.
     * @return a String representing the auth credentials returned from the API call.
     */
    private static String authenticateSearchParty() {
        String strRet = "";

        URL url = null;
        try {
            url = new URL("https://".concat(getSearchPartyUsername()).concat(getSearchPartyDomain()).concat(AUTHTOKEN_PATH));
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
        HttpURLConnection con = null;
        try {
            con = (HttpURLConnection) url.openConnection();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        try {
            con.setRequestMethod("GET");
        } catch (ProtocolException e) {
            throw new RuntimeException(e);
        }

        con.setRequestProperty("Accept", "application/json");
        con.setRequestProperty("username", getSearchPartyUsername());
        con.setRequestProperty("password", getSearchPartyPassword());

        int responseCode = 0;
        try {
            responseCode = con.getResponseCode();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Response Code: " + responseCode);

        BufferedReader in = null;
        try {
            in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        String inputLine;
        StringBuilder response = new StringBuilder();

        while (true) {
            try {
                if (!((inputLine = in.readLine()) != null)) break;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            response.append(inputLine);
        }
        try {
            in.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        strRet = response.toString();
        System.out.println("Response: " + strRet);
        return strRet;
    }


    /**
     * Selectively searches for a query string: first at network level, then at server level,
     * then at pod level.
     *
     * @param strUUID a String representing the UUID of the search party.
     * @param queryStr a String containing the search query.
     * @param initialRetrieve an int representing the initial retrieve.
     * @param model a String representing the model to use.
     * @param layer a String representing the layer to search.
     * @param topK an int representing the top-K.
     */
    private static void searchByLevels(String strUUID, String queryStr, int initialRetrieve, String model, String layer, int topK) {
        // Index folder for network index
        // not used
        //String networkZipIndexFilePath = TEST_SINK_PATH.concat(TEST_OUTPUT_METAINDEX_PATH);
        // Path to UUID-specific network-level index
        // not used
        //String UUIDSpecificNetworkIndexPath = networkZipIndexFilePath.concat(strUUID).concat("/");

        // Full name of UUID-specific network index file
        String networkZipIndexFileName = strUUID.concat(NETWORK_LEVEL_IDX_FILE_SUFFIX);

        // hyphens will be stripped from the fileId
        networkZipIndexFileName = networkZipIndexFileName.replaceAll("-", "");
        // Full path to UUID-specific network index file
        // not used
        //String fullPathToUUIDSpecificNetworkIndex = UUIDSpecificNetworkIndexPath.concat(networkZipIndexFileName);

        // Output path for network-level search results
        String networkLevelSearchResultsPath = SEARCH_RESULTS_PATH.concat(NETWORK_SEARCH_RESULTS_PATH);
        // Create the output path if it doesn't already exist
        File netresdir = new File(networkLevelSearchResultsPath);
        if (!netresdir.exists()) {
            netresdir.mkdirs();
        }
        // Path to UUID-specific network level results output
        String UUIDSpecificNetworkLevelResultsPath = networkLevelSearchResultsPath.concat(strUUID).concat("/");

        // do a network-level search
        if (strUUID.isEmpty()) {
            return;
        }

        InputStream instr = null;

        // get the network-level index file for this UUID
        instr = fetchZipIndexFile(ESPRESSO_URL, strUUID, NETWORK_LEVEL_IDX_FILE_SUFFIX, getEspressoAccessToken());
        if (instr != null) {
            // DEV output the search results to the local file structure
            String UUIDSpecificNetworkLevelResultsFile = UUIDSpecificNetworkLevelResultsPath.concat(strUUID).concat(NETWORK_LEVEL_RESULTS_SUFFIX);

            // search the network-level index file to get the relevant servers
            List<String> foundServers = conductSearch(instr, queryStr, initialRetrieve, model, layer, topK, strUUID, UUIDSpecificNetworkLevelResultsFile);

            // look only in the servers where we know there are results
            ArrayList<String> podsToSearch = new ArrayList<String>();
            if ((foundServers != null) && (foundServers.size() > 0)) {
                // do a server-level search
                int numServers = foundServers.size();
                for (int i = 0; i < numServers; i++) {
                    String serverLevelUUIDSpecificResultsPath = SEARCH_RESULTS_PATH.concat(SERVER_SEARCH_RESULTS_PATH).concat(strUUID).concat("/");
                    String servername = "";
                    // Full path to UUID-specific server-level results output
                    String serverLevelSearchResultsPath = "";
                    String UUIDSpecificServerLevelResults = "";

                    String nextServer = foundServers.get(i);
                    String servCreds = getEspressoServerCreds().get(nextServer);
                    String servAuth = extractAuthToken(servCreds);

                    // the server-level index
                    instr = fetchZipIndexFile(nextServer, strUUID, SERVER_LEVEL_IDX_FILE_SUFFIX, servAuth);
                    if (instr != null) {
                        // DEV output the search results to the local file structure
                        if (foundServers.get(i).startsWith("http")) {
                            int pos = foundServers.get(i).indexOf("://");
                            if (pos != -1) {
                                servername = foundServers.get(i).substring(pos + 3);
                                serverLevelSearchResultsPath = serverLevelUUIDSpecificResultsPath.concat(servername);
                                // if the output folders don't exist, create them.
                                File servresdir = new File(serverLevelSearchResultsPath);
                                if (!servresdir.exists()) {
                                    servresdir.mkdirs();
                                }
                                // Full path of UUID-specific server-level search results file
                                UUIDSpecificServerLevelResults = serverLevelSearchResultsPath.concat(strUUID.concat(SERVER_LEVEL_RESULTS_SUFFIX));
                                // List of pods containing search results
                                List<String> foundPods = conductSearch(instr, queryStr, initialRetrieve, model, layer, topK, strUUID, UUIDSpecificServerLevelResults);
                                if ((foundPods != null) && (foundPods.size() > 0)) {
                                    podsToSearch.addAll(foundPods);
                                }
                            }
                        }
                    }
                }
                // selectively search the relevant pods
                selectivePodSearch(strUUID, queryStr, initialRetrieve, model, layer, topK, podsToSearch);
            }
        }
    }

    /**
     * Actually do the search.
     * @param zipStream InputStream from the index file from which to create the zip stream
     * @param queryStr String containing the search query.
     * @param initialRetrieve an int representing the initial retrieve.
     * @param model a String representing the search model to use.
     * @param layer String representing the search layer.
     * @param topK int representing the top-k
     * @param strUUID UUID of the search party
     * @param resultsPath Path to search results output file
     * @return A List of Strings representing the locations (servers, pods, files) where results were found
     */
    private static List<String> conductSearch(InputStream zipStream, String queryStr, int initialRetrieve, String model, String layer, int topK, String strUUID, String resultsPath) {
        if(zipStream == null) return null;

        RAMDirectory ramDirectory = new RAMDirectory();

        // query the zip index file
        try (ZipInputStream zis = new ZipInputStream(zipStream)) {
            ZipEntry entry;

            while (true) {
                if ((entry = zis.getNextEntry()) == null) break;

                String entryName = entry.getName();
                if (entryName.contains("segments") || entryName.endsWith(".index") || entryName.endsWith(".doc") ||
                        entryName.endsWith(".cfe") || entryName.endsWith(".si") || entryName.endsWith(".cfs") || entryName.endsWith("write.lock")) {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[65536];
                    int len;
                    while ((len = zis.read(buffer)) != -1) {
                        baos.write(buffer, 0, len);
                    }
                    try (IndexOutput output = ramDirectory.createOutput(entryName, IOContext.DEFAULT)) {
                        output.writeBytes(baos.toByteArray(), baos.size());
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        IndexReader reader = null;
        try {
            reader = DirectoryReader.open(ramDirectory);
        } catch(IOException e) {
            e.printStackTrace();
        }

        IndexSearcher searcher = new IndexSearcher(reader);
        QueryParser parser = new QueryParser("content", new StandardAnalyzer());
        Query query = null;
        try {
            query = parser.parse(queryStr);
        } catch(ParseException e) {
            e.printStackTrace();
        }
        TopDocs results = null;
        try {
            results = searcher.search(query, initialRetrieve);
        } catch(IOException e) {
            e.printStackTrace();
        }

        if (backgroundModel == null && "LM".equals(model)) {
            try {
                backgroundModel = computeBackgroundModel(reader);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        // Calculate the average document length for the entire index
        List<Map<String, Object>> documents = new ArrayList<>();

        // Precompute query terms once
        String[] queryTerms = queryStr.split("\\s+");

        // list the locations where results are found
        List<String> scopeIds = new ArrayList<String>();

        for (ScoreDoc scoreDoc : results.scoreDocs) {
            int docID = scoreDoc.doc;
            Document doc = null;
            try {
                doc = searcher.doc(docID);
            } catch (IOException e) {
                e.printStackTrace();
            }
            String content = doc.get("content");

            Map<String, Object> docData = new HashMap<>();
            docData.put("Id", doc.get("Id"));
            // add the current Id to the list of places to look
            scopeIds.add(doc.get("Id"));
            if( ("document".equals(layer)))
                docData.put("content", doc.get("content"));
            docData.put("BM25Score", scoreDoc.score);
            // Compute LM score directly without storing term frequencies
            if ("LM".equals(model))
                docData.put("LanguageModelingScore", (content != null) ? computeLMScore(content, queryTerms) : Double.NEGATIVE_INFINITY);

            // Compute document length and add to the result
            int docLength = (content != null) ? content.split("\\s+").length : 0;
            if( ("document".equals(layer)))
                docData.put("DocLength", docLength);

            if (("document".equals(layer)))
            {
                // Add TermFrequencies for each query term
                Map<String, Integer> termFrequencies = new HashMap<>();
                if (content != null) {
                    String[] words = content.toLowerCase().split("\\s+");
                    for (String term : queryTerms) {
                        int termCount = 0;
                        for (String word : words) {
                            if (word.equals(term.toLowerCase())) {
                                termCount++;
                            }
                        }
                        termFrequencies.put(term, termCount);
                    }
                }
                docData.put("TermFrequencies", termFrequencies);

            }
            documents.add(docData);
        }

        // Sort only if needed
        if (model.equals("LM")) {
            documents.sort((d1, d2) -> Double.compare(
                    (double) d2.get("LanguageModelingScore"),
                    (double) d1.get("LanguageModelingScore")
            ));
        }

        // Create final JSON response with top K results
        // don't return any results if the keyword isn't found
        if (results.totalHits.value <= 0) {
            closeOpenSearchStreams(reader, ramDirectory);
            return null;
        }

        Map<String, Object> jsonResponse = new HashMap<>();
        jsonResponse.put("totalHits", results.totalHits.value);
        jsonResponse.put("documents", documents.subList(0, Math.min(topK, documents.size())));
        //jsonResponse.put("avgDocLength", avgDocLength); // Include the average document length

        try {
            String resultsFolder = resultsPath.lastIndexOf("/") != -1 ? resultsPath.substring(0, resultsPath.lastIndexOf("/")) : resultsPath;
            File resdir = new File(resultsFolder);
            if (!resdir.exists()) {
                resdir.mkdirs();
            }
            // DEV write the whole content of the search result to the local file system
            // TODO not sure this is outputting the way we expect at server level
            new ObjectMapper().writeValue(new File(resultsPath), jsonResponse);
        } catch (IOException e) {
            e.printStackTrace();
        }

        closeOpenSearchStreams(reader, ramDirectory);
        // return list of places to look
        return scopeIds;
    }

    /**
     * Closes the streams we opened to do the search
     * @param reader The IndexReader we opened earlier
     * @param ramDirectory The RAMDirectory we opened earlier
     */
    private static void closeOpenSearchStreams(IndexReader reader, RAMDirectory ramDirectory) {
        if (reader != null) {
            try {
                reader.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        if (ramDirectory != null) {
            ramDirectory.close();
        }
    }

    /**
     * Computes the LM score.
     * @param content a String with the content of the document
     * @param queryTerms the query terms as a String array
     * @return the LM score as a double
     */
    private static double computeLMScore(String content, String[] queryTerms) {
        double lmScore = 0.0;
        double lambda_d = 0.2;
        String[] words = content.toLowerCase().split("\\s+");
        int docLength = words.length;

        // Directly compute term frequencies on the fly
        Map<String, Integer> termFrequencies = new HashMap<>();
        for (String word : words) {
            termFrequencies.merge(word, 1, Integer::sum);
        }

        for (String term : queryTerms) {
            int tf_d = termFrequencies.getOrDefault(term, 0);
            double alpha_c = backgroundModel.getOrDefault(term, 1e-10);
            double p_lm = (1 - lambda_d) * ((double) tf_d / docLength) + lambda_d * alpha_c;
            if (p_lm > 0) {
                lmScore += Math.log(p_lm);
            }
        }
        return lmScore;
    }


    /**
     * Computes the background model.
     * @param reader the IndexReader to compute.
     * @return the background model in Map format
     * @throws IOException
     */
    private static Map<String, Double> computeBackgroundModel(IndexReader reader) throws IOException {
        Map<String, Integer> documentFrequencies = new HashMap<>();
        int sumDf = 0;

        // Iterate over all terms in the index once
        TermsEnum termsEnum;
        for (LeafReaderContext leaf : reader.getContext().leaves()) {
            Terms terms = leaf.reader().terms("content");
            if (terms != null) {
                termsEnum = terms.iterator();
                BytesRef term;
                while ((term = termsEnum.next()) != null) {
                    String termText = term.utf8ToString();
                    int df = termsEnum.docFreq(); // Get document frequency once
                    documentFrequencies.put(termText, df);
                    sumDf += df;
                }
            }
        }

        // Normalize probabilities
        Map<String, Double> backgroundModel = new HashMap<>();
        for (Map.Entry<String, Integer> entry : documentFrequencies.entrySet()) {
            backgroundModel.put(entry.getKey(), (double) entry.getValue() / sumDf);
        }
        return backgroundModel;
    }

}
