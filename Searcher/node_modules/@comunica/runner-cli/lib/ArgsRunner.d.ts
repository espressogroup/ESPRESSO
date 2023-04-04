/// <reference types="node" />
import type { ISetupProperties } from '@comunica/runner';
import type { IActionContext } from '@comunica/types';
export declare function runArgs(configResourceUrl: string, argv: string[], stdin: NodeJS.ReadStream, stdout: NodeJS.WriteStream, stderr: NodeJS.WriteStream, exit: (code?: number) => void, env: NodeJS.ProcessEnv, runnerUri?: string, properties?: ISetupProperties, context?: IActionContext): void;
export declare function runArgsInProcess(moduleRootPath: string, defaultConfigPath: string, options?: {
    context: IActionContext;
    onDone?: () => void;
}): void;
export declare function runArgsInProcessStatic(actor: any, options?: {
    context: IActionContext;
    onDone?: () => void;
}): void;
