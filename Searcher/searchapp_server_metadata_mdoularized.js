const express = require('express');
const axios = require('axios');
const fs = require("fs");
const https = require("https");

const app = express();
const port = 8080;

// const certificate = fs.readFileSync('./ca.pem');
// const httpsAgent = new https.Agent({ ca: certificate, rejectUnauthorized: false });
// const axiosInstance = axios.create({ httpsAgent });

function compareAlphanumeric(id1, id2) {
    const numericPart1 = parseInt(id1.match(/\d+/));
    const numericPart2 = parseInt(id2.match(/\d+/));
    if (numericPart1 < numericPart2) return -1;
    if (numericPart1 > numericPart2) return 1;
    return id1.localeCompare(id2);
}

async function fetchFile(url) {
    try {
        const response = await axios.get(url);
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

async function readSourcesWithSrvrMetadata (webIdQuery, keyword, baseUrl,metaIndexName) {

    ///////////////ENABLING AND DISABLING SERVER-LEVEL METADATA///////////////
    const serverIndexUrl = `${baseUrl}ESPRESSO/metaindex/`;
    // const serverIndexUrl = `${baseUrl}ESPRESSO/ardf/healthmetaindex_test_wrong/`;

    /////// Check if the `server_index` container exists, otherwise fall back to read all pods ///////
    const serverIndexData = await fetchFile(serverIndexUrl);
    if (!serverIndexData) {
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
        const response = await axios.get(`${baseUrl}ESPRESSO/${metaIndexName}`, { responseType: 'blob' });
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
            const baseAdress = source.replace(/\/espressoindex\//, "/");

            try {
                // Perform both requests concurrently
                const [response, webIdAccess] = await Promise.all([
                    //Non-Hierarchical indexing
                    // axios.get(`${source}${searchWord}.ndx`).catch(err => err.response)

                    //Hierarchical indexing
                    axios.get(`${source}${searchWord.slice(0).split('').join('/')}.ndx`).catch(err => err.response)
                    ,
                    axios.get(`${source}${webIdQuery}.webid`).catch(err => err.response)
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
                            const newvalue = { "address": `${baseAdress}${webIdFileName}`, "frequency": frequency };
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

    const urlArgument = process.argv[2];
    const metaIndexName = process.argv[3];

    const baseUrl = `https://${urlArgument}:3000/`;

    const { keyword } = req.query;
    const [searchWord, webId] = keyword.split(",");
    if (!searchWord) {
        res.send("invalid keyword");
        return;
    }

    const webIdQuery = webId.replace(/[^a-zA-Z0-9 ]/g, "");

    console.time("readSourcesWithSrvrMetadata");
    const sources = await readSourcesWithSrvrMetadata (webIdQuery, searchWord, baseUrl,metaIndexName);
    console.timeEnd("readSourcesWithSrvrMetadata");
    // console.log("SELECTED PODS: ", sources);
    console.log("No. SELECTED PODS: ", sources.length);


    console.time("integrateResults");
    const integratedResult = await integrateResults(sources, webIdQuery, searchWord);
    console.timeEnd("integrateResults");
    console.log("Number of Results: ", integratedResult.length);

    res.json(integratedResult);
});

app.listen(port, () => {
    console.log(`app (NEW) listening on port ${port}`);
});
