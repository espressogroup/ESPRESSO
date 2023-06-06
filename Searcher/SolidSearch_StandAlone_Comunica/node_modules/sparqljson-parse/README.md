# SPARQL-Results+JSON Parse

[![Build status](https://github.com/rubensworks/sparqljson-parse.js/workflows/CI/badge.svg)](https://github.com/rubensworks/sparqljson-parse.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/sparqljson-parse.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/sparqljson-parse.js?branch=master)
[![npm version](https://badge.fury.io/js/sparqljson-parse.svg)](https://www.npmjs.com/package/sparqljson-parse)

A utility package that allows you to parse [SPARQL JSON](https://www.w3.org/TR/sparql11-results-json/) results
in a convenient [RDF/JS](https://rdf.js.org/)-based datastructure.

For example, the following SPARQL JSON result can be converted as follows:

In:
```json
{
  "head": {
    "vars": [
      "book"
      ]
  },
  "results": {
    "bindings": [
      { "book": { "type": "uri", "value": "http://example.org/book/book1" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book2" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book3" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book4" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book5" } },
      {
        "book": {
          "type": "triple",
          "value": {
            "subject": {
              "type": "uri",
              "value": "http://example.org/alice"
            },
            "predicate": {
              "type": "uri",
              "value": "http://example.org/name"
            }
          }
        }
      }
    ]
  }
}
```

Out:
```javascript
[
  { '?book': namedNode('http://example.org/book/book1') },
  { '?book': namedNode('http://example.org/book/book2') },
  { '?book': namedNode('http://example.org/book/book3') },
  { '?book': namedNode('http://example.org/book/book4') },
  { '?book': namedNode('http://example.org/book/book5') },
    { '?book': quad(namedNode('http://example.org/bob'), namedNode('http://example.org/name'), literal('Bob', namedNode('http://example.org/Type'))) },
]
```

Where `namedNode` is an RDF/JS named node, `quad` is an RDF/JS quad/triple, and `literal` is an RDF/JS literal.

This library automatically converts all SPARQL JSON result values to their respective RDF/JS type.

## Usage

### Create a new parser

```javascript
import {SparqlJsonParser} from "sparqljson-parse";

const sparqlJsonParser = new SparqlJsonParser();
```

Optionally, you can provide a settings object to the constructor with optional parameters:
```javascript
const sparqlJsonParser = new SparqlJsonParser({
  dataFactory: dataFactory, // A custom RDFJS datafactory
  prefixVariableQuestionMark: true, // If variable names in the output should be prefixed with '?', default is false.
});
```

### Convert single bindings

```javascript
sparqlJsonParser.parseJsonBindings({ "book": { "type": "uri", "value": "http://example.org/book/book1" } })
// This will output { '?book': namedNode('http://example.org/book/book1') }
```

### Convert a full SPARQL JSON response

```javascript
const sparqlJsonresponse = {
                             "head": {
                               "vars": [
                                 "book"
                                 ]
                             },
                             "results": {
                               "bindings": [
                                 { "book": { "type": "uri", "value": "http://example.org/book/book1" } }
                               ]
                             }
                           };
sparqlJsonParser.parseJsonResults(sparqlJsonresponse);
// This will output [ { '?book': namedNode('http://example.org/book/book1') } ]
```

### Convert a full SPARQL JSON boolean response

```javascript
const sparqlJsonresponse = {
                             "head": {},
                             "boolean": true
                           };
sparqlJsonParser.parseJsonBoolean(sparqlJsonresponse);
// This will output true
```

### Convert a SPARQL JSON stream

If you have many query results, then a streaming-based approach might be more efficient.
In this case, you can use the `sparqlJsonParser.parseJsonResultsStream` method,
which takes a Node readable stream of SPARQL JSON results as a text stream,
and outputs a stream of parsed bindings.

Optionally, you can also retrieve the variables inside the `head`
as follows by listening to the `variables` event:
```
sparqlJsonParser.parseJsonResultsStream(myStream)
    .on('variables', (variables: RDF.Variable[]) => console.log(variables))
    .on('data', (bindings: IBindings) => console.log(bindings));
```

`sparqlJsonParser.parseJsonBooleanStream` also takes a stream as input,
but it returns a promise that resolves to a boolean.

### Advanced: metadata entries

This library can recognise metadata on the result stream in the following form:

```json
{
  "head": { "vars": [ "book", "library" ] },
  "results": {
    "bindings": [
      { "book": { "type": "uri", "value": "http://example.org/book/book1" }, "library": { "type": "uri", "value": "http://example.org/book/library1" } }
    ]
  },
  "metadata": { "httpRequests": 0 }
}
```

This metadata can be captured by listening to the `"metadata"` event:
```
sparqlJsonParser.parseJsonResultsStream(myStream)
    .on('metadata', (metadata: any) => console.log(metadata))
    .on('data', (bindings: IBindings) => console.log(bindings));
```

Note that this is not part of the SPARQL/JSON specification.

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
