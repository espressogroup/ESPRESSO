# Isomorphic Solid JavaScript authentication

[![Build status](https://github.com/rubensworks/solid-client-authn-isomorphic.js/workflows/CI/badge.svg)](https://github.com/rubensworks/solid-client-authn-isomorphic.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/solid-client-authn-isomorphic.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/solid-client-authn-isomorphic.js?branch=master)
[![npm version](https://badge.fury.io/js/@rubensworks%2Fsolid-client-authn-isomorphic.svg)](https://www.npmjs.com/package/@rubensworks/solid-client-authn-isomorphic)

Handle authentication in an isomorphic manner so that it works in both Node.js and browsers.

This package is nothing more than a lightweight isomorphic proxy package.
When this package is used in Node.js, it acts as a proxy to [`@inrupt/solid-client-authn-node`](https://www.npmjs.com/package/@inrupt/solid-client-authn-node).
When it is used in browsers, it acts as a proxy to [`@inrupt/solid-client-authn-browser`](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser).

This package will only expose the components that are common between `@inrupt/solid-client-authn-node` and `@inrupt/solid-client-authn-browser`,
and are thereby safe to use in an isomorphic manner.
If you need specific components that only exist in either `@inrupt/solid-client-authn-node` or `@inrupt/solid-client-authn-browser`,
it is recommended to use one of those packages instead.

If you encounter any auth-specific bugs, it is recommended to report them at https://github.com/inrupt/solid-client-authn-js,
and make sure you are using it via `@rubensworks/solid-client-authn-isomorphic`.

## Installation

```bash
$ npm install @rubensworks/solid-client-authn-isomorphic
```
or
```bash
$ yarn add @rubensworks/solid-client-authn-isomorphic
```

## Usage

All examples below are safe to use in both Node.js and browser environments.

### Login

```typescript
import { Session } from '@rubensworks/solid-client-authn-isomorphic';

const session = new Session();
await session.login({ oidcIssuer: 'https://solidcommunity.net/' });
```

### Detect if in Node.js or browser

```typescript
import { node, browser } from '@rubensworks/solid-client-authn-isomorphic';

if (node) {
  console.log('Running in Node.js');
}
if (browser) {
  console.log('Running in a Web browser');
}
```

### All available components

```typescript
import {
  Session,
  ISessionOptions,
  ILoginInputOptions,
  ISessionInfo,
  IStorage,
  NotImplementedError,
  ConfigurationError,
  InMemoryStorage,
  node,
  browser,
} from '@rubensworks/solid-client-authn-isomorphic';
```

## License

This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
