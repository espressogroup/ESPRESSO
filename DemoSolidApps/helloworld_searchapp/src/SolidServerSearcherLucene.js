const express = require('express');
const axios = require('axios');
const fs = require("fs");
const https = require("https");
const cors = require('cors');
const pLimit = require('p-limit');

const OverlayQueryExecutor = require('./OverlayQueryExecutor');

const {retrieveRelevantData,mergeAndRerank}= require('./lucenemodule');

const  Ranker= require('./Ranker');



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



async function findServersWithLucene(keyword, webid) {
    const queryExecutor = new OverlayQueryExecutor();

    const overlayMetadataQuery = `SELECT srvurl FROM LTOVERLAYLUCENE WHERE webid='${webid}'`;
    const fallbackQuery = `SELECT srvURL FROM LTOVERLAYSERVERS`;

    try {
        //Fetch relevant servers from the overlay network metadata
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

        //console.log("OVERLAY RESULT",overlayResult);

        // Case 1: If overlayResult is undefined or null, fall back
        if (overlayResult === undefined || overlayResult === null) {
            console.warn(`NoMetadata Found at Overlay network, Falling back to read All servers.`);
            throw new Error("Problem with Querying Overlay Metadata");
        }

        // Case 2: If no entry for the webid exists, return empty result
        if (overlayResult.length === 0) {
            console.warn(`No entry found for webid '${webid}' in Overlay Network, Returning empty result.`);
            return [];
        }

        // Case 3: Entry exists and server URL is not null
        const serverUrl = overlayResult[0]?.SRVURL;

        //console.log("SERVER URL", serverUrl)

        if (serverUrl && serverUrl !== 'null') {
            console.log("Successfully fetched Metadata for the WebID from overlay network");

            // Construct the overlay Index URL
            const overlayIndexURL = `https://${serverUrl}/ESPRESSO/metaindex/${webid}-servers.zip`;

           // console.log(">>>",overlayIndexURL);

            try {
                // Retrieve relevant data from the overlay index
                const searchResults = await retrieveRelevantData(keyword, webid, overlayIndexURL, "");
                // console.log("Results from Overlay net:::",searchResults);
            } catch (error) {
                console.error(`Error retrieving data from overlay of index ${overlayIndexURL}:`, error);
            }

            // Extract and return the list of Server IDs from the documents array
            return searchResults.documents.map((doc) => doc.Id);
        } else {
            console.warn(`No Overlay Metadata found for WebID: '${webid}'.`);
            throw new Error("Overlay network returned null server URL");
        }
    } catch (error) {

        try {
            // Query the fallback table for all server URLs
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
                console.log("fetching all server list from the overlay network.");
                return fallbackResult.map((row) => row.SRVURL);
            } else {
                console.warn("Fallback query returned no results.");
                return [];
            }
        } catch (fallbackError) {
            console.error("Error during fallback processing:", fallbackError.message || fallbackError);
            throw fallbackError; // Propagate fallback errors
        }
    }
}


async function findPodsWithLucene(webIdQuery, keyword, baseUrl,metaIndexName) {
    ///////////////ENABLING AND DISABLING SERVER-LEVEL METADATA///////////////
    // const serverIndexUrl = `https://${baseUrl}/ESPRESSO/metaindex/`;
    const serverIndexUrl = `https://${baseUrl}.soton.ac.uk:3000/ESPRESSO/metaindexer_test_wrong/`;

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
        const relevantPodsResults = await retrieveRelevantData(keyword, webIdQuery, serverWebIDIndexUrl,"");


            // Extract the list of Pod IDs from the documents array
            // const relevantPodIDs = relevantPodsResults.documents.map((doc) => doc.Id);
        const relevantPodIDs = relevantPodsResults.flatMap((result) => result.documents.map((doc) => doc.Id));

        const relevantPodURLs = relevantPodIDs.map((id) => `${baseUrl}/${id}`);

            // Return the list of Pod IDs
            return relevantPodURLs;

    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`Cannot find Index of ${serverWebIDIndexUrl}`);
            return [];
        }
        console.error(`Error during search at ${baseUrl}: ${error.message || error}`);
        throw error;
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


