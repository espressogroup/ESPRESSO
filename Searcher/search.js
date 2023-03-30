const express = require('express')
const app = express()
const port = 3000
const QueryEngine = require('@comunica/query-sparql').QueryEngine;
const myEngine = new QueryEngine();

app.get('/', async (req,res) => {
    const bindingsStream = await myEngine.queryBindings(
        `
        PREFIX ns1: <http://example.org/SOLID/>
        SELECT  ?address ?frequency
        WHERE {
        ?x ns1:appearsIn
        [ ns1:address ?address ;
        ns1:frequency ?frequency ] ;
        ns1:lemma 'coffee'.
        } LIMIT 10
        `, {
        sources: ['https://storage.inrupt.com/271193f6-926b-45c1-8fa8-b31cc03accb4/index.ttl'],
    });

    const bindings = await bindingsStream.toArray();
    res.json(bindings)
})


//Yury's Solution after Fixing Syntax
// app.get('/', async (req,res) => {
//     const bindingsStream = await myEngine.queryBindings(
//         `
//         PREFIX ns1: <http://example.org/SOLID/>
//         SELECT  ?a ?f
//         WHERE {
//            ?s1 ns1:lemma 'coffee'.
//            ?s1 ns1:appearsIn ?s2.
//            ?s2 ns1:address ?a.
//            ?s2 ns1:frequency ?f.
//         } LIMIT 100
//         `, {
//         sources: ['https://storage.inrupt.com/271193f6-926b-45c1-8fa8-b31cc03accb4/index.ttl'],
//     });
//
//     const bindings = await bindingsStream.toArray();
//     res.json(bindings)
// })


app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
