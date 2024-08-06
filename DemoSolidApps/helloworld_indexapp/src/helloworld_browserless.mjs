// Import from "@inrupt/solid-client"
import {
  addUrl,
  addStringNoLocale,
  createSolidDataset,
  createThing,
  getPodUrlAll,
  getSolidDataset,
  getThingAll,
  getStringNoLocale,
  removeThing,
  saveSolidDatasetAt,
  setThing
} from "@inrupt/solid-client";

import { Session } from "@inrupt/solid-client-authn-node";

// 1. Get the authenticated credentials: myClientId, myClientSecret
// and myIdentityProvider, the Solid Identity Provider associated with the credentials.
// ...
// ...
// Important: Safeguard these credentials.

// HO: the Inrupt docs say "As a prereq, you can first obtain:
// "refresh token and client credentials (from dynamic or static registration of the 
// "application), or client credentials from static registration of the application.
// "Then, in your application, you can use either:
// "refresh tokens and client credentials, or
// "client credentials only if the application is statically registered."
// https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-nodejs-script/
//
// I statically registered the app in the browser as a separate step, which may
// be considered cheating for the purpose of this exercise. The Inrupt docs don't
// give any info about how to do this programmatically:
//
// "Refresh Tokens/Client Credentials Support: Solid Identity Providers are not required // "to support either refresh tokens or client credentials. Inrupt’s ESS and PodSpaces 
// "support refresh tokens and client credentials. 
// "This is done separately from the application."
//
// HO: This is my Solid ID provider for CSS:
const myIdentityProvider = 'http://localhost:3000';
//
// "Authenticate with Statically Registered Client Credentials:
// 
// "Prerequisite:
// "If supported by your Solid Identity Provider, statically register your application. 
// "The registration results in a Client ID and Client Secret pair.
// "For example, if using the Solid Identity Provider for Inrupt’s Pod Spaces, you can 
// "statically register your application via its Inrupt Application Registration page."
//
// HO: So that's what I did.
//
// "Safeguard your clientId and clientSecret values. Do not share these with any third 
// "parties as anyone with your clientId and clientSecret values can impersonate you and 
// "act fully on your behalf."
//
// HO: So you definitely shouldn't paste them as hard code in plain text, like I've done // here:
const myClientId = '_f86dd19c-0e11-4fce-a69b-8922cc61406d';
const myClientSecret = 'c1e5d4170c41bda96fe743198019a91d52c186a6b659b208b826f11ed56b2458636c062d486e33c2c95413435407a07a9bc07791809dc0dbdd66143d61d304b5';

// "Update Application Code:
// "For a statically registered application, you can use the solid-client-authn-node 
// "library with the client credentials for the user authentication flow:
//
// "1. Create a new Session for the user.
const session = new Session();

// "2. Call the Session.login() function, passing in the ILoginInputOptions.
// "Although you can pass in the options (oidcIssuer, redirectUrl, handleRedirect) to
// "start the authentication flow, you can instead pass in the following options with the
// "values obtained from the prerequisite section to login without the manual, 
// "browser-based user interactions:
// "clientId
// "clientSecret
// "oidcIssuer, the Solid Identity Provider where your Client ID and Client Secret have 
// "been registered.
//
// "When login() returns, your session should be logged in and able to make authenticated // "requests."
session.login({
  // 2. Use the authenticated credentials to log in the session.
  clientId: myClientId,
  clientSecret: myClientSecret,
  oidcIssuer: myIdentityProvider
}).then(() => {
  if (session.info.isLoggedIn) {
    // 3. Your session should now be logged in, and able to make authenticated requests.
    session
      // You can change the fetched URL to a private resource, such as your Pod root.
      //.fetch(session.info.webId)
      .fetch('http://localhost:3000/helloworld/')
      .then((response) => {
        return response.text();
      })
      .then(console.log);
  }
});
    
