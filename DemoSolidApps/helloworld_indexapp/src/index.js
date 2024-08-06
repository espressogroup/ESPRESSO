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


const selectorIdP = document.querySelector("#select-idp");
const selectorPod = document.querySelector("#select-pod");
const buttonLogin = document.querySelector("#btnLogin");
const buttonRead = document.querySelector("#btnRead");
const buttonCreate = document.querySelector("#btnCreate");
const labelCreateStatus = document.querySelector("#labelCreateStatus");

buttonRead.setAttribute("disabled", "disabled");
buttonLogin.setAttribute("disabled", "disabled");
buttonCreate.setAttribute("disabled", "disabled");

// 1a. Start Login Process. Call login() function.
function loginToSelectedIdP() {
  const SELECTED_IDP = document.getElementById("select-idp").value;

  localStorage.setItem('selectedIdp', SELECTED_IDP);

  return login({
    oidcIssuer: SELECTED_IDP,
    redirectUrl: new URL("/", window.location.href).toString(),
    clientName: "Getting started app"
  });
}

// 1b. Login Redirect. Call handleIncomingRedirect() function.
// When redirected after login, finish the process by retrieving session information.
async function handleRedirectAfterLogin() {
  //await handleIncomingRedirect();
  // HO we don't want to keep losing the session.
  await handleIncomingRedirect({restorePreviousSession : true}); // no-op if not part of login redirect

  const session = getDefaultSession();
  if (session.info.isLoggedIn) {
    // Update the page with the status.
    document.getElementById("myWebID").value = session.info.webId;

    // Enable Read button to read Pod URL
    buttonRead.removeAttribute("disabled");
  }
}

// The example has the login redirect back to the root page.
// The page calls this method, which, in turn, calls handleIncomingRedirect.
handleRedirectAfterLogin();

// Get Pod(s) associated with the WebID
async function getMyPods() {
  const webID = document.getElementById("myWebID").value;
  const mypods = await getPodUrlAll(webID, { fetch: fetch });

  mypods.forEach((mypod) => {
    let podOption = document.createElement("option");
    podOption.textContent = mypod;
    podOption.value = mypod;
    selectorPod.appendChild(podOption);
  });
}



async function createIndex() {
  labelCreateStatus.textContent = "";
  const SELECTED_POD = document.getElementById("select-pod").value;

  // Show the progress container
  const progressContainer = document.querySelector(".progress-container");
  progressContainer.style.display = "block";

  // Show the progress spinner
  const progressSpinner = document.querySelector(".progress-spinner");
  progressSpinner.style.display = "block";

  // URL for the new index container
  const podIndexUrl = `${SELECTED_POD}pod-index/`;

  let myIndex;
  let indexUrl;

  try {
    // Attempt to retrieve the index directory in case it already exists.
    myIndex = await getSolidDataset(podIndexUrl, { fetch: fetch });
    indexUrl = getSourceUrl(myIndex);
    console.log("Index already exists at:", indexUrl);
    labelCreateStatus.textContent = "Index already exists at: " + indexUrl;
    document.getElementById("successButtonDiv").style.display = "flex";

    // Call createEspressoPod if the index already exists
    await createEspressoPod();

  } catch (error) {
    if (typeof error.statusCode === "number" && error.statusCode === 404) {
      // If not found, create a new SolidDataset (i.e., the index)
      myIndex = createSolidDataset();
      try {
        // Save the SolidDataset as a container (directory)
        let savedIndex = await saveSolidDatasetAt(podIndexUrl, myIndex, { fetch: fetch });
        indexUrl = getSourceUrl(savedIndex);
        console.log("Index created at:", indexUrl);
        labelCreateStatus.textContent = "Index Created at: " + indexUrl;


        // Show the successButtonDiv
        document.getElementById("successButtonDiv").style.display = "block";

        // Call createEspressoPod if the index was created successfully
        await createEspressoPod();

      } catch (saveError) {
        console.log(saveError);
        labelCreateStatus.textContent = "Error: " + saveError;
        labelCreateStatus.setAttribute("role", "alert");
      }
    } else {
      console.error("Error retrieving the Index container:", error);
      labelCreateStatus.textContent = "Error: " + error;
      labelCreateStatus.setAttribute("role", "alert");
    }
  } finally {
    // Hide the progress spinner after completion
    progressSpinner.style.display = "none";

    // Hide the progress container after completion
    progressContainer.style.display = "none";
  }

  await writeMetaIndex(indexUrl);
}


