import type { ICliArgsHandler } from '@comunica/types';
import type { Argv } from 'yargs';
/**
 * CLI arguments handler that handles options for query execution.
 */
export declare class CliArgsHandlerQuery implements ICliArgsHandler {
    private readonly defaultQueryInputFormat;
    private readonly queryString;
    private readonly context;
    private readonly allowNoSources;
    constructor(defaultQueryInputFormat: string | undefined, queryString: string | undefined, context: string | undefined, allowNoSources: boolean | undefined);
    populateYargs(argumentsBuilder: Argv<any>): Argv<any>;
    handleArgs(args: Record<string, any>, context: Record<string, any>): Promise<void>;
}
