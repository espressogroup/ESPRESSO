// Import from "@inrupt/solid-client-authn-browser"
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser";



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
  setThing,
  getSourceUrl,
  getSolidDatasetWithAcl, fetch as solidFetch, getFile, overwriteFile, saveFileInContainer
} from "@inrupt/solid-client";

import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

// document.addEventListener('DOMContentLoaded', function() {
//   document.getElementById('searchForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     search();
//   });
// });
//
//
//
// function search() {
//   const keyword = document.getElementById("keyword").value;
//   window.location.href = "/search?keyword=" + keyword;
// }



document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    search();
  });
});

async function search() {
  const keyword = document.getElementById("keyword").value;
  console.log('Keyword:', keyword);

  try {
    const response = await fetch('http://localhost:9000/runQuery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: keyword }),
    });

    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Result:', result);

    displayResults(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayResults(result) {
  const resultsContainer = document.querySelector('.results');
  const resultsList = resultsContainer.querySelector('ul');

  resultsList.innerHTML = '';

  // Assuming result is a newline-separated string of results
  const resultsArray = result.split('\n');
  resultsArray.forEach(line => {
    if (line.trim() !== '') {
      const listItem = document.createElement('li');
      listItem.textContent = line;
      resultsList.appendChild(listItem);
    }
  });

  resultsContainer.style.display = 'block';
}






