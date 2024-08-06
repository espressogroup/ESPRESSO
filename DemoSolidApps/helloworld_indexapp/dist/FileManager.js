const  fs = require ('fs');
const path = require ('path');
const rdf = require( 'rdflib');
class FileManager {
    constructor(authFetch) {
        this.authFetch = authFetch;
    }

    async readFile(podUrl, fileName) {
        const request = `${podUrl}/${fileName}`;
        const response = await this.authFetch(request);
        const text = await response.text();
        console.log(text);
        return text;
    }

    async writeFile(podUrl, fileName, content, isRDF=false) {
        const request = `${podUrl}/${fileName}`;
        const response = await this.authFetch(request, {
            method: 'PUT',
            body: content,
            headers: {
                'Content-Type': isRDF? 'text/turtle' : 'text/plain'
            }
        });

        if (response.ok) {
            console.log('File written successfully.');
        } else {
            console.error('Failed to write file.',response);
        }
    }

    async writeFilesToPod(files, podUrl, isRdf=false) {
        for (const file of files) {
            const response = await this.authFetch(`${podUrl}/${file.name}`, {
                method: 'PUT',
                body: file.content,
                headers: {
                    'Content-Type': isRdf ? 'text/turtle' : 'text/plain'
                }
            });
            if (response.ok) {
                console.log(`File ${file.name} written successfully.`);
            } else {
                console.error(`Failed to write file ${file.name}.`);
            }
        }
    }


    async writeCsvToPod(localCsvPath, podUrl, podFileName) {
        // Read the CSV file content
        const csvContent = fs.readFileSync(localCsvPath, 'utf8');

        // Construct the request URL
        const requestUrl = `${podUrl}/${podFileName}`;

        // Write the CSV content to the pod
        try {
            const response = await this.authFetch(requestUrl, {
                method: 'PUT',
                body: csvContent,
                headers: {
                    'Content-Type': 'text/csv'
                }
            });

            if (response.ok) {
                console.log('CSV file written successfully to the pod.');
            } else {
                // Extract additional error details
                const status = response.status;
                const statusText = response.statusText;
                const errorBody = await response.text(); // Or response.json() if the response is in JSON format

                console.error('Failed to write CSV file to the pod.');
                console.error(`Status: ${status}`);
                console.error(`Status Text: ${statusText}`);
                console.error(`Error Body: ${errorBody}`);
            }
        } catch (error) {
            // Handle network or other unexpected errors
            console.error('An error occurred while writing to the pod:', error.message);
        }
    }


    // async writeCsvToPod(localCsvPath, podUrl, podFileName) {
    //     // Read the CSV file content
    //     const csvContent = fs.readFileSync(localCsvPath, 'utf8');
    //
    //     // Construct the request URL
    //     const requestUrl = `${podUrl}/${podFileName}`;
    //
    //     // Write the CSV content to the pod
    //     const response = await this.authFetch(requestUrl, {
    //         method: 'PUT',
    //         body: csvContent,
    //         headers: {
    //             'Content-Type': 'text/csv'
    //         }
    //     });
    //
    //     if (response.ok) {
    //         console.log('CSV file written successfully to the pod.');
    //     } else {
    //         console.error('Failed to write CSV file to the pod.', response.statusText);
    //     }
    // }

    async writeFilesInDirToPod(directoryPath, podUrl) {
        const files = fs.readdirSync(directoryPath)
            .filter(file => !file.startsWith('.DS_Store'))
            .map(file => ({
                name: file,
                content: fs.readFileSync(path.join(directoryPath, file), 'utf8')
            }));

        for (const file of files) {
            const extension = path.extname(file.name);
            let contentType = 'text/plain';

            if (!extension) {
                // No extension, assume N-Triples
                contentType = 'application/n-triples';
            } else if (extension === '.ttl') {
                // Turtle file
                contentType = 'text/turtle';
            }
            // Add more conditions for other RDF formats if necessary

            const response = await this.authFetch(`${podUrl}/${file.name}`, {
                method: 'PUT',
                body: file.content,
                headers: { 'Content-Type': contentType }
            });

            if (response.ok) {
                console.log(`File ${file.name} written successfully.`);
            } else {
                console.error(`Failed to write file ${file.name}.`);
            }
        }
    }

