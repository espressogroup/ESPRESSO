import { SolidNodeClient } from 'solid-node-client';
import fetch from "node-fetch";
import { createDpopHeader, generateDpopKeyPair } from '@inrupt/solid-client-authn-core';
import { buildAuthenticatedFetch } from '@inrupt/solid-client-authn-core';



import  fs from 'fs';
import path from  'path';

import * as $rdf from 'rdflib';


const client = new SolidNodeClient();

async function getAccessToken() {

    // This assumes your server is started under http://localhost:3000/.
    // This URL can also be found by checking the controls in JSON responses when interacting with the IDP API,
    // as described in the Identity Provider section.
    const response = await fetch('http://localhost:3000/idp/credentials/', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        // The email/password fields are those of your account.
        // The name field will be used when generating the ID of your token.
        body: JSON.stringify({email: 'mohamed.ragab@nub.edu.eg', password: '123', name: 'ragab-token'}),
    });

    const {id, secret} = await response.json();
    // console.log({id, secret})

    // A key pair is needed for encryption.
    // This function from `solid-client-authn` generates such a pair for you.
    const dpopKey = await generateDpopKeyPair();
    // These are the ID and secret generated in the previous step.
    // Both the ID and the secret need to be form-encoded.
    const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;

    // console.log(">>>",authString)
    //    console.log("<<<", dpopKey)

    // This URL can be found by looking at the "token_endpoint" field at
    // http://localhost:3000/.well-known/openid-configuration
    // if your server is hosted at http://localhost:3000/.
    const tokenUrl = 'http://localhost:3000/.oidc/token';

    // console.log(tokenUrl)

    const response1 = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            // The header needs to be in base64 encoding.
            authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
        },
        body: 'grant_type=client_credentials&scope=webid',
    });

    // This is the Access token that will be used to do an authenticated request to the server.
    // The JSON also contains an "expires_in" field in seconds,
    // which you can use to know when you need request a new Access token.
    const {access_token: accessToken} = await response1.json();

    return { dpopKey, accessToken };
}


    const { dpopKey, accessToken } = await getAccessToken();
    // The DPoP key needs to be the same key as the one used in the previous step.
    // The Access token is the one generated in the previous step.

    console.log({ dpopKey, accessToken })

    const authFetch = await buildAuthenticatedFetch(fetch, accessToken, { dpopKey });
    // authFetch can now be used as a standard fetch function that will authenticate as your WebID.




async function readFile(podUrl,fileName)
{
    // This request will do a simple GET for example.
    const request=podUrl+"/"+fileName;
    const response= await authFetch(request);
    const text = await response.text();
    console.log(text)
}


async function writeFile(podUrl,fileName,content)
{
    const request =podUrl+"/"+fileName;
    const response = await authFetch(request, {
        method: 'PUT',
        body: content,
        headers: {
            'Content-Type': 'text/plain'
        }
    });

    if (response.ok) {
        console.log('File written successfully.');
    } else {
        console.error('Failed to write file.');
    }

}

async function writeFilesToPod(files, podUrl) {
    for (const file of files) {
        const response = await authFetch(`${podUrl}/${file.name}`, {
            method: 'PUT',
            body: file.content,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        if (response.ok) {
            console.log(`File ${file.name} written successfully.`);
        } else {
            console.error(`Failed to write file ${file.name}.`);
        }
    }
}
async function writeFilesInDirToPod(directoryPath, podUrl) {

    const files = fs.readdirSync(directoryPath)
        .filter(file => path.extname(file) === '.txt')
        .map(file => ({
            name: file,
            content: fs.readFileSync(path.join(directoryPath, file), 'utf8')
        }));

    for (const file of files) {
        const response = await authFetch(`${podUrl}/${file.name}`, {
            method: 'PUT',
            body: file.content,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        if (response.ok) {
            console.log(`File ${file.name} written successfully.`);
        } else {
            console.error(`Failed to write file ${file.name}.`);
        }
    }
}
async function writeDirectoryToPod(directoryPath, podUrl) {
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
        const filePath = `${directoryPath}/${file}`;
        const directoryName = path.basename(directoryPath);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const fileUrl = `${podUrl}/${directoryName}/${file}`;
        const response = await authFetch(fileUrl, {
            method: 'PUT',
            body: fileContent,
            headers: { 'Content-Type': 'text/plain' }
        });
        if (response.ok) {
            console.log(`Wrote ${file} to ${fileUrl}`);
        } else {
            console.error(`Failed to write ${file} to ${fileUrl}: ${response.statusText}`);
        }
    }
}

async function deleteFileFromPod(fileUrl) {
    const response = await authFetch(fileUrl, { method: 'DELETE' });
    if (response.ok) {
        console.log(`Deleted ${fileUrl}`);
    } else {
        console.error(`Failed to delete ${fileUrl}: ${response.statusText}`);
    }
}


async function deleteDirectoryFromPod(directoryUrl) {
    // Get a list of all files and subdirectories in the given directory
    const fileList = await listDirectoryFiles(directoryUrl);

    // Recursively delete all files and subdirectories
    for (const fileUrl of fileList) {
        // If the file is a subdirectory, recursively delete it
        // console.log(">>>>",fileUrl)
        if (fileUrl.endsWith('/')) {
            await deleteDirectoryFromPod(fileUrl);
        } else {
            // Otherwise, delete the file
            await deleteFileFromPod(fileUrl);
        }
    }

    // Finally, delete the empty directory itself
    await authFetch(directoryUrl, {
        method: 'DELETE',
    });
}


async function listDirectoryFiles(directoryUrl) {
    const response = await authFetch(directoryUrl, {
        headers: { Accept: 'text/turtle' }
    });
    const data = await response.text();
    const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
    const store = $rdf.graph();
    $rdf.parse(data, store, directoryUrl, 'text/turtle');

    const fileList = store.each($rdf.sym(directoryUrl), LDP('contains'));

    //PRINT THEM OUT
    for (const file of fileList) {
        console.log(file.value)
    }

    return fileList.map(file => file.value);
}



listDirectoryFiles("http://localhost:3000/poody/")

// deleteDirectoryFromPod("http://localhost:3000/mypod/files/")

writeFile("http://localhost:3000/poody","myfile.txt","Besm Allah")



// deleteFileFromPod('http://localhost:3000/mypod',"file3.txt")
// writeDirectoryToPod('./files', 'http://localhost:3000/mypod');
// writeFilesInDirToPod("./files","http://localhost:3000/mypod")
// readFile("http://localhost:3000/mypod", "file1.txt")















