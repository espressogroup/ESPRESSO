import { PodClient } from './PodClient.js';
import {FileManager} from "./FileManager.js";
import fetch from "node-fetch";

import { buildAuthenticatedFetch } from '@inrupt/solid-client-authn-core';

class App {
    async run() {
        const podclient = new PodClient("https://srv03912.soton.ac.uk:3000","LTQP2@example.org","12345");
        const { dpopKey, accessToken } = await podclient.getAccessToken();
        const authFetch = await buildAuthenticatedFetch(fetch, accessToken, { dpopKey });


        let fileManager = new FileManager(authFetch);

        // fileManager.writeFile("http://localhost:3000/poody","myfile2.txt","Besm Allah")
        // fileManager.writeDirectoryToPod("./files","http://localhost:3000/poody")
        fileManager.listDirectoryFiles("https://srv03912.soton.ac.uk:3000/LTQP2/")

    }
}

const app = new App();
app.run();
