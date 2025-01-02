const express = require('express');
const axios = require('axios');
const fs = require("fs");
const https = require("https");
const cors = require('cors');
const OverlayQueryExecutor = require('./OverlayQueryExecutor');

const  Ranker= require('./Ranker');



const app = express();
const port = 8080;

const certificate = fs.readFileSync('./ca.pem');
const httpsAgent = new https.Agent({ ca: certificate, rejectUnauthorized: false });
const axiosInstance = axios.create({ httpsAgent });

app.use(cors());

function compareAlphanumeric(id1, id2) {
    const numericPart1 = parseInt(id1.match(/\d+/));
    const numericPart2 = parseInt(id2.match(/\d+/));
    if (numericPart1 < numericPart2) return -1;
    if (numericPart1 > numericPart2) return 1;
    return id1.localeCompare(id2);
}

async function fetchFile(url) {
    try {
        const response = await axiosInstance.get(url);
        return response.data.split("\r\n").filter(line => line.length > 0);
    } catch (error) {
        console.log(`Error fetching file from ${url}: ${error.message}`);
        return null;
    }
}
async function getWebIdData(baseUrl, webIdQuery, serverIndexUrl) {
    const userWebIdUrl = `${serverIndexUrl}${webIdQuery}.webid`;

    const userWebIdData = await fetchFile(userWebIdUrl);

    let podUrls = {};
    let userHandle = null;

    if (userWebIdData) {
        userHandle = userWebIdData[0].split(",")[1];
        userWebIdData.slice(1).forEach(line => {
            const [podId, url] = line.split(",");
            podUrls[podId] = `${baseUrl}${url.trim()}espressoindex/`;
        });

    }

    // console.log({ podUrls, userHandle })
    return { podUrls, userHandle };
}
async function getKeywordFileData(serverIndexUrl, keyword) {
    //Non-Hirarachical indexing
    // const keywordFileUrl = `${serverIndexUrl}${keyword}.ndx`;

    //Hirarachical indexing
    const keywordFileUrl = `${serverIndexUrl}${keyword.slice(0).split('').join('/')}.ndx`;
    return await fetchFile(keywordFileUrl);
}


async function findServers(keyword, webId) {
    const queryExecutor = new OverlayQueryExecutor();

    const query = `SELECT DISTINCT srvurl FROM LTOVERLAYSERVERINFO T0, LTOVERLAYKWDWEBIDINFO T1 
                   WHERE T0.SrvID = T1.SRVID AND kwd='${keyword}' AND webid='${webId}'`;

    return new Promise((resolve, reject) => {
        queryExecutor.executeQuery(query, (error, result) => {
            if (error) {
                console.error("Query execution error:", error);
                reject(error); // Reject the promise with the error
            } else {
                // console.log("Query result:", result);
                resolve(result);
            }
        });
    });
}


async function rankServers(keyword, webID) {
    const queryExecutor = new OverlayQueryExecutor();

    const query = `SELECT DISTINCT SRVURL, SRVCOLLEN, TERMFREQUENCY, PODFREQUENCY FROM LTOVERLAYSERVERINFO T0, LTOVERLAYKWDWEBIDINFO T1  WHERE T0.SrvID = T1.SRVID AND kwd='${keyword}' AND webid='${webID}'`;

    const collectionQuery =`SELECT SRVCOLLEN FROM LTOVERLAYSERVERINFO  T0, (SELECT DISTINCT SRVID FROM LTOVERLAYKWDWEBIDINFO WHERE webid='${webID}') T1 WHERE T0.SrvID =T1.SrvID`


    return new Promise((resolve, reject) => {
        queryExecutor.executeQuery(query, async (error, result) => {
            if (error) {
                console.error("Query execution error:", error);
                reject(error);
                return;
            }

            // console.log("Query result 1:", result);

            queryExecutor.executeQuery(collectionQuery, (err, collectionResult) => {
                if (err) {
                    console.error("Collection query execution error:", err);
                    reject(err);
                    return;
                }

                // console.log("Query result 2:", collectionResult);

                // Calculate overall collection statistics
                const totalTermsInCollection = collectionResult.reduce((sum, row) => sum + parseInt(row.SRVCOLLEN), 0);
                const totalDocuments = collectionResult.length;
                const avgDocumentLength = totalTermsInCollection / totalDocuments;

                const collectionFrequency = result.reduce((sum, item) => sum + parseInt(item.TERMFREQUENCY), 0);

                // Define BM25 parameters
                const mu = 2000;
                const k1 = 1.5;
                const b = 0.75;

                // Calculate scores for each item in queryTerms and include the SRVURL
                const scores = result.map((item) => {
                    const queryTerm = {
                        term: keyword,
                        termFrequency: parseInt(item.TERMFREQUENCY),
                        collectionFrequency: collectionFrequency,
                        documentFrequency: result.length,
                        documentLength: parseInt(item.SRVCOLLEN),
                        totalTermsInCollection: totalTermsInCollection,
                        totalDocuments: totalDocuments,
                        avgDocumentLength: avgDocumentLength,
                    };

                    const score = Ranker.calculateQueryScores({
                        queryTerms: [queryTerm],  // Calculate scores for the single term
                        documentLength: queryTerm.documentLength,
                        totalTermsInCollection,
                        totalDocuments,
                        avgDocumentLength,
                        mu,
                        k1,
                        b
                    });

                    // Return score along with the server URL
                    return { SRVURL: item.SRVURL, score };
                });

                resolve(scores);
            });
        });
    });
}


