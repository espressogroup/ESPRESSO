const express = require('express');
const axios = require('axios');
const fs = require("fs");
const https = require("https");

const app = express();
const port = 8080;

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

    return { podUrls, userHandle };
}

async function getKeywordFileData(serverIndexUrl, keyword, indexType) {
    let keywordFileUrl;
    if (indexType === 'h') {
        // Hierarchical indexing
        keywordFileUrl = `${serverIndexUrl}${keyword.split('').join('/')}.ndx`;
    } else {
        // Whole-word (Non-Hierarchical indexing)
        keywordFileUrl = `${serverIndexUrl}${keyword}.ndx`;
    }
    return await fetchFile(keywordFileUrl);
}

async function readSourcesWithSrvrMetadata(webIdQuery, keyword, baseUrl, metaIndexName, serverMetadata, indexType) {
    let serverIndexUrl;
    if (serverMetadata === '1') {
        serverIndexUrl = `${baseUrl}ESPRESSO/metaindex/`;
    } else {
        serverIndexUrl = `${baseUrl}ESPRESSO/ardf/healthmetaindex_test_wrong/`;
    }

    const serverIndexData = await fetchFile(serverIndexUrl);
    if (!serverIndexData) {
        console.log("server_index not found, falling back to readAllSources...");
        return await readAllSources(baseUrl, metaIndexName);
    }

    const keywordIndexData = await getKeywordFileData(serverIndexUrl, keyword, indexType);
    if (!keywordIndexData) return [];

    const { podUrls, userHandle } = await getWebIdData(baseUrl, webIdQuery, serverIndexUrl);
    if (!userHandle) return [];

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


async function integrateResults(sources, webIdQuery, searchWord, indexType) {
    let integratedResult = [];

    async function processBatch(batch, searchWord, webIdQuery, indexType) {
        const requests = batch.map(async source => {
            const baseAddress = source.replace(/\/espressoindex\//, "/");

            let response;
            let webIdAccess;
            if (indexType === 'h') {
                // Hierarchical indexing
                response = axios.get(`${source}${searchWord.split('').join('/')}.ndx`).catch(err => err.response);
            } else {
                // Whole-word (Non-Hierarchical indexing)
                response = axios.get(`${source}${searchWord}.ndx`).catch(err => err.response);
            }

            webIdAccess = axios.get(`${source}${webIdQuery}.webid`).catch(err => err.response);

            const [responseData, webIdData] = await Promise.all([response, webIdAccess]);

            if (responseData && responseData.status === 200 && webIdData && webIdData.status === 200) {
                const webIdRows = webIdData.data.split("\r\n").filter(i => i.length > 0);
                const ndxRows = responseData.data.split("\r\n").filter(i => i.length > 0);

                let webIdIndex = 0;
                let ndxIndex = 0;

                while (webIdIndex < webIdRows.length && ndxIndex < ndxRows.length) {
                    const [webIdFileId, webIdFileName] = webIdRows[webIdIndex].split(",");
                    const [ndxFileId, frequency] = ndxRows[ndxIndex].split(",");
                    const comparisonResult = compareAlphanumeric(webIdFileId, ndxFileId);

                    if (comparisonResult === 0) {
                        const newValue = { "address": `${baseAddress}${webIdFileName}`, "frequency": frequency };
                        integratedResult.push(newValue);
                        webIdIndex++;
                        ndxIndex++;
                    } else if (comparisonResult < 0) {
                        webIdIndex++;
                    } else {
                        ndxIndex++;
                    }
                }
            }
        });

        await Promise.all(requests);
    }

    for (let i = 0; i < sources.length; i += 50) {
        const batch = sources.slice(i, i + 50);
        await processBatch(batch, searchWord, webIdQuery, indexType);
    }

    return integratedResult;
}

app.get('/query', async (req, res) => {
    const urlArgument = process.argv[2];
    const metaIndexName = process.argv[3];
    const serverMetadata = process.argv[4]; // 0 or 1
    const indexType = process.argv[5]; // h or w

    const baseUrl = `https://${urlArgument}:3000/`;

    const { keyword } = req.query;
    const [searchWord, webId] = keyword.split(",");
    if (!searchWord) {
        res.send("invalid keyword");
        return;
    }

    const webIdQuery = webId.replace(/[^a-zA-Z0-9 ]/g, "");

    console.time("readSourcesWithSrvrMetadata");
    const sources = await readSourcesWithSrvrMetadata(webIdQuery, searchWord, baseUrl, metaIndexName, serverMetadata, indexType);
    console.timeEnd("readSourcesWithSrvrMetadata");
    console.log("No. SELECTED PODS: ", sources.length);

    console.time("integrateResults");
    const integratedResult = await integrateResults(sources, webIdQuery, searchWord, indexType);
    console.timeEnd("integrateResults");
    console.log("Number of Results: ", integratedResult.length);

    res.json(integratedResult);
});

app.listen(port, () => {
    console.log(`app (NEW) listening on port ${port}`);
});
