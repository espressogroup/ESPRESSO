const express = require('express')
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express()
const port = 3000
const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine();

app.use(bodyParser.json())
app.post('/query', async (req, res) => {
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
    }  ORDER BY DESC(?frequency) LIMIT 100 
  `;
 const bindingsStream = await myEngine.queryBindings(query, { sources });
 const bindings = await bindingsStream.toArray();
 const result = bindings.map(item => ({ "address": item.get('address').value, "frequency": item.get('frequency').value }))
  res.json(result)
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
const readSources = async () => {
  const response = await axios.get("https://storage.inrupt.com/271193f6-926b-45c1-8fa8-b31cc03accb4/IndexSource-Address.csv", { responseType: 'blob', });
  const csvStr = await response.data;
  const result = csvStr.split("\r\n").filter(i => i.length > 0);
  return result;
}