const express = require('express');
const axios = require('axios');
const fs = require("fs");
const https = require("https");

const app = express();
const port = 8080;

app.listen(port, () => {
    console.log(`app (NEW) listening on port ${port}`);
});

const certificate = fs.readFileSync('./ca.pem');

const httpsAgent = new https.Agent({
    ca: certificate,
    rejectUnauthorized: false});
const axiosInstance = axios.create({httpsAgent});

function compareAlphanumeric(id1, id2) {
    const numericPart1 = parseInt(id1.match(/\d+/));
    const numericPart2 = parseInt(id2.match(/\d+/));

    if (numericPart1 < numericPart2) {
        return -1;
    } else if (numericPart1 > numericPart2) {
        return 1;
    } else {
        return id1.localeCompare(id2);
    }
}

async function readSources() {
    const urlArgument = process.argv[2];
    const metaIndexname=process.argv[3];
    const response = await axiosInstance.get(`https://${urlArgument}:3000/ESPRESSO/${metaIndexname}`, { responseType: 'blob' });
    const csvStr = response.data.toString();
    const result = csvStr.split("\r\n").filter(i => i.length > 0);

    return result;
}


app.get('/query', async (req, res) => {
    const { keyword } = req.query;
    const [searchWord, webId] = keyword.split(",");
    if (!searchWord) {
        res.send("invalid keyword");
        return;
    }

    const webIdQuery = webId.replace(/[^a-zA-Z0-9 ]/g, "");
    const sources = await readSources();

    let integratedResult = [];

    const requests = sources.map(async source => {
        const baseAdress = source.replace(/\/espressoindex\//, "/");
        const [response, webIdAccess] = await Promise.all([

            axiosInstance.get(`${source}${searchWord.slice(0).split('').join('/')}.ndx`).catch(err => err.response),
            axiosInstance.get(`${source}${webIdQuery}.webid`).catch(err => err.response)
        ]);

        if (response.status === 200 && webIdAccess.status === 200) {
            const webIdRows = webIdAccess.data.split("\r\n").filter(i => i.length > 0);
            const ndxRows = response.data.split("\r\n").filter(i => i.length > 0);

            let webIdIndex = 0;
            let ndxIndex = 0;

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
    });

    await Promise.all(requests);

    res.json(integratedResult);
});