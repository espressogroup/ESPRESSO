import type { IriString } from "./interfaces";
/**
 * @hidden
 * @param inputUrl The URL to normalize
 * @param options If trailingSlash is set, a trailing slash will be respectively added/removed.
 * The input URL trailing slash is left unchanged if trailingSlash is undefined.
 * @returns the normalized URL, without relative components, slash sequences, and proper trailing slash.
 */
export declare function normalizeUrl(inputUrl: IriString, options?: {
    trailingSlash?: boolean;
}): IriString;
