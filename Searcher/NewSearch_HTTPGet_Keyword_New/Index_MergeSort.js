const express = require('express');
const app = express()
const port = 8080
const axios = require('axios');
const https = require('https');
const fs = require("fs");
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})


const certificate = fs.readFileSync('ca.pem');
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

app.get('/query', async (req, res) => {
    const { keyword } = req.query;
    const [searchWord, webId] = keyword.split(",");
    if (!searchWord) {
        res.send("invalid keyword");
        return;
    }

    const webIdQuery = webId.replace(/[^a-zA-Z0-9 ]/g, "");
    const sources = await readSources()
    let integratedResult = [];

    for (let index = 0; index < sources.length; index++) {
        const source = sources[index];
        const baseAdress = source.replace(/\/espressoindex\//,"/");
        const response = await axiosInstance.get(`${source}${searchWord}.ndx`).then((resp) => resp).catch((resp) => resp.response);
        if (response.status === 200) {
            const webIdAccess = await axiosInstance.get(`${source}${webIdQuery}.webid`).then((resp) => resp).catch((resp) => resp.response);
            if (webIdAccess.status === 200) {
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
        }
    }
    res.json(integratedResult)
});

const readSources = async () => {
    const response = await axiosInstance.get("https://srv03812.soton.ac.uk:3000/ESPRESSO/newIndexingpodmetaindex.csv", { responseType: 'blob' });
    const csvStr = await response.data;
    const result = csvStr.split("\r\n").filter(i => i.length > 0);

    return result;
}