// Event listener for the Search button to navigate to another website
document.getElementById('successButtonSearch').addEventListener('click', () => {
  window.location.href = 'http://localhost:7070';
});



buttonLogin.onclick = function () {
  loginToSelectedIdP();
};

buttonRead.onclick = function () {
  getMyPods();
};

buttonCreate.onclick = function () {
  createIndex();
};

selectorIdP.addEventListener("change", idpSelectionHandler);
function idpSelectionHandler() {
  if (selectorIdP.value === "") {
    buttonLogin.setAttribute("disabled", "disabled");
  } else {
    buttonLogin.removeAttribute("disabled");
  }
}

selectorPod.addEventListener("change", podSelectionHandler);
function podSelectionHandler() {
  if (selectorPod.value === "") {
    buttonCreate.setAttribute("disabled", "disabled");
  } else {
    buttonCreate.removeAttribute("disabled");
  }
}



async function checkEspressoPod(esppodAddress) {
  try {
    const res = await fetch(esppodAddress);
    return res.ok;
  } catch (error) {
    console.error('Error checking ESPRESSO Pod:', error);
    return false;
  }
}

let espressoPodUrl = "";


async function createEspressoPod() {
  const IDP = localStorage.getItem('selectedIdp');
  console.log(">>>" + IDP);

  const registerEndpoint = IDP+'/idp/register/';

  const espressopodname = 'ESPRESSO';
  const espressoemail = 'espresso@example.com';
  const password = '12345';

  const esppodAddress = IDP+'/ESPRESSO/';
  const podExists = await checkEspressoPod(esppodAddress);

  if (!podExists) {
    console.log('Creating the ESPRESSO Pod');

    // POST request to register endpoint to create the ESPRESSO pod
    const res = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        createWebId: "on",
        webId: "",
        register: "on",
        createPod: "on",
        podName: espressopodname,
        email: espressoemail,
        password: password,
        confirmPassword: password
      }),
      timeout: 5000
    });

    if (res.ok) {
      const responseData = await res.json();
      console.log(responseData);
      espressoPodUrl = `${IDP}/${espressopodname}/`;
      console.log(`ESPRESSO pod created successfully at ${IDP}/${espressopodname}/`);
    } else {
      // Check if the response contains a message that indicates the pod was created
      const responseText = await res.text();
      if (res.status === 201 || responseText.includes('created')) {
        console.log(`ESPRESSO pod created successfully at ${IDP}/${espressopodname}/`);
      } else {
        console.log('Failed to create ESPRESSO pod');
      }
    }
  } else {
    espressoPodUrl = `${IDP}/${espressopodname}/`;
    console.log(`ESPRESSO pod is present at ${IDP}/${espressopodname}/`);
  }
}




