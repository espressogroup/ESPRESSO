const express = require('express')
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express()
const port = 8080
const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine();
const fs = require('fs');

app.use(bodyParser.json())
app.post('/query', async (req, res) => {
    const start = new Date().getTime();
    const { keyword } = req.body;
    if (!keyword) {
        res.send("invalid keyword");
        return;
    }
    const sources = await readSources();
    const query = `
    PREFIX ns1: <http://example.org/SOLID/>
    SELECT  ?address ?frequency
    WHERE {
    ?x ns1:appearsIn
    [ ns1:address ?address ;
    ns1:frequency ?frequency ] ;
    ns1:lemma ?"${keyword}".  
    }  ORDER BY DESC(?frequency) 
  `;
    let integratedResult = [];
    for (let index = 0; index < sources.length; index++) {
        const source = sources[index];
        const bindingsStream = await myEngine.queryBindings(query, { sources:[source] });
        const bindings = await bindingsStream.toArray();
        const result = bindings.map(item => ({ "address": item.get('address').value, "frequency": item.get('frequency').value }))
        integratedResult = [...integratedResult,...result];
    }
    const end = new Date().getTime();
    fs.appendFileSync('log.txt', `------> Search APP  Total Execution Time: ${end-start} -- ${keyword} \n`);
    res.json(integratedResult)
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
const readSources = async () => {
    const response = await axios.get("https://cups3.ecs.soton.ac.uk:3000/ESPRESSO/exp_6s24p100fzipf.csv", { responseType: 'blob', });
    const csvStr = await response.data;
    const result = csvStr.split("\r\n").filter(i => i.length > 0);
    return result;
}
