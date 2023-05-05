"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorDereferenceRdfParse = void 0;
const bus_dereference_rdf_1 = require("@comunica/bus-dereference-rdf");
/**
 * A comunica Parse Dereference RDF Actor.
 */
class ActorDereferenceRdfParse extends bus_dereference_rdf_1.ActorDereferenceRdf {
    /**
     * @param args - @defaultNested {{
     *   "ttl":      "text/turtle",
     *   "turtle":   "text/turtle",
     *   "shaclc":   "text/shaclc",
     *   "shc":      "text/shaclc",
     *   "shaclce":  "text/shaclc-ext",
     *   "shce":     "text/shaclc-ext",
     *   "nt":       "application/n-triples",
     *   "ntriples": "application/n-triples",
     *   "nq":       "application/n-quads",
     *   "nquads":   "application/n-quads",
     *   "rdf":      "application/rdf+xml",
     *   "rdfxml":   "application/rdf+xml",
     *   "owl":      "application/rdf+xml",
     *   "n3":       "text/n3",
     *   "trig":     "application/trig",
     *   "jsonld":   "application/ld+json",
     *   "json":     "application/json",
     *   "html":     "text/html",
     *   "htm":      "text/html",
     *   "xhtml":    "application/xhtml+xml",
     *   "xht":      "application/xhtml+xml",
     *   "xml":      "application/xml",
     *   "svg":      "image/svg+xml",
     *   "svgz":     "image/svg+xml"
     * }} mediaMappings
     */
    constructor(args) {
        super(args);
    }
    async getMetadata(dereference) {
        return { baseIRI: dereference.url };
    }
}
exports.ActorDereferenceRdfParse = ActorDereferenceRdfParse;
//# sourceMappingURL=ActorDereferenceRdfParse.js.map