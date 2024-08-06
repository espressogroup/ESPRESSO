const { interactiveLogin } = require('solid-node-interactive-auth');
const PodClient = require("./PodClient");
const FileManager= require ("./FileManager.js");

const { buildAuthenticatedFetch } = require('@inrupt/solid-client-authn-core');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function executeQuery() {

    try {
        const PodClient = require('./PodClient.js');
        // const podclient = new PodClient("https://srv03916.soton.ac.uk:3000","combtest2@example.org","12345");
        const podclient = new PodClient("http://localhost:3000/","mr@email.org","12345");
        const {dpopKey, accessToken} = await podclient.getAccessToken();
        const authFetch = await buildAuthenticatedFetch(fetch, accessToken, {dpopKey});

        console.log({dpopKey, accessToken} );

        let fileManager = new FileManager(authFetch);




    } catch (error) {
        console.error('Execution error:', error);
    }

}

executeQuery();