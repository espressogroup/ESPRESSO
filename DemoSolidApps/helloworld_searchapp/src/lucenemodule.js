const https = require('https');
const axios = require('axios');
const fs = require('fs');
const { spawn } = require('child_process');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);


// Set up the axios instance with the provided certificate and HTTPS agent
const certificate = fs.readFileSync('./ca.pem');
const httpsAgent = new https.Agent({ ca: certificate, rejectUnauthorized: false });
const axiosInstance = axios.create({ httpsAgent });


/**
 * Retrieves relevant data from a zip file and invokes the Lucene searcher Java process.
 *
 * @param {string} keyword - The keyword to search for.
 * @param {string} webid - The WebID to identify the source of data.
 * @param {string} zipUrl - The URL to download the zip file.
 * @returns {Promise<Object>} - A promise that resolves with the search results in JSON format.
 */
async function retrieveRelevantData_MB(keyword, webid, zipUrl, k) {
    // console.log(`Processing keyword "${keyword}" for WebID "${webid}"...`);

    try {
        const response = await axiosInstance({
            method: 'get',
            url: zipUrl,
            responseType: 'stream',
        });


        const javaProcess = spawn('java', [
            '-cp',
            'LuceneSearcher-1.0-SNAPSHOT.jar',
            'com.mycompany.searcher.LuceneSearcher',
            keyword,
            k
        ]);

        response.data.pipe(javaProcess.stdin);

        let resultData = '';

        javaProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        javaProcess.stderr.on('data', (data) => {
            console.error(`Java Process Error: ${data.toString()}`);
        });

        return new Promise((resolve, reject) => {
            javaProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const jsonResult = JSON.parse(resultData);
                        resolve(jsonResult);
                    } catch (error) {
                        reject(`Error parsing JSON result: ${error.message}`);
                    }
                } else {
                    reject(`Java process exited with code ${code}`);
                }
            });
        });
    } catch (error) {
        throw error;
    }
}


async function retrieveRelevantData_MR(keyword, webid, zipUrl, k) {
    try {
        // Fetch the ZIP file as a stream
        const response = await axiosInstance({
            method: 'get',
            url: zipUrl,
            responseType: 'stream',
        });

        // Spawn the Java process
        const javaProcess = spawn('java', [
            '-cp',
            'LuceneSearcher-1.0-SNAPSHOT.jar',
            'com.mycompany.searcher.LuceneSearcher',
            keyword,
            k,
        ]);

        let resultData = '';

        // Listen to stdout from Java process
        javaProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        // Log any errors from the Java process
        javaProcess.stderr.on('data', (data) => {
            console.error(`Java Process Error: ${data.toString()}`);
        });

        // Handle stream errors
        response.data.on('error', (error) => {
            console.error(`Response Stream Error: ${error.message}`);
            javaProcess.kill();
        });

        javaProcess.stdin.on('error', (error) => {
            console.error(`Java Process Stdin Error: ${error.message}`);
        });

        // Pipe the response stream to the Java process's stdin
        response.data.pipe(javaProcess.stdin);

        // Return a Promise that resolves when the Java process exits
        return new Promise((resolve, reject) => {
            javaProcess.on('close', (code) => {
                console.log("Raw Result Data from Java:", resultData);
                if (code === 0) {
                        try {
                            const jsonResult = JSON.parse(resultData);
                            resolve(jsonResult);
                        } catch (error) {
                            reject(`Error parsing JSON result: ${error.message}`);
                        }
                } else {
                    reject(`Java process exited with code ${code}`);
                }
            });

            javaProcess.on('error', (error) => {
                reject(`Java Process Spawn Error: ${error.message}`);
            });
        });
    } catch (error) {
        console.error(`Error in retrieveRelevantData: ${error.message}`);
        throw error;
    }
}


