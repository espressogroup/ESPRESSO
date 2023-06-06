# Interactive Solid authentication in Node.js

[![Build status](https://github.com/rubensworks/solid-node-interactive-auth.js/workflows/CI/badge.svg)](https://github.com/rubensworks/solid-node-interactive-auth.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/solid-node-interactive-auth.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/solid-node-interactive-auth.js?branch=master)
[![npm version](https://badge.fury.io/js/solid-node-interactive-auth.svg)](https://www.npmjs.com/package/solid-node-interactive-auth)

Easily authenticate Node.js apps with Solid identity servers by opening the user's Web browser.

Internally, this tool will setup a temporary Web server on the localhost
to allow authentication data to be handled easily and safely.

This is to be used as a tool next to [`@inrupt/solid-client-authn-node`](https://www.npmjs.com/package/@inrupt/solid-client-authn-node).

## Try out how it works

To see how the interactive authentication works for the end-user,
you can run this command:

```bash
$ npx solid-node-interactive-auth https://solidcommunity.net/

Logged in as https://<MY USERNAME>.solidcommunity.net/profile/card#me
```

You can replace https://solidcommunity.net/ with the identity provider you want to authenticate with.

## Installation

```bash
$ npm install solid-node-interactive-auth
```
or
```bash
$ yarn add solid-node-interactive-auth
```

This tool requires [`@inrupt/solid-client-authn-node`](https://www.npmjs.com/package/@inrupt/solid-client-authn-node) as a peer dependency:

```bash
$ npm install @inrupt/solid-client-authn-node
```
or
```bash
$ yarn add @inrupt/solid-client-authn-node
```

## Usage

The following code will trigger the user's Web browser to be opened to trigger the login sequence:
```typescript
import { Session } from '@inrupt/solid-client-authn-node';
import { interactiveLogin } from 'solid-node-interactive-auth';

(async function() {
  // Create a new session and log in by opening the Web browser
  const session = new Session();
  await interactiveLogin({
    session,
    oidcIssuer: 'https://solidcommunity.net/',
  });

  // Perform operations with this session
  // such as session.fetch()

  // Log out once you're done (avoids hanging Node.js process)
  await session.logout();
})();
```

If you don't have any specific needs for the `Session` object,
you can also just let this tool create one for you:
```typescript
const session = await interactiveLogin({
  oidcIssuer: 'https://solidcommunity.net/',
});
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