// OLD CreateESPRESSOPod Function
// async function createEspressoPod() {
//   const IDP = 'http://localhost:3000';
//   const esppodAddress = 'http://localhost:3000/ESPRESSO-Pod/';
//   const registerEndpoint = 'http://localhost:3000/idp/register/';
//
//   const espressopodname = 'ESPRESSO-Pod';
//   const espressoemail = 'espresso@example.com';
//   const password = '12345';
//
//   const podExists = await checkEspressoPod(esppodAddress);
//
//   if (!podExists) {
//     console.log('Creating the ESPRESSO Pod');
//
//     // POST request to register endpoint to create the ESPRESSO pod
//     const res = await fetch(registerEndpoint, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         createWebId: "on",
//         webId: "",
//         register: "on",
//         createPod: "on",
//         podName: espressopodname,
//         email: espressoemail,
//         password: password,
//         confirmPassword: password
//       }),
//       timeout: 5000
//     });
//
//     if (res.ok) {
//       const responseData = await res.json();
//       console.log(responseData);
//       espressoPodUrl = `${IDP}/${espressopodname}/`;
//       console.log(`ESPRESSO pod created successfully at ${IDP}/${espressopodname}/`);
//     } else {
//       // Check if the response contains a message that indicates the pod was created
//       const responseText = await res.text();
//       if (res.status === 201 || responseText.includes('created')) {
//         console.log(`ESPRESSO pod created successfully at ${IDP}/${espressopodname}/`);
//       } else {
//         console.log('Failed to create ESPRESSO pod');
//       }
//     }
//   } else {
//     espressoPodUrl = `${IDP}/${espressopodname}/`;
//     console.log(`ESPRESSO pod is present at ${IDP}/${espressopodname}/`);
//   }
// }


async function writeMetaIndex(indexUrl) {
  const IDP = localStorage.getItem('selectedIdp');
  const espressopodAddress = IDP + '/ESPRESSO/';
  const metaIndexFile = 'Meta-Index';

  try {
    // Check if Meta-Index file exists
    let metaIndexDataset;
    try {
      metaIndexDataset = await getSolidDataset(espressopodAddress + metaIndexFile, { fetch });
    } catch (error) {
      // If Meta-Index doesn't exist, create a new one
      metaIndexDataset = createSolidDataset();
    }

    // Get the content of the Meta-Index file
    let indexContent = '';
    const fileUrl = espressopodAddress + metaIndexFile;
    try {
      const file = await getFile(fileUrl, { fetch });
      indexContent = await file.text();
    } catch (error) {
      // If Meta-Index file does not exist, it will throw a 404 error, so we handle it here
      indexContent = '';
    }

    // Check if indexUrl is already in the Meta-Index file
    if (indexContent.includes(indexUrl)) {
      console.log(`Index URL already exists in the Meta-Index file: ${indexUrl}`);
      return;
    }

    // Append the new indexUrl to the existing content
    indexContent += indexUrl + '\n';

    // Create a new Blob with the updated content
    const updatedFile = new Blob([indexContent], { type: 'text/plain' });

    // Save or overwrite the Meta-Index file
    if (metaIndexDataset) {
      await overwriteFile(fileUrl, updatedFile, { fetch });
    } else {
      await saveFileInContainer(espressopodAddress, updatedFile, { slug: metaIndexFile, fetch });
    }

    console.log(`Meta-Index updated successfully at ${espressopodAddress}${metaIndexFile}`);
  } catch (error) {
    console.error('Error writing Meta-Index:', error);
  }
}




// OLD Function works fine but  duplicates index_urls in the metaindex
// async function writeMetaIndex(indexUrl) {
//   const IDP = localStorage.getItem('selectedIdp');
//   const espressopodAddress = IDP+'/ESPRESSO/';
//   const metaIndexFile = 'Meta-Index';
//
//   try {
//     // Check if Meta-Index file exists
//     let metaIndexDataset;
//     try {
//       metaIndexDataset = await getSolidDataset(espressopodAddress + metaIndexFile, { fetch });
//     } catch (error) {
//       // If Meta-Index doesn't exist, create a new one
//       metaIndexDataset = createSolidDataset();
//     }
//
//     // Get the content of the Meta-Index file
//     let indexContent = '';
//     const fileUrl = espressopodAddress + metaIndexFile;
//     try {
//       const file = await getFile(fileUrl, { fetch });
//       indexContent = await file.text();
//     } catch (error) {
//       // If Meta-Index file does not exist, it will throw a 404 error, so we handle it here
//       indexContent = '';
//     }
//
//     // Append the new indexUrl to the existing content
//     indexContent += indexUrl + '\n';
//
//     // Create a new Blob with the updated content
//     const updatedFile = new Blob([indexContent], { type: 'text/plain' });
//
//     // Save or overwrite the Meta-Index file
//     if (metaIndexDataset) {
//       await overwriteFile(fileUrl, updatedFile, { fetch });
//     } else {
//       await saveFileInContainer(espressopodAddress, updatedFile, { slug: metaIndexFile, fetch });
//     }
//
//     console.log(`Meta-Index updated successfully at ${espressopodAddress}${metaIndexFile}`);
//   } catch (error) {
//     console.error('Error writing Meta-Index:', error);
//   }
// }


