package index.index;
//package index.Index;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;

import java.io.*;
import java.nio.file.*;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.*;

public class Index {
    
    
   
    public  String extractServerNumber(String input) {
        Pattern pattern = Pattern.compile("srv(\\d{5})");
        Matcher matcher = pattern.matcher(input);

        if (matcher.find()) {
            return matcher.group(1); // Return the captured number
        }
        return null; // Return null if no match is found
    }

    public static void main(String[] args) {
        
        if (args.length != 3) {
            System.out.println("Usage: java Index <dictionaryJsonFilePath> <sourceDir> <outputDir>");
            System.exit(1);
        }

        try {
            // Parse command-line arguments
            String dictionaryJsonFilePath = args[0];
            String sourceDir = args[1];
            String outputDir = args[2];

         // Read the dictionary JSON from the file
            ObjectMapper objectMapper = new ObjectMapper();
            File dictionaryFile = new File(dictionaryJsonFilePath);

            // Use TypeReference to ensure proper deserialization of the nested structure
            Map<String, Map<String, Map<String, List<String>>>> dictionary = objectMapper.readValue(
                dictionaryFile,
                new TypeReference<Map<String, Map<String, Map<String, List<String>>>>>() {}
            );

            // Perform indexing with parallelization
            Index indexer = new Index();
            indexer.indexData(dictionary, sourceDir, outputDir);
            System.out.println("Indexing completed successfully!");

        } catch (IOException e) {
            e.printStackTrace();
        }
        
    }

    private String sanitizePath(String input) {
        return input.replaceAll("[^a-zA-Z0-9-_\\.]", "_");
    }

