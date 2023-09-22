const express = require('express');
const app = express()
const port = 8080
const axios = require('axios');
const fs = require("fs");
const { Worker } = require("worker_threads");

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

function createWorker(query,webIdQuery,source) {
    return new Promise(function (resolve, reject) {
        const worker = new Worker("./worker.js", {
            workerData: { webIdQuery,source,query },
        });
        worker.on("message", (data) => {
            resolve(data);
        });
        worker.on("error", (msg) => {
            reject(`An error ocurred: ${msg}`);
        });
    });
}


app.get('/query', async (req, res, next) => {
    const { keyword } = req.query;
    const [query, webId] = keyword.split(",");
    if (!query) {
        res.send("invalid keyword");
        return;
    }
    const webIdQuery = webId.replace(/[^a-zA-Z0-9]/g, "");
    const sources = await readSources()
    const workerPromises = [];
    for (let i = 0; i < sources.length; i++) {
      workerPromises.push(createWorker(query,webIdQuery,sources[i]));
    }  
    const thread_results = await Promise.all(workerPromises);
    const integratedResult = thread_results.reduce((map,item)=>{
        map = [...map,...item];
        return map;
    },[]);
    res.json(integratedResult);
});

const readSources = async () => {
    const response = await axios.get("https://srv03812.soton.ac.uk:3000/ESPRESSO/webidpodmetaindex.csv", { responseType: 'blob' });
    const csvStr = await response.data;
    const result = csvStr.split("\r\n").filter(i => i.length > 0);
    return result;
}
