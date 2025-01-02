// Import from "@inrupt/solid-client-authn-browser"
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
import {
  createSolidDataset,
  getPodUrlAll,
  fetch as solidFetch
} from "@inrupt/solid-client";

// Set up the event listener for the search form
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    search();
  });
});

// Define the search function
async function search() {
  const keyword = document.getElementById("keyword").value;
  const webId = 'your-web-id'; // Replace with the actual WebID
  const keywordQuery = `${keyword},${webId}`; // Format the keyword query

  console.log('Keyword:', keyword);

  try {
    const response = await fetch(`http://localhost:8080/query?keyword=${encodeURIComponent(keywordQuery)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Result:', result);
    displayResults(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Define the function to display results
function displayResults(result) {
  const resultsContainer = document.querySelector('.results');
  const resultsList = resultsContainer.querySelector('ul');

  resultsList.innerHTML = '';

  // Assuming result is an array of objects
  result.forEach(item => {
    const listItem = document.createElement('li');
    //The One that should return Address and Frequency
    listItem.textContent = `Address: ${item.address}, Frequency: ${item.frequency}`;

    // listItem.textContent = `Server: ${item.SRVURL}`;
    resultsList.appendChild(listItem);
  });

  resultsContainer.style.display = 'block';
}