// ORIGINAL_ONE
// async function integrateResultsWithLucene(sources, webIdQuery, searchWord) {
//     let integratedResult = [];
//
//     // Process a batch of Solid Requests
//     async function processBatch(batch) {
//         const requests = batch.map(async (source) => {
//
//
//                 const normalizedSource = source.startsWith("https://")
//                 ? source
//                 : `https://${source}`;
//
//                 const webIDPodIndex = `${normalizedSource}/espressoindex/${webIdQuery}.zip`;
//
//             try {
//                 // Check if the file exists (status 200)
//                 const headResponse = await axiosInstance.head(webIDPodIndex, {
//                     validateStatus: (status) => status === 200 || status === 404 || status === 401,
//                 });
//
//                 if (headResponse.status === 200) {
//
//                         const PodIndexSearchResults = await retrieveRelevantData(searchWord, webIdQuery, webIDPodIndex, "");
//                         // Add normalizedSource to the Id of each document
//                         PodIndexSearchResults.forEach((result) => {
//                             if (result.documents) {
//                                 result.documents = result.documents.map((doc) => ({
//                                     ...doc,
//                                     Id: `${normalizedSource}/${doc.Id}`
//                                 }));
//                             }
//                         });
//                         // console.log("Search Results:", JSON.stringify(PodIndexSearchResults,null,2));
//                         integratedResult.push(PodIndexSearchResults);
//                 }
//
//                 else {
//                    // console.warn(`WebID ${webIdQuery} has no access to this Pod: ${source} !`);
//                 }
//             } catch (error) {
//                 if (error.includes("Unexpected end of JSON input")){
//                     // console.warn(`While processing results from Pod ${source}:`,": WEBID Has Access to the Pod But no access to Files of the KWD! ")
//                 } else{
//                     console.error(`Error processing results from Pod ${source}:`, error|| error.message);
//                 }
//
//             }
//         });
//
//         await Promise.all(requests);
//     }
//
//     // Process sources in batches
//     for (let i = 0; i < sources.length; i += 50) {
//         const batch = sources.slice(i, i + 50);
//         await processBatch(batch);
//     }
//
//     return integratedResult;
// }
// // ORIGINAL_ONE
// app.get("/query", async (req, res) => {
//     console.time("TotalTime");
//
//     const metaIndexName = process.argv[2];
//     const { keyword } = req.query;
//     const [searchWord, webId] = keyword.includes(",") ? keyword.split(",") : [keyword, null];
//
//     if (!searchWord || searchWord.trim() === "") {
//         res.status(400).send("Invalid keyword");
//         return;
//     }
//
//     console.log(`Search Word: "${searchWord}"`);
//     console.log(`WebID: "${webId}"`);
//
//     let allIntegratedResults = [];
//
//     const limit = pLimit(1);
//
//     try {
//         // const relevantServers = await findServersWithLucene(keyword, webId);
//         const relevantServers =[
//             'srv03812.soton.ac.uk:3000',
//             // 'srv03954.soton.ac.uk:3000',
//             ]
//
//         console.log("Relevant Servers:", relevantServers);
//
//         // Wrap server processing with p-limit
//         const tasks = relevantServers.map((server) =>
//             limit(async () => {
//                 try {
//                     const relevantPods = await findPodsWithLucene(webId, keyword, server, metaIndexName);
//                     console.log(`No. SELECTED PODS from ${server}:`, relevantPods.length);
//
//                     if (relevantPods.length > 0) {
//                         console.time(`integrateResults__${server}`);
//                         const integratedResult = await integrateResultsWithLucene(relevantPods, webId, searchWord);
//
//                         console.log(`Number of Results from ${server}:`, integratedResult.length);
//                         allIntegratedResults.push(...integratedResult);
//                         console.timeEnd(`integrateResults__${server}`);
//                     }
//                 } catch (error) {
//                     console.error(`Error processing server ${server}:`, error.message || error);
//                 }
//             })
//         );
//
//         await Promise.all(tasks);
//
//         console.log("Total Number of Results from all servers:", allIntegratedResults.length);
//         res.json(allIntegratedResults);
//     } catch (error) {
//         console.error(`Error during the overall process: ${error.message || error}`);
//         res.status(500).send("An error occurred during processing.");
//     }
//
//     console.timeEnd("TotalTime");
// });


async function integrateResultsWithLucene(sources, webIdQuery, searchWord) {
    let integratedResult = [];

    // Process a batch of Solid Requests
    async function processBatch(batch) {
        const limit = pLimit(50);

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
                    });

                    if (headResponse.status === 200) {
                        const PodIndexSearchResults = await retrieveRelevantData(searchWord, webIdQuery, webIDPodIndex, "");

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
                    } else {
                        //console.warn(`WebID ${webIdQuery} has no access to this Pod: ${source} !`);
                    }
                } catch (error) {
                    if (error== "Error parsing JSON result: Unexpected end of JSON input"){
                    // console.warn(`While processing results from Pod ${source}:`,": WEBID Has Access to the Pod But no access to Files of the KWD! ")
                } else{
                    console.error(`Error processing results from Pod ${source}:`, error|| error.message);
                }
                }
            })
        );

        await Promise.all(requests);
    }

    // Process in batches of 200 pods
    for (let i = 0; i < sources.length; i += 250) {
        const batch = sources.slice(i, i + 250);
        await processBatch(batch);
    }

    return integratedResult;
}

