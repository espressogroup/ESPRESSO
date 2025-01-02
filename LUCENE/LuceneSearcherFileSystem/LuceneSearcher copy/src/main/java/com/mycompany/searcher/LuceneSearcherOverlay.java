package com.mycompany.searcher;

import org.apache.lucene.store.*;
import org.apache.lucene.index.*;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.search.*;
import org.apache.lucene.document.Document;
import org.apache.lucene.queryparser.classic.QueryParser;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.Comparator;


public class LuceneSearcherOverlay {
    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            System.err.println("Usage: java com.mycompany.searcher.LuceneSearcherOverlay <query> [k] <zipPath>");
            System.exit(1);
        }
        String queryStr = args[0];
        int topK = Integer.MAX_VALUE; // Default to all results
        if (args.length >= 2 && args[1] != null && !args[1].trim().isEmpty()) {
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
        String zipPath = args[2];

        // Step 1: Unzip to a temporary directory
        Path tempDir = Files.createTempDirectory("luceneIndexTemp");
        try {
            unzip(zipPath, tempDir);

            // Step 2: Validate the extracted directory
            if (!Files.exists(tempDir) || !Files.isDirectory(tempDir)) {
                System.err.println("Invalid extracted directory: The directory does not exist or is not accessible.");
                System.exit(1);
            }

            // Step 3: Open FSDirectory on the extracted directory
            try (FSDirectory fsDirectory = FSDirectory.open(tempDir);
                 IndexReader reader = DirectoryReader.open(fsDirectory)) {

                IndexSearcher searcher = new IndexSearcher(reader);
                QueryParser parser = new QueryParser("content", new StandardAnalyzer());
                Query query = parser.parse(queryStr);
                TopDocs results = searcher.search(query, topK);

                // Prepare the final list of documents with hits
                List<Map<String, Object>> filteredResults = new ArrayList<>();
                if (results.totalHits.value > 0) {
                    Map<String, Object> jsonResponse = new HashMap<>();
                    jsonResponse.put("totalHits", results.totalHits.value);

                    List<Map<String, String>> documents = new ArrayList<>();
                    for (ScoreDoc scoreDoc : results.scoreDocs) {
                        Document doc = searcher.doc(scoreDoc.doc);
                        Map<String, String> docData = new HashMap<>();
                        docData.put("Id", doc.get("Id"));
                        docData.put("Score", Float.toString(scoreDoc.score));
                        documents.add(docData);
                    }
                    jsonResponse.put("documents", documents);
                    filteredResults.add(jsonResponse);
                }

                if (!filteredResults.isEmpty()) {
                    System.out.println(new ObjectMapper().writeValueAsString(filteredResults));
                }
            } catch (IOException e) {
                System.err.println("Error reading the Lucene index: " + e.getMessage());
            }
        } finally {
            // Step 4: Clean up temporary directory
            deleteDirectory(tempDir);
        }
    }

    // Method to unzip a file to a target directory
    private static void unzip(String zipFilePath, Path targetDir) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFilePath))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                Path filePath = targetDir.resolve(entry.getName());
                if (entry.isDirectory()) {
                    Files.createDirectories(filePath);
                } else {
                    Files.createDirectories(filePath.getParent());
                    try (OutputStream os = Files.newOutputStream(filePath)) {
                        byte[] buffer = new byte[4096];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            os.write(buffer, 0, len);
                        }
                    }
                }
                zis.closeEntry();
            }
        }
    }

    // Method to delete a directory recursively
    private static void deleteDirectory(Path path) throws IOException {
        if (Files.exists(path)) {
            Files.walk(path)
                 .sorted(Comparator.reverseOrder())
                 .forEach(p -> {
                     try {
                         Files.delete(p);
                     } catch (IOException e) {
                         System.err.println("Failed to delete " + p + ": " + e.getMessage());
                     }
                 });
        }
    }
}