function rankServersByScore(servers, scoreType) {
    return servers.slice().sort((a, b) => { // Use slice() to avoid modifying the original array
        if (scoreType === 'bm25Score' || scoreType === 'tfidfScore') {
            return b.score[scoreType] - a.score[scoreType]; // Descending for positive scores
        }
        if (scoreType === 'queryLikelihoodScore') {
            return a.score[scoreType] - b.score[scoreType]; // Ascending for negative scores
        }
    });
}

async function readSourcesWithSrvrMetadata (webIdQuery, keyword, baseUrl,metaIndexName) {

    ///////////////ENABLING AND DISABLING SERVER-LEVEL METADATA///////////////
    // const serverIndexUrl = `${baseUrl}ESPRESSO/metaindex/`;
    const serverIndexUrl = `${baseUrl}ESPRESSO/ardf/healthmetaindex_test_wrong/`;

    /////// Check if the `server_index` container exists, otherwise fall back to read all pods ///////
    const serverIndexData = await fetchFile(serverIndexUrl);
    if (
        !serverIndexData ||
        (Array.isArray(serverIndexData) && serverIndexData.length === 1 &&
            typeof serverIndexData[0] === 'string' && !serverIndexData[0].includes('ldp:contains'))
    ) {
        console.log("server_index not found, falling back to readAllSources...");
        return await readAllSources(baseUrl,metaIndexName);
    }


    // Get and keyword index data, if missing return empty list
    const keywordIndexData = await getKeywordFileData(serverIndexUrl, keyword);
    if (!keywordIndexData) return [];


    // Now, we Get WebID data i.e., pod urls from user.webid
    const { podUrls, userHandle } = await getWebIdData(baseUrl, webIdQuery, serverIndexUrl);
    if (!userHandle ) return [];



    let selectedPods = new Set();
    const matchingLines = keywordIndexData.filter(line => {
        const [handle] = line.split(",");

        return handle === userHandle;
    });


    matchingLines.forEach(line => {
        const [, podId] = line.split(",");
        if (podUrls[podId]) selectedPods.add(podUrls[podId]);
    });


    return [...selectedPods];
}
async function readAllSources(baseUrl,metaIndexName) {

    try {
        const response = await axiosInstance.get(`${baseUrl}ESPRESSO/${metaIndexName}`, { responseType: 'blob' });
        const csvStr = response.data.toString();
        const selectedPods = csvStr.split("\r\n").filter(i => i.length > 0);
        return selectedPods;
    } catch (error) {
        console.error(`Error fetching meta-index: ${metaIndexName}. Returning empty results.`, error);
        return [];
    }
}

