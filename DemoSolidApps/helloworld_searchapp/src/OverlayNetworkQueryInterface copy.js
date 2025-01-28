const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 9000;

app.use(cors()); // Enable CORS
app.use(express.static('public'));
app.use(express.json());

app.post('/runQuery', (req, res) => {
    const query = req.body.query;
    const GDBH = path.resolve(__dirname);
    const GDBL = path.join(GDBH, 'lib');
    const JAVA_CMD = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}/bin/java` : 'java';
    const JAVA_OPTS = process.env.JAVA_OPTS || '-Xmx128m';

    // Prepare CLASSPATH
    let CLASSPATH = `${GDBL}/*:${process.env.HOME}/sqllib/java/db2jcc.jar:${process.env.HOME}/sqllib/java/db2jcc_license_cu.jar`;

    const javaCommand = `${JAVA_CMD} ${JAVA_OPTS} -cp "${CLASSPATH}" com.ibm.gaiandb.tools.SQLDerbyRunner "${query}"`;

    exec(javaCommand, { env: { ...process.env, GDBH, GAIAN_WORKSPACE: GDBH, CLASSPATH }, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        res.send(`Result: ${stdout}`);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

