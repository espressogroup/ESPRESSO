import { Logger } from '@comunica/types';
/**
 * A logger that voids everything.
 */
export declare class LoggerVoid extends Logger {
    debug(): void;
    error(): void;
    fatal(): void;
    info(): void;
    trace(): void;
    warn(): void;
}
