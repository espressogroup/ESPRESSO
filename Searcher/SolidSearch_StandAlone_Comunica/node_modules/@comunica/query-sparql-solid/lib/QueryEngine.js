"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryEngine = void 0;
const actor_init_query_1 = require("@comunica/actor-init-query");
const engineDefault = require('../engine-default.js');
/**
 * A Comunica SPARQL query engine.
 */
class QueryEngine extends actor_init_query_1.QueryEngineBase {
    constructor(engine = engineDefault) {
        super(engine);
    }
}
exports.QueryEngine = QueryEngine;
//# sourceMappingURL=QueryEngine.js.map