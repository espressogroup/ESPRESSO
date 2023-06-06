declare const _default: typeof globalThis.fetch;
export default _default;
export declare const fetch: typeof globalThis.fetch, Request: {
    new (input: RequestInfo | URL, init?: RequestInit | undefined): Request;
    prototype: Request;
}, Response: {
    new (body?: BodyInit | null | undefined, init?: ResponseInit | undefined): Response;
    prototype: Response;
    error(): Response;
    redirect(url: string | URL, status?: number | undefined): Response;
}, Headers: {
    new (init?: HeadersInit | undefined): Headers;
    prototype: Headers;
};
