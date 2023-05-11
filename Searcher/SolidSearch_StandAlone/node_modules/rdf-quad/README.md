# RDF Quad

[![npm version](https://badge.fury.io/js/rdf-quad.svg)](https://www.npmjs.com/package/rdf-quad)

A convenience constructor for RDF quads based on string-based terms, as done by [RDF-String](https://github.com/rubensworks/rdf-string.js).

If the value in the object position is not a string,
then it will be automatically converted to the proper RDF datatype using [RDF Literal](https://github.com/rubensworks/rdf-literal.js).

This produces quads according to the [RDFJS](https://github.com/rdfjs/representation-task-force/) specification.

## Usage

```javascript
const quad = require('rdf-quad');

// Object is an IRI
quad('http://example.org/subject', 'http://example.org/predicate', 'http://example.org/object');

// Object is a variable
quad('http://example.org/subject', 'http://example.org/predicate', '?variable');

// Object is a string literal
quad('http://example.org/subject', 'http://example.org/predicate', '"myString"', 'http://example.org/someGraph');

// Object is an integer
quad('http://example.org/subject', 'http://example.org/predicate', 123);

// Object is a boolean
quad('http://example.org/subject', 'http://example.org/predicate', true);

// Subject is a nested quad
quad('<<ex:s ex:p ex:o>>', 'http://example.org/predicate', 'http://example.org/object');
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