// OLD  Event listener for the Register button to check service status
// document.getElementById('successButtonRegister').addEventListener('click', async () => {
//   const serviceUrl = 'http://127.0.0.1:8000/checkServiceStatus';
//
//   try {
//     const res = await fetch(serviceUrl);
//     const data = await res.json();
//
//     if (data.isServiceRunning) {
//       console.log('Service is running on port 6414');
//       document.getElementById('podregisterationmsg').innerText = 'Service is running on port 6414';
//       document.getElementById('podregisterationmsg').style.display = 'block';
//     } else {
//       console.log('Service is not running on port 6414');
//       document.getElementById('podregisterationmsg').innerText = 'Service is not running on port 6414';
//       document.getElementById('podregisterationmsg').style.display = 'block';
//     }
//   } catch (error) {
//     console.error('Error checking service status:', error);
//     document.getElementById('podregisterationmsg').innerText = 'Error checking service status';
//     document.getElementById('podregisterationmsg').style.display = 'block';
//   }
// });

// Event listener for the Register button to check service status and append the "espresso-pod" url to GaianDB Logical Table
document.getElementById('successButtonRegister').addEventListener('click', async () => {
  const serviceUrl = 'http://127.0.0.1:8000/checkServiceStatus'; // Assuming this endpoint checks if the service is running

  try {
    // Step 1: Check if the service is running
    const res = await fetch(serviceUrl);
    const data = await res.json();

    if (data.isServiceRunning) {
      console.log('Service is running on port 6414');
      document.getElementById('podregisterationmsg').innerText = 'Service is running on port 6414';
      document.getElementById('podregisterationmsg').style.display = 'block';

      // Step 2: Append to CSV file
      const appendCsvUrl = 'http://localhost:8000/appendIndexUrlToCsv';

      // Extract espressopod url from labelCreateStatus.textContent
      // const statusText = labelCreateStatus.textContent.trim();
      // const startIndex = statusText.indexOf("http");
      // let index_url = "";
      // if (startIndex !== -1) {
      //   index_url = statusText.substring(startIndex);
      //   console.log("Extracted indexUrl:", index_url);
      // }


      const appendRes = await fetch(appendCsvUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ index_url: espressoPodUrl})
      });

      if (appendRes.ok) {
        const appendData = await appendRes.json();
        console.log('Successfully appended index URL to CSV:', appendData.message);
        document.getElementById('podregisterationmsg').innerText = 'Pod is now registered for search';
      } else {
        console.log('Failed to append index URL to CSV');
        document.getElementById('podregisterationmsg').innerText = 'Failed to register pod';
      }

    } else {
      console.log('Gaian Service is not running on port 6414');
      document.getElementById('podregisterationmsg').innerText = 'Service is not running on port 6414';
      document.getElementById('podregisterationmsg').style.display = 'block';
    }
  } catch (error) {
    console.error('Error checking service status:', error);
    document.getElementById('podregisterationmsg').innerText = 'Error checking service status';
    document.getElementById('podregisterationmsg').style.display = 'block';
  }
});



