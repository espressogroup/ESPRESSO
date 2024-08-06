import { SolidClientError } from "./interfaces";
/**
 * IRIs of the XML Schema data types we support
 */
export declare const xmlSchemaTypes: {
    readonly boolean: "http://www.w3.org/2001/XMLSchema#boolean";
    readonly dateTime: "http://www.w3.org/2001/XMLSchema#dateTime";
    readonly date: "http://www.w3.org/2001/XMLSchema#date";
    readonly time: "http://www.w3.org/2001/XMLSchema#time";
    readonly decimal: "http://www.w3.org/2001/XMLSchema#decimal";
    readonly integer: "http://www.w3.org/2001/XMLSchema#integer";
    readonly string: "http://www.w3.org/2001/XMLSchema#string";
    readonly langString: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";
};
export type XmlSchemaTypeIri = (typeof xmlSchemaTypes)[keyof typeof xmlSchemaTypes];
/**
 * Time type for time data type attributes
 *
 * @since 1.10.0
 */
export type Time = {
    hour: number;
    minute: number;
    second: number;
    millisecond?: number;
    timezoneHourOffset?: number;
    timezoneMinuteOffset?: number;
};
/**
 * This error is thrown when a given value is not a proper URL.
 */
export declare class ValidUrlExpectedError extends SolidClientError {
    readonly receivedValue: unknown;
    constructor(receivedValue: unknown);
}
