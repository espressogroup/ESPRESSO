"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryEngineFactoryBase = void 0;
const runner_1 = require("@comunica/runner");
/**
 * A factory that can create query engines dynamically based on a given config.
 */
class QueryEngineFactoryBase {
    /**
     * @param moduleRootPath The path to the invoking module.
     * @param defaultConfigPath The path to the config file.
     * @param queryEngineWrapper Callback for wrapping a query init actor in a query engine.
     */
    constructor(moduleRootPath, defaultConfigPath, queryEngineWrapper) {
        this.moduleRootPath = moduleRootPath;
        this.defaultConfigPath = defaultConfigPath;
        this.queryEngineWrapper = queryEngineWrapper;
    }
    /**
     * Create a new Comunica query engine.
     * @param options Optional settings on how to instantiate the query engine.
     */
    async create(options = {}) {
        if (!options.mainModulePath) {
            // This makes sure that our configuration is found by Components.js
            options.mainModulePath = this.moduleRootPath;
        }
        const configResourceUrl = options.configPath ?? this.defaultConfigPath;
        const instanceUri = options.instanceUri ?? 'urn:comunica:default:init/actors#query';
        // Instantiate the main runner so that all other actors are instantiated as well,
        // and find the SPARQL init actor with the given name
        const runnerInstanceUri = options.runnerInstanceUri ?? 'urn:comunica:default:Runner';
        // This needs to happen before any promise gets generated
        const runner = await (0, runner_1.instantiateComponent)(configResourceUrl, runnerInstanceUri, options);
        const actorInitQuery = runner.collectActors({ engine: instanceUri }).engine;
        return this.queryEngineWrapper(actorInitQuery);
    }
}
exports.QueryEngineFactoryBase = QueryEngineFactoryBase;
//# sourceMappingURL=QueryEngineFactoryBase.js.map