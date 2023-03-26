const express = require('express')
const app = express()
const port = 3000
const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine();

app.get('/', async (req,res) => {
    const bindingsStream = await myEngine.queryBindings(`
  SELECT ?o WHERE 
  {?s ?p "Boom".
  ?s ?p ?o
     } LIMIT 100`, {
        sources: ['https://storage.inrupt.com/271193f6-926b-45c1-8fa8-b31cc03accb4/index.ttl'],
    });

    const bindings = await bindingsStream.toArray();
    res.json(bindings)
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
