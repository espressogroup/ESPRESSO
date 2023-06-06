import type { IActionContext, ICliArgsHandler } from '@comunica/types';
import type { Argv } from 'yargs';
/**
 * Basic CLI arguments handler that handles common options.
 */
export declare class CliArgsHandlerBase implements ICliArgsHandler {
    private readonly initialContext?;
    constructor(initialContext?: IActionContext);
    static getScriptOutput(command: string, fallback: string): Promise<string>;
    static isDevelopmentEnvironment(): boolean;
    /**
     * Converts an URL like 'hypermedia@http://user:passwd@example.com to an IDataSource
     * @param {string} sourceString An url with possibly a type and authorization.
     * @return {[id: string]: any} An IDataSource which represents the sourceString.
     */
    static getSourceObjectFromString(sourceString: string): Record<string, any>;
    populateYargs(argumentsBuilder: Argv<any>): Argv<any>;
    handleArgs(args: Record<string, any>, context: Record<string, any>): Promise<void>;
}