    public void indexData(Map<String, Map<String, Map<String, List<String>>>> dictionary,
                          String sourceDir, String outputDir) throws IOException {

        ExecutorService executor = Executors.newFixedThreadPool(10); // Pool size of 4 (adjust based on system)

        try {
            for (String webId : dictionary.keySet()) {
                Map<String, Map<String, List<String>>> servers = dictionary.get(webId);

                // Create directories
                Path webIdRoot = Paths.get(outputDir, webId);
                Files.createDirectories(webIdRoot);
                Path fileLevelDir = Paths.get(webIdRoot.toString(), "file-level");
                Path podLevelDir = Paths.get(webIdRoot.toString(), "pod-level");
                Path serverLevelDir = Paths.get(webIdRoot.toString(), "server-level");
                Files.createDirectories(fileLevelDir);
                Files.createDirectories(podLevelDir);
                Files.createDirectories(serverLevelDir);

                // Submit file-level indexing tasks
                for (String server : servers.keySet()) {
                    Path fileLevelServerDir = Paths.get(fileLevelDir.toString(), sanitizePath(server));
                    Files.createDirectories(fileLevelServerDir);

                    Map<String, List<String>> pods = servers.get(server);
                    for (String pod : pods.keySet()) {
                        executor.submit(() -> {
                            try {
                                Path fileLevelServerPodDir = Paths.get(fileLevelServerDir.toString(), sanitizePath(pod));
                                Files.createDirectories(fileLevelServerPodDir);
                                Path fileLevelPodDir = Paths.get(fileLevelServerPodDir.toString(), sanitizePath(webId) + ".zip");
                               
                                
                                Path tempPodDir = Files.createTempDirectory("tempPodIndex");
                                try {
                                    List<String> files = getFilesForWebIdAndPod(dictionary, webId, server, pod);
                                    indexFileLevel(webId, server, pod, files, sourceDir, tempPodDir);
                                    zipDirectory(tempPodDir, fileLevelPodDir);
                                } finally {
                                    deleteDirectory(tempPodDir);
                                }
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        });
                    }
                }

                // Submit pod-level indexing tasks
                for (String server : servers.keySet()) {
                    executor.submit(() -> {
                        try {
                            
                            Path PodLevelServerDir = Paths.get(podLevelDir.toString(), sanitizePath(server));
                            Files.createDirectories(PodLevelServerDir);
                            
                            Path podLevelServerZip = Paths.get(PodLevelServerDir.toString(), sanitizePath(webId) + "-pods.zip");
                            Path tempPodIndexDir = Files.createTempDirectory("tempPodIndex");
                            try {
                                indexPodLevel(webId, server, servers.get(server), sourceDir, tempPodIndexDir);
                                zipDirectory(tempPodIndexDir, podLevelServerZip);
                            } finally {
                                deleteDirectory(tempPodIndexDir);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });
                }

                // Submit server-level indexing tasks
                    executor.submit(() -> {
                        try {
                            
                            Path ServerLevelServerDir = Paths.get(serverLevelDir.toString(), sanitizePath(selectRandomServer(servers.keySet())));
                            Files.createDirectories(ServerLevelServerDir);
                            
                            Path serverLevelIndexDir = Paths.get(ServerLevelServerDir.toString(),  sanitizePath(webId) + "-servers.zip");
                            Path tempServerDir = Files.createTempDirectory("tempServerIndex");
                            try {
                                indexServerLevel(webId, servers, sourceDir, tempServerDir);
                                zipDirectory(tempServerDir, serverLevelIndexDir);
                            } finally {
                                deleteDirectory(tempServerDir);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });
            }

            // Shutdown the executor service after all tasks are submitted
            executor.shutdown();
            if (!executor.awaitTermination(60, TimeUnit.MINUTES)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            e.printStackTrace();
        }
    }

    /**
     * Pseudocode to describe how a single user's HAT files would be indexed.
     * @author Helen Oliver.
     * <p>
     * Indexing at the level of an individual, real-world user is a job for the MetadataManager,
     * which is future work.
     * <p>
     * Currently, we are doing the indexing at the level of the entire experiment,
     * which does not reflect real-world usage of an ESPRESSO indexing app. We add
     * some explanation here as a guide to future implementation.
     * <p>
     * For the Solid experimental setup, indexing is done automatically by the Solid
     * setup scripts for 9500 x 50 pods.
     * <p>
     * For the Dataswyft experimental setup, everything is done
     * manually with a handful of indexed user HATs, one main ESPRESSO HAT representing
     * both ESPRESSO search and ESPRESSO indexing, a couple of server-level ESPRESSO HATs,
     * and some ESPRESSO agent HATs with varying combinations of access permissions
     * to the files in the user HATs.
     */
    private void exampleIndexCurrentDataswyftUser() {
        // Assumption: current user is logged in with username, password, HAT domain
        // passed in as args. For more detailed implementation, see DataswyftSearcher.

        // Assumption: ESPRESSO is authenticated (production: espressohubofallthing.hubofallthings.net,
        // test: espressohubofallthfjs.hubat.net). (See DataswyftSearcher.)

        // Because this is the user's own HAT they can POST a search to get a list of all their files,
        // so use their credentials to complete this step.
        // https://docs.dataswyft.com/build/dataswyft-one-apis/file-api#file-lookup-search

        // The main thing to look for in the JSON search results is the fileId.
        // You need the exact fileId to GET the corresponding file.
        // The problem is that, when you upload a file,
        // you can't be certain exactly what fileId will be assigned to it.
        //
        // For example, if you have a file "public.zip" and you give it a source of "espresso_metaindex",
        // you *might* get a fileId of espresso_metaindexpublic.zip, but you might also
        // get a fileid of espresso_metaindexpublic-3.zip.
        // You *might* be able to get a clean fileId by always deleting the previous file
        // before uploading the new one, but then again you might not.

        // So on the one hand, we need to know the exact fileId in order to GET
        // the corresponding file; and on the other hand, we can't know it because it's unpredictable.
        // If we're indexing someone's HAT we can use their credentials to get a list of all
        // their files, and find out the fileIds that way.
        //
        // But if we're querying someone's HAT index on behalf of a search party,
        // we can't find out the right fileId by getting a list of all their files,
        // because that is done using a POST, and only the HAT owner can do that.
        //
        // This will have to be worked around, otherwise ESPRESSO won't be able to reliably
        // find index files.
        //
        // One possible workaround is to log the fileId and name every
        // uploaded and deleted index file in the ESPRESSO namespace, which ESPRESSO has read-write access to.
        // We can then GET that log to find the exact fileId of the most recently uploaded
        // version of every index file, by comparing it to the filename we're looking for.

        // The first step, in indexing, is to find the existing index files. Having used
        // the current user's credentials to get a list of all their files, we now have to
        // look for the .zip files with a fileId that starts with "espresso_metaindex".
        // These are the files we're going to have to delete and replace with the new
        // index files once they're ready.

        // The second step is to find the fileIds + names of all the files we're going to index,
        // i.e. all the non-index files that ESPRESSO has access to.
        // Remember we just got this list of files by POSTing a search with the current user's credentials,
        // ESPRESSO doesn't necessarily have permission to access all of them.
        // So we have to GET each file in turn using ESPRESSO's credentials, not the user's.
        // That way we won't ever retrieve any metadata or content that ESPRESSO doesn't have permission for.

        // We GET each file's metadata first, from the files/file path.
        // https://docs.dataswyft.com/build/dataswyft-one-apis/file-api#content-access
        // The metadata contains the file permissions, listing userIds that access to that file,
        // and also noting whether they have access to the metadata only (files/file), or the contents too (files/content).
        // https://docs.dataswyft.com/build/dataswyft-one-apis/file-api#access-management

        // Using the file metadata, we need to build up a dictionary as follows:

        // {$userId of permitted user} : {
        //    {$URL of ESPRESSO server this HAT is registered with}: {
        //      "{$URL of this HAT}/api/v2.6/files/": ["file/gemma.txt","content/gemma.txt"]
        //    }
        //  },

        // Above, the same file appears twice, once under file/ and once under content/.
        // The file/ is the path for the metadata. A userId by default doesn't have permission
        // to view the content, but if contentVisible = true then we have to index the content
        // for that user, treating it like a separate file with the same name.

        // Also note that the key to the list of permitted files is the URL of the ESPRESSO server
        // this HAT is registered with. This is a way of splitting searchable HATs into
        // smaller groups, rather than exhaustively searching each HAT.
        // To find this HAT's server, you do a GET on espresso/metaindex/server
        // https://docs.dataswyft.com/build/dataswyft-one-apis/data-api#data-retrieval
        // and if nothing's returned, use the main ESPRESSO HAT in its place
        // (which is where an ESPRESSO user's HAT would be registered if they
        // didn't register it with an intermediate-level HAT).

        // So to recap the dictionary structure:
        // {$userId} : {
        //    {$server}: {
        //      "{URL of the current user's HAT}/api/v2.6/files/": ["file/gemma.txt","content/gemma.txt"]
        //    }
        // }
        // By going through every file's metadata with a GET on files/file, you can build up
        // the above data structure.

        // There also needs to be a dictionary entry for publicly available files.
        // We call this userId "public". A file is publicly accessible if "contentPublic": true.
        // The public entry in the dictionary would look like this:
        //
        // "public" : {
        //    {$server}: {
        //      "{URL of the current user's HAT}/api/v2.6/files/": ["file/stormy2.txt","content/stormy2.txt"]
        //    }
        // }

        // Once you have this JSON structure, write it out to a file, and pass it in to the indexer
        // as a parameter. Run the indexer. You will then find the index files on your local file system,
        // in whichever output folder you passed in as a parameter. (By the time a production
        // version is implemented, this may have changed, but local storage is what we have so far.)

        // Before uploading the new file-level .zip files to the current user's HAT, the old ones
        // must be deleted.
        // Remember, because files are retrieved by exact fileId, and it's not 100% controllable or predictable
        // what fileId will be assigned, an index filename and fileId must be logged to the espresso namespace
        // every time one is uploaded or deleted.
        // TODO define the best data structure for accomplishing this.
        // You should have gotten the current user's complete list of files at the start
        // of the indexing process. See comments at the top of this code block.

        // After the old index files are deleted, you can then upload the file-level .zip files
        // to the current user's HAT, like so:

        // curl -X POST
        // -H "Accept: application/json"
        // -H "X-Auth-Token: {$accessToken}" \
        //-H "Content-Type: application/json" \
        //-d '{
        //"name": "{$filename}.zip",
        //"source": "espresso_metaindex",
        //"tags": [],
        //"title": "",
        //"description": ""
        //}' \
        //"https://{$username}.hubofallthings.net/api/v2.6/files/upload"
        //
        // and so on: https://docs.dataswyft.com/build/dataswyft-one-apis/file-api#file-upload
        //
        // Note that the source is "espresso_metaindex". This will reliably be prepended to the filename
        // to create the fileId, to identify the file as an ESPRESSO index file.
        //
        // Do the upload as the current user, so that you can then grant ESPRESSO, and also
        // the relevant ESPRESSO server, access to the .zip index files:
        // https://docs.dataswyft.com/build/dataswyft-one-apis/file-api#file-upload
        //
        // Also, don't forget to make the public.zip index file public.
        //
        // There are also server-level and network-level index files, which will be handled
        // in future work by the MetadataManager.
    }

    private void indexFileLevel(String webId, String server, String pod, List<String> fileList, String sourceDir,
                                Path outputDir) throws IOException {

        Files.createDirectories(outputDir);
        try (Directory directory = FSDirectory.open(outputDir);
             IndexWriter writer = new IndexWriter(directory, new IndexWriterConfig(new StandardAnalyzer()))) {

            for (String fileName : fileList) {
                Path filePath = Paths.get(sourceDir, fileName);
                Document doc = new Document();
                doc.add(new StringField("Id", fileName, Field.Store.YES));
                doc.add(new TextField("content", Files.readString(filePath), Field.Store.YES));
                writer.addDocument(doc);
            }
        }
    }

    private void indexPodLevel(String webId, String server, Map<String, List<String>> pods,
                               String sourceDir, Path outputDir) throws IOException {

        Files.createDirectories(outputDir);
        try (Directory directory = FSDirectory.open(outputDir);
             IndexWriter writer = new IndexWriter(directory, new IndexWriterConfig(new StandardAnalyzer()))) {

            for (String pod : pods.keySet()) {
                StringBuilder concatenatedContent = new StringBuilder();

                for (String fileName : pods.get(pod)) {
                    Path filePath = Paths.get(sourceDir, fileName);
                    concatenatedContent.append(Files.readString(filePath)).append("\n");
                }

                Document doc = new Document();
                doc.add(new StringField("Id", pod, Field.Store.YES));
                doc.add(new TextField("content", concatenatedContent.toString(), Field.Store.YES));
                writer.addDocument(doc);
            }
        }
    }

    private void indexServerLevel(String webId, Map<String, Map<String, List<String>>> servers,
                                  String sourceDir, Path outputDir) throws IOException {

        Files.createDirectories(outputDir);
        try (Directory directory = FSDirectory.open(outputDir);
             IndexWriter writer = new IndexWriter(directory, new IndexWriterConfig(new StandardAnalyzer()))) {

            for (String server : servers.keySet()) {
                StringBuilder concatenatedContent = new StringBuilder();

                Map<String, List<String>> pods = servers.get(server);
                for (String pod : pods.keySet()) {
                    for (String fileName : pods.get(pod)) {
                        Path filePath = Paths.get(sourceDir, fileName);
                        concatenatedContent.append(Files.readString(filePath)).append("\n");
                    }
                }

                Document doc = new Document();
                doc.add(new StringField("Id", server, Field.Store.YES));
                doc.add(new TextField("content", concatenatedContent.toString(), Field.Store.YES));
                writer.addDocument(doc);
            }
        }
    }

    private void zipDirectory(Path sourceDir, Path zipFilePath) throws IOException {
        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipFilePath))) {
            Files.walk(sourceDir)
                    .filter(path -> !Files.isDirectory(path))
                    .forEach(path -> {
                        ZipEntry zipEntry = new ZipEntry(sourceDir.relativize(path).toString());
                        try {
                            zos.putNextEntry(zipEntry);
                            Files.copy(path, zos);
                            zos.closeEntry();
                        } catch (IOException e) {
                            throw new RuntimeException("Error zipping directory", e);
                        }
                    });
        }
    }

    private void deleteDirectory(Path directory) throws IOException {
        Files.walk(directory)
                .sorted((path1, path2) -> path2.compareTo(path1)) // Reverse order to delete children first
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        throw new RuntimeException("Error deleting directory", e);
                    }
                });
    }
    public static String selectRandomServer(Set<String> servers) {
        // If the set is empty, return null or handle it as needed
        if (servers.isEmpty()) {
            return null;
        }

        // Convert Set to List to randomly access an index
        List<String> serverList = new ArrayList<>(servers);

        // Use Random to select a random index
        Random random = new Random();
        int randomIndex = random.nextInt(serverList.size());  // random index within the size of the list

        return serverList.get(randomIndex);  // Return the randomly selected server
    }

    private static List<String> getFilesForWebIdAndPod(
        Map<String, Map<String, Map<String, List<String>>>> dictionary,
        String webId,
        String serverUrl,
        String podUrl
    ) {
        return dictionary.getOrDefault(webId, Collections.emptyMap())
                         .getOrDefault(serverUrl, Collections.emptyMap())
                         .getOrDefault(podUrl, Collections.emptyList());
    }
}
