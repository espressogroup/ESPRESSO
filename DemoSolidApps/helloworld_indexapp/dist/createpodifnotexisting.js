import { getFile, saveFileInContainer, createSolidDataset, getSolidDataset, saveSolidDatasetAt, overwriteFile, fetch as solidFetch } from '@inrupt/solid-client';


async function checkEspressoPod(esppodAddress) {
    try {
        const res = await fetch(esppodAddress);
        return res.ok;
    } catch (error) {
        console.error('Error checking ESPRESSO Pod:', error);
        return false;
    }
}

async function createEspressoPod() {
    const IDP = 'http://localhost:3000';
    const esppodAddress = 'http://localhost:3000/ESPRESSO-Pod/';
    const registerEndpoint = 'http://localhost:3000/idp/register/';

    const espressopodname = 'ESPRESSO-Pod';
    const espressoemail = 'espressp@example.com';
    const password = '12345';

    const podExists = await checkEspressoPod(esppodAddress);

    if (!podExists) {
        console.log('Creating the ESPRESSO Pod');

        // POST request to register endpoint to create the ESPRESSO pod
        const res = await fetch(registerEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                createWebId: "on",
                webId: "",
                register: "on",
                createPod: "on",
                podName: espressopodname,
                email: espressoemail,
                password: password,
                confirmPassword: password
            }),
            timeout: 5000
        });

        if (res.ok) {
            const responseData = await res.json();
            console.log(responseData);
            console.log(`ESPRESSO pod created successfully at ${IDP}/${espressopodname}/`);
        } else {
            // Check if the response contains a message that indicates the pod was created
            const responseText = await res.text();
            if (res.status === 201 || responseText.includes('created')) {
                console.log(`ESPRESSO pod created successfully at ${IDP}/${espressopodname}/`);
            } else {
                console.log('Failed to create ESPRESSO pod' + res.status);
            }
        }
    } else {
        console.log(`ESPRESSO pod is present at ${IDP}/${espressopodname}/`);
    }
}



async function writeMetaIndex(indexUrl) {
    const podAddress = 'http://localhost:3000/ESPRESSO-Pod/';
    const metaIndexFile = 'Meta-Index';

    try {
        // Check if Meta-Index file exists
        let metaIndexDataset;
        try {
            metaIndexDataset = await getSolidDataset(podAddress + metaIndexFile, { fetch: solidFetch });
        } catch (error) {
            // If Meta-Index doesn't exist, create a new one
            metaIndexDataset = createSolidDataset();
        }

        // Get the content of the Meta-Index file
        let indexContent = '';
        const fileUrl = podAddress + metaIndexFile;
        try {
            const file = await getFile(fileUrl, { fetch: solidFetch });
            indexContent = await file.text();
        } catch (error) {
            // If Meta-Index file does not exist, it will throw a 404 error, so we handle it here
            indexContent = '';
        }

        // Append the new indexUrl to the existing content
        indexContent += indexUrl + '\n';

        // Create a new Blob with the updated content
        const updatedFile = new Blob([indexContent], { type: 'text/plain' });

        // Save or overwrite the Meta-Index file
        if (metaIndexDataset) {
            await overwriteFile(fileUrl, updatedFile, { fetch: solidFetch });
        } else {
            await saveFileInContainer(podAddress, updatedFile, { fetch: solidFetch, slug: metaIndexFile });
        }

        console.log(`Meta-Index updated successfully at ${podAddress}${metaIndexFile}`);
    } catch (error) {
        console.error('Error writing Meta-Index:', error);
    }
}

writeMetaIndex("http://localhost:3000/ragab/espresso-index/")

// Call the function to demonstrate its working
// createEspressoPod();
