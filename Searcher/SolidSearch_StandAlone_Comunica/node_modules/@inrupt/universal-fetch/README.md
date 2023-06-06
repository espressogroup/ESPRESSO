# Universal Fetch

`@inrupt/universal-fetch` is a TypeScript library for accessing the `fetch` method from any environment.

In browsers this library will always re-export the existing `fetch` function from the global scope.

In Node.js environments the library first checks if `fetch` is globally available ([as is the case in Node 18](https://nodejs.org/uk/blog/announcements/v18-release-announce/), and as is being back-ported into Node 16) then the global `fetch` is used. Otherwise, the `fetch` function exported by [undici](https://www.npmjs.com/package/undici) is for Node 16, and node-fetch is used for Node 14 and less.

## Usage

```ts
import fetch, { Headers, Request, Response } from "@inrupt/universal-fetch";

const response = await fetch(url);
```

## Changelog

See [the release notes](https://github.com/inrupt/universal-fetch/blob/main/CHANGELOG.md).

## License

MIT © [Inrupt](https://inrupt.com)
