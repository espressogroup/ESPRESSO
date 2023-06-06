declare const _default: typeof globalThis.fetch;
export default _default;
export declare const fetch: typeof globalThis.fetch, Response: {
    new (body?: BodyInit | null | undefined, init?: ResponseInit | undefined): Response;
    prototype: Response;
    error(): Response;
    redirect(url: string | URL, status?: number | undefined): Response;
}, Request: {
    new (input: URL | RequestInfo, init?: RequestInit | undefined): Request;
    prototype: Request;
}, Headers: {
    new (init?: HeadersInit | undefined): Headers;
    prototype: Headers;
};
