import  fs from 'fs';
import path from  'path';
import * as $rdf from 'rdflib';
export class FileManager {
    constructor(authFetch) {
        this.authFetch = authFetch;
    }

    async readFile(podUrl, fileName) {
        const request = `${podUrl}/${fileName}`;
        const response = await this.authFetch(request);
        const text = await response.text();
        console.log(text);
    }

    async writeFile(podUrl, fileName, content) {
        const request = `${podUrl}/${fileName}`;
        const response = await this.authFetch(request, {
            method: 'PUT',
            body: content,
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        if (response.ok) {
            console.log('File written successfully.');
        } else {
            console.error('Failed to write file.',response);
        }
    }

    async writeFilesToPod(files, podUrl) {
        for (const file of files) {
            const response = await this.authFetch(`${podUrl}/${file.name}`, {
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
    async writeFilesInDirToPod(directoryPath, podUrl) {
        const files = fs.readdirSync(directoryPath)
            .filter(file => path.extname(file) === '.txt')
            .map(file => ({
                name: file,
                content: fs.readFileSync(path.join(directoryPath, file), 'utf8')
            }));

        for (const file of files) {
            const response = await this.authFetch(`${podUrl}/${file.name}`, {
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
    async writeDirectoryToPod(directoryPath, podUrl) {
        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
            const filePath = `${directoryPath}/${file}`;
            const directoryName = path.basename(directoryPath);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const fileUrl = `${podUrl}/${directoryName}/${file}`;
            const response = await this.authFetch(fileUrl, {
                method: 'PUT',
                body: fileContent,
                headers: { 'Content-Type': 'text/plain'},
            });
            if (response.ok) {
                console.log(`Wrote ${file} to ${fileUrl}`);
            } else {
                console.error(`Failed to write ${file} to ${fileUrl}: ${response.statusText}`);
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

        const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#');
        const store = $rdf.graph();

        $rdf.parse(data, store, directoryUrl, 'text/turtle');

        const fileList = store.each($rdf.sym(directoryUrl), LDP('contains'));

        for (const file of fileList) {
            console.log(file.value)
        }

        return fileList.map(file => file.value);
    }




}
