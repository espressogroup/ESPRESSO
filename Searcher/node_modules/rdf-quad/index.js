var factory = new (require('rdf-data-factory').DataFactory)();
var RdfTerm = require('rdf-string');
var toRdfLiteral = require("rdf-literal").toRdf;

module.exports = function(s, p, o, g) {
  return factory.quad(
    RdfTerm.stringToTerm(s),
    RdfTerm.stringToTerm(p),
    typeof o === 'string' ? RdfTerm.stringToTerm(o) : toRdfLiteral(o),
    g ? RdfTerm.stringToTerm(g) : factory.defaultGraph()
  );
};

