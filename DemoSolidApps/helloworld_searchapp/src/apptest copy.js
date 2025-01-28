// app.js
const express = require('express');
const cors = require('cors');
const OverlayQueryExecutor = require('./OverlayQueryExecutor');

const app = express();
const port = 9000;
const queryExecutor = new OverlayQueryExecutor();

app.use(cors()); // Enable CORS
app.use(express.static('public'));
app.use(express.json());

// HTTP endpoint that uses OverlayQueryExecutor to run a query
app.post('/runQuery', (req, res) => {
    const query = req.body.query;
    queryExecutor.executeQuery(query, (error, result) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.send(`Result: ${result}`);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// Example: Calling executeQuery directly without a request
queryExecutor.executeQuery("SELECT * FROM example_table", (error, result) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`Direct call result: ${result}`);
    }
});