    async updateRdfFile(podUrl, fileName, newTriples) {
        // Read the existing content
        const fileContent = await this.readFile(podUrl, fileName);

        // Append new triples to the content
        const updatedContent = fileContent.toString().trim() + '\n' + newTriples.join('\n')+ '\n';

        // Write the updated content back to the file
        await this.writeFile(podUrl, fileName, updatedContent, true);
    }





    // async writeDirectoryToPod(directoryPath, podUrl) {
    //     const files = fs.readdirSync(directoryPath);
    //     for (const file of files) {
    //         const filePath = `${directoryPath}/${file}`;
    //         const directoryName = path.basename(directoryPath);
    //         const fileContent = fs.readFileSync(filePath, 'utf8');
    //         const fileUrl = `${podUrl}/${directoryName}/${file}`;
    //         const response = await this.authFetch(fileUrl, {
    //             method: 'PUT',
    //             body: fileContent,
    //             headers: { 'Content-Type': 'text/plain'},
    //         });
    //         if (response.ok) {
    //             console.log(`Wrote ${file} to ${fileUrl}`);
    //         } else {
    //             console.error(`Failed to write ${file} to ${fileUrl}: ${response.statusText}`);
    //         }
    //     }
    // }


    async writeDirectoryToPod(directoryPath, podUrl, isRDF = false) {
        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
            const filePath = `${directoryPath}/${file}`;
            const directoryName = path.basename(directoryPath);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // Determine the file name to use in the pod URL
            let fileName = file;
            if (isRDF) {
                const fileExtension = path.extname(file);
                fileName = file.replace(fileExtension, ''); // Remove the extension for RDF files
            }
            const fileUrl = `${podUrl}/${directoryName}/${fileName}`;

            // Set the content type
            let contentType = 'text/plain'; // Default content type
            if (isRDF) {
                contentType = 'text/turtle'; // Set RDF content type
            } else {
                // Handle other file types if necessary
            }

            const response = await this.authFetch(fileUrl, {
                method: 'PUT',
                body: fileContent,
                headers: { 'Content-Type': contentType },
            });

            if (response.ok) {
                console.log(`Wrote ${fileName} to ${fileUrl}`);
            } else {
                console.log(`Failed to write ${fileName} to ${fileUrl}: ${response.statusText}`);
            }
        }
    }




    async deleteFileFromPod(fileUrl) {
        const response = await this.authFetch(fileUrl, {method: 'DELETE'});
        if (response.ok) {
            console.log(`Deleted ${fileUrl}`);
        } else {
            console.error(`Failed to delete ${fileUrl}: ${response.statusText}`);
        }
    }
    async deleteDirectoryFromPod(directoryUrl) {
        // Get a list of all files and subdirectories in the given directory
        const fileList = await this.listDirectoryFiles(directoryUrl);

        // Recursively delete all files and subdirectories
        for (const fileUrl of fileList) {
            // If the file is a subdirectory, recursively delete it
            if (fileUrl.endsWith('/')) {
                await this.deleteDirectoryFromPod(fileUrl);
            } else {
                // Otherwise, delete the file
                await this.deleteFileFromPod(fileUrl);
            }
        }

        // Finally, delete the empty directory itself
        await this.authFetch(directoryUrl, {
            method: 'DELETE',
        });
    }
    async listDirectoryFiles(directoryUrl) {
        const response = await this.authFetch(directoryUrl, {
            headers: { Accept: 'text/turtle' }
        });

        const data = await response.text();

        const LDP = rdf.Namespace('http://www.w3.org/ns/ldp#');
        const store = rdf.graph();

        rdf.parse(data, store, directoryUrl, 'text/turtle');

        const fileList = store.each(rdf.sym(directoryUrl), LDP('contains'));

        for (const file of fileList) {
            console.log(file.value)
        }

        return fileList.map(file => file.value);
    }

    async writeRdfFileToPod(localRdfPath, podUrl, podFileName) {
        // Read the RDF file content from the local file system
        try {
            const rdfContent = await fs.promises.readFile(localRdfPath, 'utf8');

            // Use the existing writeFile method to write the RDF content to the Pod
            // Assuming RDF content is Turtle format
            await this.writeFile(podUrl, podFileName, rdfContent, true);

            console.log(`RDF file ${podFileName} written successfully to the Pod.`);
        } catch (error) {
            console.error(`Failed to read RDF file from ${localRdfPath} or write it to the Pod:`, error.message);
        }
    }




}

module.exports = FileManager;