async function integrateResults(sources, webIdQuery, searchWord) {
    let integratedResult = [];

    // Define a function to process a batch of sources
    async function processBatch(batch) {
        const requests = batch.map(async source => {
            const baseAddress = source.replace(/\/espressoindex\//, "/");

            try {
                // Perform both requests concurrently
                const [response, webIdAccess] = await Promise.all([
                    //Non-Hierarchical indexing
                    // axiosInstance.get(`${source}${searchWord}.ndx`).catch(err => err.response)

                    //Hierarchical indexing
                    axiosInstance.get(`${source}${searchWord.slice(0).split('').join('/')}.ndx`).catch(err => err.response)
                    ,
                    axiosInstance.get(`${source}${webIdQuery}.webid`).catch(err => err.response)
                ]);

                // Ensure both responses are defined before accessing properties
                if (response && response.status === 200 && webIdAccess && webIdAccess.status === 200) {

                    // Process webId and index data
                    const webIdRows = webIdAccess.data.split("\r\n").filter(i => i.length > 0);
                    const ndxRows = response.data.split("\r\n").filter(i => i.length > 0);

                    let webIdIndex = 0;
                    let ndxIndex = 0;

                    // Compare and merge results based on file IDs
                    while (webIdIndex < webIdRows.length && ndxIndex < ndxRows.length) {
                        const [webIdFileId, webIdFileName] = webIdRows[webIdIndex].split(",");
                        const [ndxFileId, frequency] = ndxRows[ndxIndex].split(",");
                        const comparisonResult = compareAlphanumeric(webIdFileId, ndxFileId);

                        if (comparisonResult === 0) {
                            const newvalue = { "address": `${baseAddress}${webIdFileName}`, "frequency": frequency };
                            integratedResult.push(newvalue);
                            webIdIndex++;
                            ndxIndex++;
                        } else if (comparisonResult < 0) {
                            webIdIndex++;
                        } else {
                            ndxIndex++;
                        }
                    }
                }
            } catch (err) {
                // Log any errors that occur during the request
                console.error("An error occurred:", err);
            }
        });

        await Promise.all(requests);
    }

    // Process sources in batches
    for (let i = 0; i < sources.length; i += 50) {
        const batch = sources.slice(i, i + 50);
        await processBatch(batch);
    }

    return integratedResult;
}

app.get('/query', async (req, res) => {

    console.time(`TotalTime`);

    const metaIndexName = process.argv[2];
    const { keyword } = req.query;
    const [searchWord, webId] = keyword.split(",");

    if (!searchWord) {
        res.send("invalid keyword");
        return;
    }

    const webIdQuery = webId.replace(/[^a-zA-Z0-9 ]/g, "");

    console.log(`Search Word: "${searchWord}"`);
    console.log(`WebID: "${webId}"`);

    //FIND RELEVANT SERVERS FROM OVERLAY NET.
    /*
    console.time(`select_relevant_servers`);
    const servers = await findServers(searchWord, webId);
    console.log("Relevant servers:", servers);
    console.timeEnd("select_relevant_servers")


    const servers_ranked= await rankServers(searchWord,webId);

    console.log("Servers Scores",servers_ranked);

    console.log("Ranked by BM25:", rankServersByScore(servers_ranked, 'bm25Score'));
*/

    //JUST FOR TESTING
    let servers=['srv03953.soton.ac.uk'
        // ,'srv03954.soton.ac.uk'
    ]


    // Initialize an array to store results from all servers
    let allIntegratedResults = [];

    try {
    // Process each server in parallel
    await Promise.all(servers.map(async (server) => {
        // const srvurl = `https://${server.SRVURL}:3000/`;
        const srvurl = `https://${server}:3000/`;

        try {
            // Read sources (pods) from the current server
            const sources = await readSourcesWithSrvrMetadata(webIdQuery, searchWord, srvurl, metaIndexName);
            console.log(`No. SELECTED PODS from ${srvurl}:`, sources.length);

            // Integrate results from these sources and add them to allIntegratedResults
            console.time(`integrateResults_${srvurl}`);
            const integratedResult = await integrateResults(sources, webIdQuery, searchWord);
            console.log(`Number of Results from ${srvurl}: `, integratedResult.length);
            console.timeEnd(`integrateResults_${srvurl}`);


            // Add this server's integrated results to the combined results
            allIntegratedResults = allIntegratedResults.concat(integratedResult);
        } catch (error) {
            console.error(`Error reading sources from ${srvurl}:`, error);
        }
    }));



    // Log and respond with all integrated results from all servers
    console.log("Total Number of Results from all servers: ", allIntegratedResults.length);

    res.json(allIntegratedResults);
    console.timeEnd(`TotalTime`);

    } catch (error) {
        console.error(`Error during the overall process: ${error.message || error}`);
    }

});



// Get All sources then Query
// app.get('/query', async (req, res) => {
//
//
//
//     const metaIndexName = process.argv[2];
//
//     const { keyword } = req.query;
//     const [searchWord, webId] = keyword.split(",");
//     if (!searchWord) {
//         res.send("invalid keyword");
//         return;
//     }
//
//     const webIdQuery = webId.replace(/[^a-zA-Z0-9 ]/g, "");
//
//
//     console.time(`readSourcesWithMetadata`);
//
//     const servers= await findServers(searchWord,webId);
//     console.log("Relevant servers:", servers);
//
//
//
//     let allSources = [];
//
//
//     // Read sources(pods) from all servers
//     for (const server of servers) {
//         const srvurl = `https://${server.SRVURL}:3000/`;
//         console.log(`Checking Relevant Pods @ server: ${srvurl}`);
//
//
//         // Read sources(pods) from the current server
//         try {
//             // Collect sources from this server
//             const sources = await readSourcesWithSrvrMetadata(webIdQuery, searchWord, srvurl, metaIndexName);
//             // Concatenate sources from this server to allSources
//             allSources = allSources.concat(sources);
//             console.log(`No. SELECTED PODS from ${srvurl}:`, sources.length);
//         } catch (error) {
//             console.error(`Error reading sources from ${srvurl}:`, error);
//         }
//     }
//
//     console.timeEnd(`readSourcesWithMetadata`);
//
//     console.log("All Pods from all servers: ",allSources.length)
//
//
//     console.time("integrateResults");
//     const integratedResult = await integrateResults(allSources, webIdQuery, searchWord);
//     console.timeEnd("integrateResults");
//     console.log("Number of Results: ", integratedResult.length);
//
//
//
//     res.json(integratedResult);
//
//     // res.json(servers);
//
// });

app.listen(port, () => {
    console.log(`app (NEW) listening on port ${port}`);
});
