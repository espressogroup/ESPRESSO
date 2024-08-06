const express = require('express');
const app = express();
const fs = require('fs');
const net = require('net');
const cors = require('cors');
const bodyParser = require('body-parser');

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Function to check if a GainDB_node service is running on a specific port
function checkLocalService(port, host = '127.0.0.1') {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        socket.setTimeout(3000); // 3-second timeout

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, host);
    });
}

// Endpoint to check service status
app.get('/checkServiceStatus', async (req, res) => {
    try {
        const isServiceRunning = await checkLocalService(6414);
        res.json({ isServiceRunning });
    } catch (error) {
        console.error('Error checking service status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to append index_url to a CSV file
app.post('/appendIndexUrlToCsv', (req, res) => {
    const { index_url } = req.body;

    if (!index_url) {
        return res.status(400).json({ error: 'Missing index_url in request body' });
    }

    const csvFilePath = '/Users/ragab/EspressoProjRagabTests/GaianDB_Keyword_Search_SourceCode/installConfig/csvtestfiles/espresso.csv';

    // Check if the file exists
    fs.access(csvFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If file doesn't exist, create it with headers
            const headers = 'index_url\n';
            fs.writeFile(csvFilePath, headers, (err) => {
                if (err) {
                    console.error('Error creating CSV file:', err);
                    return res.status(500).json({ error: 'Failed to create CSV file' });
                }
                // Append the index_url to the CSV file
                appendIndexUrl(csvFilePath, index_url, res);
            });
        } else {
            // File already exists, check if index_url exists
            fs.readFile(csvFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading CSV file:', err);
                    return res.status(500).json({ error: 'Failed to read CSV file' });
                }

                // Check if index_url already exists in the file
                if (data.includes(index_url)) {
                    return res.json({ message: 'index_url already exists in CSV file' });
                }

                // Append the index_url to the CSV file
                appendIndexUrl(csvFilePath, index_url, res);
            });
        }
    });
});

// Function to append index_url to CSV file
function appendIndexUrl(filePath, index_url, res) {
    fs.appendFile(filePath, `${index_url}\n`, (err) => {
        if (err) {
            console.error('Error appending index_url to CSV file:', err);
            return res.status(500).json({ error: 'Failed to append index_url to CSV file' });
        }
        console.log(`Successfully appended ${index_url} to ${filePath}`);
        res.json({ message: `Successfully appended ${index_url} to CSV file` });
    });
}


// Endpoint to read content of CSV file (for testing purposes)
app.get('/readCsvFile', (req, res) => {
    const csvFilePath = '/Users/ragab/EspressoProjRagabTests/GaianDB_Keyword_Search_SourceCode/installConfig/csvtestfiles/espresso.csv';

    fs.readFile(csvFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file:', err);
            return res.status(500).json({ error: 'Failed to read CSV file' });
        }

        res.send(data);
    });
});


// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});


