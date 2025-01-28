const express = require('express');
const axios = require('axios');
const fs = require("fs");
const https = require("https");
const cors = require('cors');
const pLimit = require('p-limit');
const yargs = require('yargs');
const path = require("path");
const unzipper = require('unzipper');
const AdmZip = require('adm-zip');
const stream = require('stream');


const OverlayQueryExecutor = require('./OverlayQueryExecutor');
const {retrieveRelevantData,mergeAndRerank,retrieveRelevantData_Overlay}= require('./lucenemodule');
const {fetchBloomFilterStream,filterQuery, areAllKeywordsAbsent} = require('./bloomfiltersmodule');




const app = express();
const port = 8080;

const certificate = fs.readFileSync('./ca.pem');
const httpsAgent = new https.Agent({ ca: certificate, rejectUnauthorized: false });
const axiosInstance = axios.create({ httpsAgent });

app.use(cors());


async function fetchFile(url) {
    try {
        const response = await axiosInstance.get(url);
        return response.data.split("\r\n").filter(line => line.length > 0);
    } catch (error) {
        console.log(`Error fetching file from ${url}: ${error.message}`);
        return null;
    }
}

async function queryOverlayMetadata(keyword, webid,topKServers) {
    const queryExecutor = new OverlayQueryExecutor();
    const overlayMetadataQuery = `SELECT srvurl FROM LTOVERLAYLUCENE WHERE webid='${webid}'`;

    const overlayResult = await new Promise((resolve, reject) => {
        queryExecutor.executeQuery(overlayMetadataQuery, (error, result) => {
            if (error) {
                console.error("Overlay query execution error:", error.message || error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });

    if (!overlayResult || overlayResult.length === 0) {
        console.warn(`No entry found for WebID '${webid}' in Overlay Network.`);
        return [];
    }

    const serverUrl = overlayResult[0]?.SRVURL;
    if (serverUrl && serverUrl !== 'null') {
        console.log("Successfully fetched metadata for the WebID from overlay network.");
        // const overlayIndexURL = `https://${serverUrl}/ESPRESSO/metaindex/${webid}-servers.zip`;

        try {
            const relevantServerIDs = await retrieveRelevantData_Overlay(keyword, webid, serverUrl, topKServers);

            return relevantServerIDs.flatMap((result) => result.documents.map((doc) => doc.Id));
        } catch (error) {

           if (error==="Error parsing JSON result: Unexpected end of JSON input")
            {
                console.warn(`WEBID Has Access to the Servers But no access to Files of the KWD!`);
                return [];
            }

            else
            {
                console.error(`Error retrieving data from overlay index ${serverUrl}:`, error);
                throw error;
            }
        }
    } else {
        console.warn(`Overlay metadata for WebID '${webid}' is invalid.`);
        throw new Error("Overlay network returned null or invalid server URL.");
    }
}

async function readAllServers() {
    const queryExecutor = new OverlayQueryExecutor();
    const fallbackQuery = `SELECT srvURL FROM LTOVERLAYSERVERS`;

    const fallbackResult = await new Promise((resolve, reject) => {
        queryExecutor.executeQuery(fallbackQuery, (error, result) => {
            if (error) {
                console.error("Fallback query execution error:", error.message || error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });

    if (fallbackResult && fallbackResult.length > 0) {
        console.log("Fetched all server URLs from the fallback query.");
        return fallbackResult.map((row) => row.SRVURL);
    } else {
        console.warn("Fallback query returned no results.");
        return [];
    }
}


async function checkIfPodIsRelevantWithBloom(keyword, bloomFilterStream) {
    try {
        // Execute the JAR file with the fetched Bloom filter stream
        const filteredQuery = await filterQuery(keyword, bloomFilterStream);

        // Determine if the server is relevant
        if (filteredQuery.trim()) {
            // console.log(`Relevant pod based on Bloom filter`);
            return true;
        } else {
            // console.log(`No relevant data in Bloom filter.`);
            return false;
        }
    } catch (error) {
        console.error(`Error processing Bloom filter stream: ${error.message || error}`);
        throw error;
    }
}


async function findRelevantPodsWithBloom(keyword, webid, serverURL) {
    console.log("Finding Pods Using Bloom!")
    const relevantPods = [];
    const processedPods = new Set();

    const podWebIDBloomZipUrl = `https://${serverURL}/ESPRESSO/metaindex/${webid}-bloom.zip`;

    try {
        const zipResponse = await axiosInstance.get(podWebIDBloomZipUrl, { responseType: 'arraybuffer' });
        const zipBuffer = zipResponse.data;

        // Verify if the buffer is a valid ZIP
        if (!zipBuffer || zipBuffer.byteLength === 0) {
            console.error("ZIP buffer is empty or invalid.");
            return relevantPods;
        }

        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();

        // Filter to get only relevant Bloom files
        const bloomEntries = zipEntries.filter(entry =>
            entry.entryName.endsWith('.bloom') && !entry.entryName.includes('__MACOSX')
        );

        // Process entries in batches
        const batchSize = 50;
        for (let i = 0; i < bloomEntries.length; i += batchSize) {
            const batch = bloomEntries.slice(i, i + batchSize);

            const batchPromises = batch.map(async (entry) => {
                const entryName = entry.entryName;

                // Extract the pod name
                const parts = entryName.split('-');
                const podNameParts = parts.slice(parts.length - 2);
                let podName = podNameParts.join('-').replace('.bloom', '');

                const bloomFilterData = entry.getData();

                // Convert buffer to a stream
                const bloomFilterStream = new stream.PassThrough();
                bloomFilterStream.end(bloomFilterData);

                // Check if Bloom filter is relevant
                const isRelevant = await checkIfPodIsRelevantWithBloom(keyword, bloomFilterStream);
                if (isRelevant) {
                    const podUrl = `https://${serverURL}/${podName}`;
                    if (!processedPods.has(podUrl)) {
                        relevantPods.push(podUrl);
                        processedPods.add(podUrl); // Mark this pod as processed
                    }
                }
            });

            // Wait for the current batch to complete
            await Promise.all(batchPromises);
        }
    } catch (error) {
        console.error(`Failed to process pod at ${serverURL}: ${error.message}`);
    }

    return relevantPods;
}




async function checkIfServersRelevantWithBloom(keyword, webid, baseUrl) {
    // Construct the Bloom filter file URL dynamically based on WebID
    const serverWebIDBloomUrl = `https://${baseUrl}/ESPRESSO/metaindex/${webid}-pods-ESPRESSO.bloom`;

    try {
        // Fetch the Bloom filter stream directly
        const bloomFilterStream = await fetchBloomFilterStream(serverWebIDBloomUrl);

        // Execute the JAR file with the fetched Bloom filter stream
        const filteredQuery = await filterQuery(keyword, bloomFilterStream);

        // Determine if the server is relevant
        if (filteredQuery.trim()) {
            // console.log(`Relevant server for WebID ${webid}: ${baseUrl}`);
            return baseUrl;
        } else {
            //console.log(`No relevant server for WebID ${webid} at ${baseUrl}.`);
            return null;
        }
    } catch (error) {

        // Handle the 404 error gracefully
        if (error.response && error.response.status === 404) {
            // console.warn(`Bloom filter not found for WebID ${webid} at ${baseUrl}: 404 Not Found`);
            return null;
        }

        console.error(`Error processing server at ${baseUrl}: ${error.message || error}`);
        throw error;
    }
}


async function findRelevantServersWithBloom(keyword, webid) {
    console.log("Finding Servers Using Bloom!")
    const allServers = await readAllServers();

    // console.log(allServers);

    const relevantServers = [];
    for (const serverUrl of allServers) {
        const relevantServer = await checkIfServersRelevantWithBloom(keyword, webid, serverUrl);
        if (relevantServer) {
            relevantServers.push(relevantServer);
        }
    }

    return relevantServers;
}



async function findServersWithLucene(keyword, webid, useOverlayMetadata,topKServers) {
    console.log("Finding Servers Using Lucene!")
    try {
        if (useOverlayMetadata) {
            return await queryOverlayMetadata(keyword, webid,topKServers);
        } else {
            console.log("Using fallback solution to read all servers.");
            return await readAllServers();
        }
    } catch (error) {
        console.warn("Error occurred; falling back to fallback solution.", error);
        return await readAllServers();
    }
}

async function findPodsWithLucene(webIdQuery, keyword, baseUrl,metaIndexName,useServerMetadata,topKPods) {
    console.log("Finding Pods Using Lucene!")
    // Determine the serverIndexUrl based on the `useServerMetadata` parameter
    const serverIndexUrl = useServerMetadata
        ? `https://${baseUrl}/ESPRESSO/metaindex/`
        : `https://${baseUrl}.soton.ac.uk:3000/ESPRESSO/metaindexer_test_wrong/`;

    /////// Check if the `server_index` container exists, otherwise fall back to read all pods ///////
    const serverIndexData = await fetchFile(serverIndexUrl);
    if (
        !serverIndexData ||
        (Array.isArray(serverIndexData) && serverIndexData.length === 1 &&
            typeof serverIndexData[0] === 'string' && !serverIndexData[0].includes('ldp:contains'))
    ) {
        console.log(`server_index not found at ${serverIndexUrl} , falling back to readAllSources...`);
        return await readAllPods(baseUrl,metaIndexName);
    }


    // Construct the URL dynamically based on the WebID
    const serverWebIDIndexUrl = `https://${baseUrl}/ESPRESSO/metaindex/${webIdQuery}-pods.zip`;

    try {
            // retrieve Relevant Pods
            const relevantPodsResults = await retrieveRelevantData(keyword, webIdQuery, serverWebIDIndexUrl,topKPods);

            // Extract the list of Pod IDs from the documents array
            const relevantPodIDs = relevantPodsResults.flatMap((result) => result.documents.map((doc) => doc.Id));
            const relevantPodURLs = relevantPodIDs.map((id) => `${baseUrl}/${id}`);

            // Return the list of Pod IDs
            return relevantPodURLs;

    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`Cannot find Index of ${serverWebIDIndexUrl}`);
            return [];
        }
        else if (error==="Error parsing JSON result: Unexpected end of JSON input")
        {
            console.warn(`WEBID Has Access to the Server But no access to Files of the KWD!`);
            return [];
        }
        else {
            console.error(`Error during search at ${baseUrl}: ${error.message || error}`);
            throw error;
        }
    }
}

async function readAllPods(baseUrl,metaIndexName) {

    try {
        const response = await axiosInstance.get(`https://${baseUrl}/ESPRESSO/${metaIndexName}`, { responseType: 'blob' });
        const csvStr = response.data.toString();
        let selectedPods = csvStr.split("\r\n").filter(i => i.length > 0);
        // Remove the pattern "/espressoindex/" from each item
        selectedPods = selectedPods.map(item => item.replace("/espressoindex/", ""));

        return selectedPods;
    } catch (error) {
        console.error(`Error fetching meta-index at https://${baseUrl}/ESPRESSO/${metaIndexName}. Returning empty results.`, error.message);
        return [];
    }
}



async function integrateResultsWithLucene(sources, webIdQuery, searchWord,topKPodDocs) {
    let integratedResult = [];

    // OLD_Process a batch of Solid Requests
    async function processBatch(batch) {
        const limit = pLimit(25);

        const requests = batch.map((source) =>
            limit(async () => {
                const normalizedSource = source.startsWith("https://")
                    ? source
                    : `https://${source}`;

                const webIDPodIndex = `${normalizedSource}/espressoindex/${webIdQuery}.zip`;

                try {
                    // Check if the file exists (status 200)
                    const headResponse = await axiosInstance.head(webIDPodIndex, {
                        validateStatus: (status) => status === 200 || status === 404 || status === 401,
                        timeout: 500000,
                    });

                    if (headResponse.status === 200) {
                        const PodIndexSearchResults = await retrieveRelevantData(searchWord, webIdQuery, webIDPodIndex, topKPodDocs);

                        // Add URL to the ID of each document
                        PodIndexSearchResults.forEach((result) => {
                            if (result.documents) {
                                result.documents = result.documents.map((doc) => ({
                                    ...doc,
                                    Id: `${normalizedSource}/${doc.Id}`,
                                }));
                            }
                        });

                        //console.log("Search Results:", JSON.stringify(PodIndexSearchResults, null, 2));
                        integratedResult.push(PodIndexSearchResults);
                    } else if (headResponse.status === 401) {
                        console.warn(`Unauthorized access (401) to Pod: ${normalizedSource}`);
                    } else {
                        //console.warn(`WebID ${webIdQuery} has no access to this Pod: ${source} !`);
                    }
                } catch (error) {
                    if (error== "Error parsing JSON result: Unexpected end of JSON input"){
                    // console.warn(`While processing results from Pod ${source}:`,": WEBID Has Access to the Pod But no access to Files of the KWD! ")
                } else if (error.response && error.response.status === 401) {
                        //console.error(`Caught 401 error for Pod ${normalizedSource}: Unauthorized. Check credentials or access permissions.`);
                        // Optional: Implement reauthentication or token refresh mechanism here
                    } else{
                    console.error(`Error processing results from Pod ${source}:`, error|| error.message);
                }
                }
            })
        );

        await Promise.all(requests);
    }

    // Process in batches of XX pods
    const batchSize=2000;
    for (let i = 0; i < sources.length; i += batchSize) {
        const batch = sources.slice(i, i + batchSize);
        await processBatch(batch);
    }

    return integratedResult;
}


async function handleResultsRanking(allIntegratedResults, enableRanking) {
    if (enableRanking) {
        console.log("Ranking is enabled. Merging and re-ranking results...");
        const finalRankedResults = mergeAndRerank(allIntegratedResults);
        return finalRankedResults;
    } else {
        console.log("Ranking is disabled. Returning raw results.");
        const flattenedResults = allIntegratedResults.flatMap(resultSet =>
            resultSet.flatMap(result =>
                result.documents.map(doc => ({
                    Score: doc.Score,
                    Id: doc.Id
                }))
            )
        );
        return flattenedResults;
    }
}

// Custom logger to log to both console and file
function logMessage(message) {
    const now = new Date();
    const timestamp = now.toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    // Log to console
    console.log(logMessage);

    // Append to the log file
    const logFilePath = path.join(__dirname, "runtimes.log");
    fs.appendFileSync(logFilePath, logMessage + "\n");
}

const timers = {};


function startTimer(label) {
    timers[label] = process.hrtime();
    //logMessage(`Started timer: ${label}`);
}

function endTimer(label) {
    if (timers[label]) {
        const elapsed = process.hrtime(timers[label]);
        const elapsedMs = (elapsed[0] * 1e3 + elapsed[1] / 1e6).toFixed(2);
        const message = `Timer Ended: ${label} | Elapsed Time: ${elapsedMs}ms`;
        logMessage(message);
        delete timers[label];
    } else {
        logMessage(`Timer not found: ${label}`);
    }
}


app.get("/query", async (req, res) => {
    const argv = yargs
        .option("metaIndexName", {
            alias: "m",
            type: "string",
            description: "Name of the meta index file",
            demandOption: true,
        })
        .option("overlayMetadata", {
            alias: "o",
            type: "boolean",
            description: "Enable or disable overlay metadata",
            default: false,
        })
        .option("serverLevelMetadata", {
            alias: "s",
            type: "boolean",
            description: "Enable or disable server-level metadata",
            default: false,
        })
        .option("resultsRanked", {
            alias: "r",
            type: "boolean",
            description: "Enable or disable results ranking",
            default: false,
        })
        .option("topKPodDocs", {
            alias: "k",
            type: "string",
            description: "Number of top results to retrieve from each pod",
            default: "",
        })
        .option("topKPods", {
            alias: "p",
            type: "string",
            description: "Number of top pods at each server",
            default: "",
        })
        .option("topKServers", {
            alias: "n",
            type: "string",
            description: "Number of top servers at each server",
            default: "",
        })
        .option("useBloomForServers", {
            alias: "b",
            type: "boolean",
            description: "Use Bloom filter for finding relevant servers",
            default: false,
        })
        .option("useBloomForPods", {
            alias: "c",
            type: "boolean",
            description: "Use Bloom filter for finding relevant pods",
            default: false,
        })
        .help()
        .argv;

    startTimer("TotalTime");

    const metaIndexName = argv.metaIndexName;
    const overlayMetadata = argv.overlayMetadata;
    const serverLevelMetadata = argv.serverLevelMetadata;
    const resultsRanked = argv.resultsRanked;
    const topKPodDocs = argv.topKPodDocs;
    const topKPods = argv.topKPods;
    const topKServers = argv.topKServers;
    const useBloomForServers=argv.useBloomForServers;
    const useBloomForPods=argv.useBloomForPods;

    const { keyword } = req.query;
    const [searchWord, webId] = keyword.includes(",") ? keyword.split(",") : [keyword, null];

    if (!searchWord || searchWord.trim() === "") {
        res.status(400).send("Invalid keyword");
        return;
    }

    logMessage(`Search Word: "${searchWord}"`);
    logMessage(`WebID: "${webId}"`);

    try {
        startTimer("FindRelevantServers");
        let relevantServers;

        if(useBloomForServers){
            relevantServers = await findRelevantServersWithBloom(searchWord,webId);
        } else {
            relevantServers = await findServersWithLucene(searchWord, webId, overlayMetadata,topKServers);
        }

        logMessage("Relevant Servers: " + JSON.stringify(relevantServers));
        endTimer("FindRelevantServers");

        const maxConcurrency = relevantServers.length > 0 ? Math.min(relevantServers.length, 25) : 1;
        const serverLimit = pLimit(maxConcurrency);
        const batchSize = 5;

        let allIntegratedResults = [];

        const sortedServers = relevantServers.sort((a, b) => {
            const numA = parseInt(a.match(/srv(\d+)/)[1], 10);
            const numB = parseInt(b.match(/srv(\d+)/)[1], 10);
            return numA - numB;
        });

        for (let i = 0; i < sortedServers.length; i += batchSize) {
            const batch = sortedServers.slice(i, i + batchSize);

            await Promise.all(
                batch.map((server) =>
                    serverLimit(async () => {
                        try {
                            startTimer(`FindRelevantPods@__${server}`);
                            const relevantPods = useBloomForPods
                                ? await findRelevantPodsWithBloom(searchWord, webId, server)
                                : await findPodsWithLucene(
                                    webId,
                                    searchWord,
                                    server,
                                    metaIndexName,
                                    serverLevelMetadata,
                                    topKPods
                                );
                            logMessage(`No. SELECTED PODS from ${server}: ${relevantPods.length}`);
                            endTimer(`FindRelevantPods@__${server}`);

                            if (relevantPods.length > 0) {
                                startTimer(`CombineResults@__${server}`);
                                const integratedResult = await integrateResultsWithLucene(relevantPods, webId, searchWord,topKPodDocs);
                                logMessage(`RowsFetched@__${server}: ${integratedResult.length}`);
                                allIntegratedResults.push(...integratedResult);
                                endTimer(`CombineResults@__${server}`);
                            }
                        } catch (error) {
                            logMessage(`Error processing server ${server}: ${error.message || error}`);
                        }
                    })
                )
            );
        }

        startTimer("RankingResults@ALL");
        const finalResult = await handleResultsRanking(allIntegratedResults, resultsRanked);
        logMessage(`RowsFetched@ALL: ${allIntegratedResults.length}`);
        endTimer("RankingResults@ALL");

        res.json(finalResult);

        endTimer("TotalTime");
    } catch (error) {
        logMessage(`Error during the overall process: ${error.message || error}`);
        res.status(500).send("An error occurred during processing.");
    }
});


app.listen(port, () => {
    console.log(`app (NEW) listening on port ${port}`);

});