app.get("/query", async (req, res) => {
    console.time("TotalTime");

    const metaIndexName = process.argv[2];
    const { keyword } = req.query;
    const [searchWord, webId] = keyword.includes(",") ? keyword.split(",") : [keyword, null];

    if (!searchWord || searchWord.trim() === "") {
        res.status(400).send("Invalid keyword");
        return;
    }

    console.log(`Search Word: "${searchWord}"`);
    console.log(`WebID: "${webId}"`);

    let allIntegratedResults = [];

    const serverLimit = pLimit(5);

    try {
        const relevantServers = [
            'srv03953.soton.ac.uk:3000',
            // Add more servers as needed
        ];

        console.log("Relevant Servers:", relevantServers);

        // Wrap server processing with p-limit
        const tasks = relevantServers.map((server) =>
            serverLimit(async () => {
                try {
                    const relevantPods = await findPodsWithLucene(webId, keyword, server, metaIndexName);
                    console.log(`No. SELECTED PODS from ${server}:`, relevantPods.length);

                    if (relevantPods.length > 0) {
                        console.time(`integrateResults__${server}`);
                        const integratedResult = await integrateResultsWithLucene(relevantPods, webId, searchWord);

                        console.log(`Number of Results from ${server}:`, integratedResult.length);
                        allIntegratedResults.push(...integratedResult);
                        console.timeEnd(`integrateResults__${server}`);
                    }
                } catch (error) {
                    console.error(`Error processing server ${server}:`, error.message || error);
                }
            })
        );

        await Promise.all(tasks);

        console.log("Total Number of Results from all servers:", allIntegratedResults.length);
        res.json(allIntegratedResults);
    } catch (error) {
        console.error(`Error during the overall process: ${error.message || error}`);
        res.status(500).send("An error occurred during processing.");
    }

    console.timeEnd("TotalTime");
});






// WORKING BUT Without PLIMIT
// app.get('/query', async (req, res) => {
//     // const metaIndexName = process.argv[2];
//     // const { keyword } = req.query ;
//     // const [searchWord, webId] = keyword.split(",");
//     // if (!searchWord) {
//     //     res.send("invalid keyword");
//     //     return;
//     // }
//
//     console.time(`TotalTime`);
//
//     const metaIndexName = process.argv[2];
//     const { keyword } = req.query;
//     const [searchWord, webId] = keyword.includes(",") ? keyword.split(",") : [keyword, null];
//
//     if (!searchWord || searchWord.trim() === "") {
//         res.status(400).send("Invalid keyword");
//         return;
//     }
//
//     console.log(`Search Word: "${searchWord}"`);
//     console.log(`WebID: "${webId}"`);
//
//     // Initialize an array to store results from all servers
//     let allIntegratedResults = [];
//
//     try {
//
//         const relevantServers = await findServersWithLucene(keyword, webId);
//
//         // const relevantServers =[
//         //     'srv03953.soton.ac.uk:3000',
//         //     // 'srv03954.soton.ac.uk:3000',
//         //     ]
//
//         console.log("Relevant Servers: ", relevantServers)
//
//         await Promise.all(relevantServers.map(async (server) => {
//                 try {
//                     const relevantPods = await findPodsWithLucene(webId, keyword, server,metaIndexName);
//                     console.log(`No. SELECTED PODS from ${server}:`, relevantPods.length);
//
//                     // Integrate results from these sources and add them to allIntegratedResults
//                     console.time(`integrateResults__${server}:`);
//                     const integratedResult = await integrateResultsWithLucene(relevantPods, webId, keyword);
//                     console.log(`Number of Results from ${server}: `, integratedResult.length);
//                     console.timeEnd(`integrateResults__${server}:`);
//
//                     // Add this server's integrated results to the combined results
//                     allIntegratedResults = allIntegratedResults.concat(integratedResult);
//
//                 } catch (error) {
//                     console.error(`Error reading Pods from ${server}:`, error.message || error);
//                 }
//             })
//         );
//
//         // console.log("Full Results from Server Before Ranking:", JSON.stringify(allIntegratedResults, null, 2));
//         // Log and respond with all integrated results from all servers
//         console.log("Total Number of Results from all servers: ", allIntegratedResults.length);
//
//         console.log('Processing of all servers completed.');
//
//
//         //RANKING//
//         /*
//         // Merge and re-rank results
//         const finalRankedResults = mergeAndRerank(allIntegratedResults);
//         // Print the final re-ranked results
//         // console.log("Full Results from Server After Ranking:", JSON.stringify(finalRankedResults, null, 2));
//         res.json(finalRankedResults);
//         */
//
//
//         res.json(allIntegratedResults);
//         console.timeEnd(`TotalTime`);
//
//     } catch (error) {
//         console.error(`Error during the overall process: ${error.message || error}`);
//     }
//
//
//  });

app.listen(port, () => {
    console.log(`app (NEW) listening on port ${port}`);

});


