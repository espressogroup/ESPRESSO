# Comunica SPARQL Solid

[![npm version](https://badge.fury.io/js/%40comunica%2Fquery-sparql-solid.svg)](https://www.npmjs.com/package/@comunica/query-sparql-solid)
[![Docker Pulls](https://img.shields.io/docker/pulls/comunica/query-sparql-solid.svg)](https://hub.docker.com/r/comunica/query-sparql-solid/)

Comunica SPARQL Solid is a SPARQL query engine for JavaScript that can query over [Solid](https://solidproject.org/) data pods.

This package is safe to use in both Node.js and browser environments.

This module is part of the [Comunica framework](https://comunica.dev/).
[Click here to learn more about Comunica and Solid](https://comunica.dev/docs/query/advanced/solid/).

## Known issues

This library has the following known issues in certain cases, that are out of our control (but have been reported).

* **Web Workers**: This library can not be used within due to an open issue in https://github.com/inrupt/solid-client-authn-js/issues/1657
* **Enterprise Solid Server** (https://pod.inrupt.com/):
  * Patch requests are not accepted, so only new documents can be created, but existing ones can not be modified.
  * Due to missing `Accept-Patch`, and `Accept-Put` headers, [the destination type has to be forced](https://comunica.dev/docs/query/advanced/destination_types/). This will only work for creating new documents via the `putLdp` destination type. Updating existing documents via `patchSparqlUpdate` are currently not possible because of the previous issue. 
* **Node Solid Server** (https://solidcommunity.net/):
  * Querying or updating existing documents fails with the error `Error translating between RDF formats` (https://github.com/solid/node-solid-server/issues/1618). Creating new documents does work.

No issues are known with the [Community Solid Server](https://github.com/solid/community-server/)

## Install

```bash
$ yarn add @comunica/query-sparql-solid
```

or

```bash
$ npm install -g @comunica/query-sparql-solid
```

## Usage

Show 100 triples from a private resource
by authenticating through the https://solidcommunity.net/ identity provider (when using https://pod.inrupt.com/, your IDP will be https://broker.pod.inrupt.com/):

```bash
$ comunica-sparql-solid --idp https://solidcommunity.net/ \
  http://example.org/private-resource.ttl \
  "SELECT * WHERE {
       ?s ?p ?o
   } LIMIT 100"
```

This command will connect with the given identity provider,
and open your browser to log in with your WebID.
After logging in, the query engine will be able to access all the documents you have access to.

Show the help with all options:

```bash
$ comunica-sparql-solid --help
```

Just like [Comunica SPARQL](https://github.com/comunica/comunica/tree/master/packages/query-sparql),
a [dynamic variant](https://github.com/comunica/comunica/tree/master/packages/query-sparql#usage-from-the-command-line) (`comunica-dynamic-sparql-solid`) also exists.

_[**Read more** about querying from the command line](https://comunica.dev/docs/query/getting_started/query_cli/)._

### Usage within application

This engine can be used in JavaScript/TypeScript applications as follows:

```javascript
const QueryEngine = require('@comunica/query-sparql-solid').QueryEngine;
const { interactiveLogin } = require('solid-node-interactive-auth');

// This will open your Web browser to log in
const session = await interactiveLogin({ oidcIssuer: 'https://solidcommunity.net/' });
const myEngine = new QueryEngine();

const bindingsStream = await myEngine.queryBindings(`
  SELECT * WHERE {
      ?s ?p ?o
  } LIMIT 100`, {
  sources: [session.info.webId], // Sets your profile as query source
  '@comunica/actor-http-inrupt-solid-client-authn:session': session,
});

// Consume results as a stream (best performance)
bindingsStream.on('data', (binding) => {
  console.log(binding.toString()); // Quick way to print bindings for testing

  console.log(binding.has('s')); // Will be true

  // Obtaining values
  console.log(binding.get('s').value);
  console.log(binding.get('s').termType);
  console.log(binding.get('p').value);
  console.log(binding.get('o').value);
});
bindingsStream.on('end', () => {
  // The data-listener will not be called anymore once we get here.
});
bindingsStream.on('error', (error) => {
  console.error(error);
});

// Consume results as an array (easier)
const bindings = await bindingsStream.toArray();
console.log(bindings[0].get('s').value);
console.log(bindings[0].get('s').termType);
```

**Note that `solid-node-interactive-auth` only works within Node.js apps. Please refer to [`@inrupt/solid-client-authn-browser`](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser) if yoyou want to login via a browser app.**

_[**Read more** about querying an application](https://comunica.dev/docs/query/getting_started/query_app/)._

### Usage as a SPARQL endpoint

Start a webservice exposing a private resource via the SPARQL protocol, i.e., a _SPARQL endpoint_,
by authenticating through the https://solidcommunity.net/ identity provider.

```bash
$ comunica-sparql-solid-http --idp https://solidcommunity.net/ \
  http://example.org/private-resource.ttl
```

Show the help with all options:

```bash
$ comunica-sparql-solid-http --help
```

The SPARQL endpoint can only be started dynamically.
An alternative config file can be passed via the `COMUNICA_CONFIG` environment variable.

Use `bin/http.js` when running in the Comunica monorepo development environment.

_[**Read more** about setting up a SPARQL endpoint](https://comunica.dev/docs/query/getting_started/setup_endpoint/)._
