import { fetch as fetch$1, Headers as Headers$1, Request as Request$1, Response as Response$1 } from 'undici';
import NodeFetch, { Headers as Headers$2, Request as Request$2, Response as Response$2 } from 'node-fetch';

const nodeVersion = process.versions.node.split(".");
const nodeMajor = Number(nodeVersion[0]);
const nodeMinor = Number(nodeVersion[1]);
let uniFetch;
if (nodeMajor >= 18) {
    uniFetch = globalThis;
}
else if (nodeMajor > 16 || (nodeMajor === 16 && nodeMinor >= 8)) {
    uniFetch = {
        fetch: fetch$1,
        Headers: Headers$1,
        Request: Request$1,
        Response: Response$1,
    };
}
else {
    uniFetch = {
        fetch: NodeFetch,
        Headers: Headers$2,
        Request: Request$2,
        Response: Response$2,
    };
}
var index = uniFetch.fetch;
const { fetch, Request, Response, Headers } = uniFetch;

export { Headers, Request, Response, index as default, fetch };
