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
const session = new Session();

// All these examples assume the server is running at `http://localhost:3000/`.
async function getControls() {
	try {
		// First we request the account API controls to find out where we can log in
		const indexResponse = await fetch('http://localhost:3000/.account/');
		const { controls } = await indexResponse.json();

		if (!indexResponse.ok) {
        	throw new Error(`Error! status: ${indexResponse.status}`);
    	}

		// And then we log in to the account API
		const response = await fetch(controls.password.login, {
  		method: 'POST',
  			headers: { 'content-type': 'application/json' },
  			// body: JSON.stringify({ email: 'helen.oliver@bcs.org.uk', password: 'Th3sl0wgr33nfox' }),
			body: JSON.stringify({ email: 'mr@email.org', password: '12345' }),

		});
		if (!response.ok) {
        	throw new Error(`Error!!! status: ${response.status}`);
    	}
    	
		// This authorization value will be used to authenticate in the next step
		const { authorization } = await response.json();
		/*if (!authorization.ok) {
        	throw new Error(`Error! status: ${authorization.status}`);
    	}*/
    	return authorization;
        
    } catch (err) {
        console.log(err);
    }
}

// All these examples assume the server is running at `http://localhost:3000/`.
async function getTokens(blorf) {
	try {

	// Now that we are logged in, we need to request the updated controls from the server.
	// These will now have more values than in the previous example.
	const indexResponse = await fetch('http://localhost:3000/.account/', {
  		headers: { blorf: `CSS-Account-Token ${blorf}` }
	});

	if (!indexResponse.ok) {
        throw new Error(`Error! status: ${indexResponse.status}`);
    }
    
	const { controls } = await indexResponse.json();
	/*if (!controls.ok) {
        throw new Error(`Error! status: ${controls.status}`);
    }*/
	return controls;
        
    } catch (err) {
        console.log(err);
    }
}
    
getControls().then(res => {
  getTokens(res).then(ponse => {
	  console.log(ponse);
  });
});

