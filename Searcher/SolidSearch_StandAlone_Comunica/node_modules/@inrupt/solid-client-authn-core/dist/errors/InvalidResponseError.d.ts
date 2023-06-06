export declare class InvalidResponseError extends Error {
    readonly missingFields: string[];
    constructor(missingFields: string[]);
}