async function retrieveRelevantData(keyword, webid, zipUrl, k) {
    try {

        // Fetch the ZIP file as a stream
        const response = await axiosInstance({
            method: 'get',
            url: zipUrl,
            responseType: 'stream',
        });

        // console.log(`ZIP Fetch Response Headers:`, response.headers);

        // Spawn the Java process
        const javaProcess = spawn('java', [
            '-Xmx8g',
            '-Xms4g',
            '-cp',
            'LuceneSearcher-1.0-SNAPSHOT.jar',
            'com.mycompany.searcher.LuceneSearcher',
            keyword,
            k,
        ]);

        let resultData = '';

        // Listen to stdout from Java process
        javaProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        // Log any errors from the Java process
        javaProcess.stderr.on('data', (data) => {
            console.error(`Java Process Error: ${data.toString()}`);
        });

        // Log when the ZIP stream ends
        response.data.on('end', () => {
            // console.log('Finished receiving ZIP file stream.');
        });

        // Handle stream errors
        response.data.on('error', (error) => {
            console.error(`Response Stream Error: ${error.message}`);
            javaProcess.kill(); // Kill Java process if the response stream fails
        });

        // Confirm piping to Java process
        javaProcess.stdin.on('error', (error) => {
            console.error(`Java Process Stdin Error: ${error.message}`);
        });
        javaProcess.stdin.on('finish', () => {
            // console.log('Finished piping ZIP stream to Java process.');
        });

        // Pipe the response stream to the Java process's stdin
        response.data.pipe(javaProcess.stdin);

        // Return a Promise that resolves when the Java process exits
        return new Promise((resolve, reject) => {
            javaProcess.on('close', (code) => {
                // console.log("Raw Result Data from Java:", resultData);
                if (code === 0) {
                    try {
                        const jsonResult = JSON.parse(resultData);
                        resolve(jsonResult);
                    } catch (error) {
                        // console.error(`Error parsing JSON result: ${error.message}`);
                        reject(`Error parsing JSON result: ${error.message}`);
                    }
                } else {
                    reject(`Java process exited with code ${code}`);
                }
            });

            javaProcess.on('error', (error) => {
                reject(`Java Process Spawn Error: ${error.message}`);
            });
        });
    } catch (error) {
        console.error(`Error in retrieveRelevantData: ${error.message}`);
        throw error;
    }
}



async function retrieveRelevantData_Overlay(keyword, webid, zipPath, k) {
    try {
        // Spawn the Java process
        const javaProcess = spawn('java', [
            '-Xmx8g',
            '-Xms4g',
            '-cp',
            'LuceneSearcherOverlay-1.0-SNAPSHOT.jar',
            'com.mycompany.searcher.LuceneSearcherOverlay',
            keyword,
            k,
            zipPath
        ]);

        let resultData = '';

        // Listen to stdout from Java process
        javaProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        // Log any errors from the Java process
        javaProcess.stderr.on('data', (data) => {
            console.error(`Java Process Error: ${data.toString()}`);
        });

        // Return a Promise that resolves when the Java process exits
        return new Promise((resolve, reject) => {
            javaProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const jsonResult = JSON.parse(resultData);
                        resolve(jsonResult);
                    } catch (error) {
                        reject(`Error parsing JSON result: ${error.message}`);
                    }
                } else {
                    reject(`Java process exited with code ${code}`);
                }
            });

            javaProcess.on('error', (error) => {
                reject(`Java Process Spawn Error: ${error.message}`);
            });
        });
    } catch (error) {
        console.error(`Error in retrieveRelevantData_Overlay: ${error.message}`);
        throw error;
    }
}


function calculateMinMax(scores) {
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    return { min, max };
}

// Function to normalize a score using Min-Max normalization
function normalizeScore(score, min, max) {
    if (min === max) {
        console.warn(`Min and Max are equal (${min}). Assigning normalizedScore as 0.`);
        return 0;
    }
    return (score - min) / (max - min);
}

