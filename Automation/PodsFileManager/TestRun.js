import { PodClient } from './PodClient.js';
import {FileManager} from "./FileManager.js";
import fetch from "node-fetch";

import { buildAuthenticatedFetch } from '@inrupt/solid-client-authn-core';

class App {
    async run() {
        const podclient = new PodClient("http://localhost:3000","mohamed.ragab@nub.edu.eg","123");
        const { dpopKey, accessToken } = await podclient.getAccessToken();
        const authFetch = await buildAuthenticatedFetch(fetch, accessToken, { dpopKey });


        let fileManager = new FileManager(authFetch);

        // fileManager.writeFile("http://localhost:3000/poody","myfile2.txt","Besm Allah")
        // fileManager.writeDirectoryToPod("./files","http://localhost:3000/poody")
        fileManager.listDirectoryFiles("http://localhost:3000/poody/files/")

    }
}

const app = new App();
app.run();
