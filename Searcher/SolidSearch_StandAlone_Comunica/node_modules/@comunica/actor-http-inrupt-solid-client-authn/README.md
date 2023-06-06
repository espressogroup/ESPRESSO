# Comunica Inrupt Solid Client Authn Http Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-http-inrupt-solid-client-authn.svg)](https://www.npmjs.com/package/@comunica/actor-http-inrupt-solid-client-authn)

An [HTTP](https://github.com/comunica/comunica/tree/master/packages/bus-http) actor that
does authenticated Solid requests using [Inrupt's solid-client-authn-js libraries](https://github.com/inrupt/solid-client-authn-js).

To make this actor apply, the context must contain an authenticated `Session` object at the `'@comunica/actor-http-inrupt-solid-client-authn:session'` entry, for example:
```typescript
const { interactiveLogin } = require('solid-node-interactive-auth');
const session = await interactiveLogin({ oidcIssuer: 'https://solidcommunity.net/' });

await newEngine().query('SELECT * WHERE { ?s ?p ?o }', {
  sources: [ 'http://example.org/some-page' ],
  '@comunica/actor-http-inrupt-solid-client-authn:session': session,
});
```

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-http-inrupt-solid-client-authn
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-http-inrupt-solid-client-authn/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": "urn:comunica:default:http/actors#inrupt-solid-client-authn",
      "@type": "ActorHttpInruptSolidClientAuthn"
    }
  ]
}
```