// Function to calculate the mean of an array
function calculateMean(scores) {
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return sum / scores.length;
}

// Function to calculate standard deviation of an array
function calculateStdDev(scores, mean) {
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
}

// Function to calculate Z-score for an individual score
function calculateZScore(score, mean, stdDev) {
    if (stdDev === 0) {
        console.warn('Standard deviation is 0. Assigning Z-score as 0.');
        return 0;
    }
    return (score - mean) / stdDev;
}

// Function to rank documents with totalHits === 1 by score
function rankSingleHitResults(singleHitResults) {
    return singleHitResults.flatMap(resultSet => resultSet[0].documents)
        .sort((a, b) => parseFloat(b.Score) - parseFloat(a.Score));
}

// Function to handle results with totalHits > 1
function processMultiHitResults(multiHitResults) {

        const normalizedMultiHitResults = multiHitResults.map(resultSet => {
            const scores = resultSet[0].documents
                .map(doc => parseFloat(doc.Score))
                .filter(score => !isNaN(score));

            if (scores.length === 0) {
                console.error('No valid scores in documents.');
                return resultSet[0];
            }

            const min = Math.min(...scores);
            const max = Math.max(...scores);

            return {
                ...resultSet[0],
                documents: resultSet[0].documents.map(doc => {
                    const parsedScore = parseFloat(doc.Score);
                    const normalizedScore = !isNaN(parsedScore) ? normalizeScore(parsedScore, min, max) : NaN;
                    return {...doc, normalizedScore};
                })
            };
        });

        const allNormalizedScores = normalizedMultiHitResults.flatMap(resultSet =>
            resultSet.documents.map(doc => doc.normalizedScore).filter(score => !isNaN(score))
        );

        if (allNormalizedScores.length === 0) {
            console.error('No valid normalized scores found.');
            return [];
        }

        const mean = calculateMean(allNormalizedScores);
        const stdDev = calculateStdDev(allNormalizedScores, mean);

        return normalizedMultiHitResults.flatMap(resultSet =>
            resultSet.documents.map(doc => {
                const zScore = !isNaN(doc.normalizedScore) ? calculateZScore(doc.normalizedScore, mean, stdDev) : NaN;
                return {...doc, zScore};
            })
        ).sort((a, b) => b.zScore - a.zScore);

}

// Function to merge, normalize, and re-rank results
function mergeAndRerank(results) {
    // Separate results with totalHits === 1 and totalHits > 1
    const singleHitResults = results.filter(resultSet => resultSet[0].totalHits === 1);
    const multiHitResults = results.filter(resultSet => resultSet[0].totalHits > 1);

    // Rank single-hit results by score
    const rankedSingleHitResults = rankSingleHitResults(singleHitResults);

    const rankedMultiHitResults =[];
    if(multiHitResults.length>0) {
        // Process and rank multi-hit results
        const rankedMultiHitResults = processMultiHitResults(multiHitResults);
    }

    // Combine ranked results
    return [...rankedSingleHitResults, ...rankedMultiHitResults];
}



// async function getData() {
//     try {
//         const data = await retrieveRelevantData("omega729", "httpexampleorgsagent3profilecardme", "https://srv03945.soton.ac.uk:3000/ESPRESSO/metaindex/httpexampleorgagent227profilecardme-servers.zip", "");
//         console.log(data);
//     } catch (error) {
//         console.error(`Error: ${error}`);
//     }
// }

// async function getDataOverlay() {
//     try {
//         const data = await retrieveRelevantData_Overlay("omega729", "httpexampleorgsagent0profilecardme", "/Users/ragab/Downloads/httpexampleorgsagent0profilecardme-servers.zip", "");
//         console.log(JSON.stringify(data,null,2));
//     } catch (error) {
//         console.error(`Error: ${error}`);
//     }
// }

// getData();
// getDataOverlay();

module.exports = {
    retrieveRelevantData, mergeAndRerank, retrieveRelevantData_Overlay
};


