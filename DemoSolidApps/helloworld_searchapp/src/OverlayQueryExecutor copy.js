// OverlayQueryExecutor.js
const { exec } = require('child_process');
const path = require('path');

class OverlayQueryExecutor {
    constructor() {
        const paths = this.getPaths();
        this.GDBH = paths.GDBH;
        this.GDBL = paths.GDBL;
        this.CLASSPATH = this.getClassPath();
    }

    getPaths() {
        const GDBH = path.resolve(__dirname);
        const GDBL = path.join(GDBH, 'lib');
        return { GDBH, GDBL };
    }

    getClassPath() {
        return `${this.GDBL}/*:${process.env.HOME}/sqllib/java/db2jcc.jar:${process.env.HOME}/sqllib/java/db2jcc_license_cu.jar`;
    }

    constructJavaCommand(query) {
        const JAVA_CMD = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}/bin/java` : 'java';
        const JAVA_OPTS = process.env.JAVA_OPTS || '-Xmx128m';
        return `${JAVA_CMD} ${JAVA_OPTS} -cp "${this.CLASSPATH}" com.ibm.gaiandb.tools.SQLDerbyRunner "${query}"`;
    }

    parseQueryOutput(output) {
        const lines = output.split('\n');
        let results ;

        // Find the index of the header and start parsing from there
        const headerIndex = lines.findIndex(line => line.startsWith('================================================================'));

        if (headerIndex !== -1) {
            results=[];
            const header = lines[headerIndex + 1].trim().split('|').map(col => col.trim()).filter(Boolean);
            for (let i = headerIndex + 3; i < lines.length; i++) { // Start parsing after header and separator
                const row = lines[i].trim();
                if (row && !row.startsWith('Fetched') && !row.startsWith('=')) { // Ignore summary and separator lines
                    const values = row.split('|').map(col => col.trim()).filter(Boolean);
                    const rowObj = {};
                    header.forEach((col, index) => {
                        rowObj[col] = values[index] || null; // Map values to header columns
                    });
                    results.push(rowObj);
                }
            }
        }

        return results;
    }


    executeQuery(query, callback) {
        const javaCommand = this.constructJavaCommand(query);
        exec(
            javaCommand,
            { env: { ...process.env, GDBH: this.GDBH, GAIAN_WORKSPACE: this.GDBH, CLASSPATH: this.CLASSPATH }, maxBuffer: 1024 * 1024 * 10 },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    callback(`Error: ${stderr}`, null);
                    return;
                }
                const results = this.parseQueryOutput(stdout);
                callback(null, results);
            }
        );
    }
}

module.exports = OverlayQueryExecutor;
