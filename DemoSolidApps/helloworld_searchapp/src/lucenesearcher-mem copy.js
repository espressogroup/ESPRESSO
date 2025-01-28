const https = require('https');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Set up the axios instance with the provided certificate and HTTPS agent
const certificate = fs.readFileSync('./ca.pem');
const httpsAgent = new https.Agent({ ca: certificate, rejectUnauthorized: false });
const axiosInstance = axios.create({ httpsAgent });

/**
 * Downloads a ZIP file, streams it directly to Java for processing.
 *
 * @param {string} url - The URL of the zip file.
 * @param {string} query - The query string to pass to the Java searcher.
 */
async function downloadAndProcessZip(url, query) {
    console.log(`Starting download from ${url}...`);

    const zipFilePath = path.join(__dirname, 'index.zip');

    try {
        // Step 1: Download the ZIP file as a stream
        const response = await axiosInstance({
            method: 'get',
            url: url,
            responseType: 'stream',
        });

        // Step 2: Stream the ZIP file directly to the Java process
        const javaProcess = spawn('java', ['-cp', 'LuceneSearcher-1.0-SNAPSHOT.jar', 'com.mycompany.searcher.LuceneSearcher', query]);

        // Pipe the response stream (ZIP file) directly to the Java process
        response.data.pipe(javaProcess.stdin);

        // Handle Java process output
        javaProcess.stdout.on('data', (data) => {
            console.log(`Java Process Output: ${data.toString()}`);
        });

        javaProcess.stderr.on('data', (data) => {
            console.error(`Java Process Error: ${data.toString()}`);
        });

        // Wait for the Java process to exit
        javaProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Java process completed successfully.');
            } else {
                console.error(`Java process exited with code ${code}`);
            }
        });
    } catch (error) {
        console.error(`Error during download or processing: ${error.message}`);
    }
}

module.exports = downloadAndProcessZip();

// Example usage
const zipUrl = 'https://srv03813.soton.ac.uk:3000/ESPRESSO/webid1-03813-pods.zip';
// const query = 'blood stress anxiety alcohol test';
const query = 'age';
downloadAndProcessZip(zipUrl, query);