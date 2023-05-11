import type { ISetupProperties } from '@comunica/runner';
import type { ActorInitQueryBase } from './ActorInitQueryBase';
import type { QueryEngineBase } from './QueryEngineBase';
/**
 * A factory that can create query engines dynamically based on a given config.
 */
export declare class QueryEngineFactoryBase<Q extends QueryEngineBase> {
    private readonly moduleRootPath;
    private readonly defaultConfigPath;
    private readonly queryEngineWrapper;
    /**
     * @param moduleRootPath The path to the invoking module.
     * @param defaultConfigPath The path to the config file.
     * @param queryEngineWrapper Callback for wrapping a query init actor in a query engine.
     */
    constructor(moduleRootPath: string, defaultConfigPath: string, queryEngineWrapper: (actorInitQuery: ActorInitQueryBase) => Q);
    /**
     * Create a new Comunica query engine.
     * @param options Optional settings on how to instantiate the query engine.
     */
    create(options?: IDynamicQueryEngineOptions): Promise<Q>;
}
export interface IDynamicQueryEngineOptions extends ISetupProperties {
    /**
     * The path or URL to a Components.js config file.
     */
    configPath?: string;
    /**
     * A URI identifying the component to instantiate.
     */
    instanceUri?: string;
    /**
     * A URI identifying the runner component.
     */
    runnerInstanceUri?: string;
}
