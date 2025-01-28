const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require("fs");
const https = require("https");
const axios = require('axios');
const os = require('os');

const certificate = fs.readFileSync('/Users/ragab/Desktop/helloworld_searchapp/src/ca.pem');
const httpsAgent = new https.Agent({ ca: certificate, rejectUnauthorized: false });
const axiosInstance = axios.create({ httpsAgent });

async function fetchBloomFilterStream(url) {
    try {
        const response = await axiosInstance.get(url, { responseType: 'stream' });
        return response.data;
    } catch (error) {
        console.error(`Error fetching Bloom filter file from ${url}: ${error.message}`);
        throw error;
    }
}


function filterQuery(query, bloomFilterStream) {
    return new Promise((resolve, reject) => {
        const jarPath = path.resolve(__dirname, 'BloomQueryFilter-1.0-SNAPSHOT.jar');
        const javaProcess = spawn('java', ['-jar', jarPath, query]);

        let resultData = '';

        // Pipe the Bloom filter stream to the Java process's stdin
        bloomFilterStream.pipe(javaProcess.stdin);

        // Listen to stdout from Java process
        javaProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        // Log any errors from the Java process
        javaProcess.stderr.on('data', (data) => {
            console.error(`Java Process Error: ${data.toString()}`);
        });

        javaProcess.on('close', (code) => {
            if (code === 0) {
                // Parse the JAR output to extract the filtered query
                const lines = resultData.trim().split('\n');
                const filteredQueryLine = lines.find(line =>
                    line.startsWith('Filtered Query:')
                );

                if (filteredQueryLine) {
                    const filteredQuery = filteredQueryLine.replace('Filtered Query:', '').trim();
                    resolve(filteredQuery);
                } else {
                    reject('Filtered Query not found in output.');
                }
            } else {
                reject(`Java process exited with code ${code}`);
            }
        });

        javaProcess.on('error', (error) => {
            reject(`Java Process Spawn Error: ${error.message}`);
        });
    });
}

module.exports = { fetchBloomFilterStream, filterQuery };
