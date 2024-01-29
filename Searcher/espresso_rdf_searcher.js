const express = require('express');
const app = express()
const port = 8081
const axios = require('axios');
const https = require("https");
const fs = require("fs");

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

//const certificate = fs.readFileSync('ca.pem');

//const httpsAgent = new https.Agent({
//    ca: certificate,
//    rejectUnauthorized: false});

//const axiosInstance = axios.create({httpsAgent});

async function readSources() {
    const urlArgument = process.argv[2];
    const metaIndexname=process.argv[3];
    const response = await axios.get(`https://${urlArgument}:3000/ESPRESSO/${metaIndexname}`, { responseType: 'blob' });
    const csvStr = response.data.toString();
    const result = csvStr.split("\r\n").filter(i => i.length > 0);

    return result;
}


app.get('/query', async (req, res) => {
let integratedResult = [];
const sources = await readSources();

const QueryEngine = require('@comunica/query-sparql-link-traversal-solid').QueryEngine;
const { interactiveLogin } = require('solid-node-interactive-auth');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


async function executeQuery() {
    try {
        // const session = await interactiveLogin({ oidcIssuer: 'https://srv03911.soton.ac.uk:3000/' });
        const myEngine = new QueryEngine();

        const webids = sources.map(source => {
            const webid = source.replace(/\/espressoindex\//, "/profile/card#me");
            return webid;
        });

        const {q}=req.query;
        console.log(webids);
        const bindingsStream = await myEngine.queryBindings(q,
            {
                // Sources field is optional. Will be derived from query if not provided.
                sources: webids, // Sets your profile as query source
                // Session is optional for authenticated requests
                //'@comunica/actor-http-inrupt-solid-client-authn:session': session,
                // The lenient flag will make the engine not crash on invalid documents
                lenient: true,
            });


        console.log("RESULTS ...")
        // bindingsStream.on('data', (binding) => {
        //     // Quick way to print bindings for testing
        //     console.log(binding.toString());
        //
        //     let resultRow = {};
        //
        //     for (const key in binding) {
        //         if (binding.hasOwnProperty(key)) {
        //             resultRow[key] = binding[key].value;
        //
        //         }
        //     }
        //
        //     // Add the result row to the integrated results array
        //     integratedResult.push(resultRow);
        //     console.log("Row added:", resultRow);
        //
        //
        //     // Obtaining values in the bindings..
        //     // integratedResult.push(binding.get('person').value);
        //     // integratedResult.push(binding.get('name').value);
        //     // integratedResult.push(binding.get('email').value);
        // });

        bindingsStream.on('data', (binding) => {
            console.log(binding.toString());
            try {
                // Parse the binding string as JSON
                let bindingJson = JSON.parse(binding.toString());

                // Add the parsed JSON to the integrated results array
                integratedResult.push(bindingJson);
            } catch (error) {
                console.error('Error parsing binding:', error);
            }
        });

        bindingsStream.on('end', () => {
            res.json(integratedResult);
        });



        bindingsStream.on('error', (error) => {
            console.error(error);
            res.status(500).send('Error processing query');
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error executing query');
    }
}

await executeQuery();


});
