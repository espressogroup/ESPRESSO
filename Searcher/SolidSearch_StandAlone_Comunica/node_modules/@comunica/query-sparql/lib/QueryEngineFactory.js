"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryEngineFactory = void 0;
const actor_init_query_1 = require("@comunica/actor-init-query");
const QueryEngine_1 = require("./QueryEngine");
/**
 * A factory that can create query engines dynamically based on a given config.
 */
class QueryEngineFactory extends actor_init_query_1.QueryEngineFactoryBase {
    constructor() {
        super(`${__dirname}/../`, `${__dirname}/../config/config-default.json`, actorInitQuery => new QueryEngine_1.QueryEngine(actorInitQuery));
    }
}
exports.QueryEngineFactory = QueryEngineFactory;
//# sourceMappingURL=QueryEngineFactory.js.map