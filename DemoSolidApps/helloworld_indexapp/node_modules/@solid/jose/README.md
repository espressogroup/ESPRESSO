# JSON Object Signing and Encryption (JOSE) _(@solid/jose)_

> Lightweight isomorphic JSON Object Signing and Encryption (JOSE) library for browser and Node.js

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [License](#license)

## Security

TBD

## Background

- Based on Webcrypto API
- Isomorphic (Node.js and Browser)

## Install

Requires Node.js 8+.

```
npm install @solid/jose
```

## Usage

### Building with Webpack

**Important:**
If you're using this library as a dependency and you plan to use Webpack, don't
forget to add the following lines to your `webpack.config.js` `externals:` 
section:

```js
  externals: {
    '@sinonjs/text-encoding': 'TextEncoder',
    'isomorphic-webcrypto': 'crypto'
  }
```

### In Node

```js
const { JWT } = require('@solid/jose')

const decoded = JWT.decode(data) // throws an error if invalid
```

### In Browser

If you `npm install @solid/jose` as a dependency, the Webpack'd minified bundle will be
available in the `dist/` directory as `jose.min.js`.

If you're actively developing/testing this lib, you can `npm run dist`, and the
bundle will be rebuilt.

To use in the browser, simply import the bundle in a `<script>` tag, and the lib
will be loaded into the `window.JOSE` global variable.

Example `test.html` file, to illustrate:

```html
<html>
<head>
  <script src="dist/jose.min.js"></script>
  <script>
    // You can now start using the library
    let jwt = new JOSE.JWT({
      header: { alg: 'HS256' },
      payload: { iss: 'https://forge.anvil.io' }
    })
  </script>
</head>
<body>
Sample usage of JOSE lib in a browser.
</body>
</html>
```

## Testing

### Nodejs

```bash
$ npm test
```

## License

[The MIT License](LICENSE.md)

Copyright (c) 2016 Anvil Research, Inc.
Copyright (c) 2017-2019 The Solid Project
