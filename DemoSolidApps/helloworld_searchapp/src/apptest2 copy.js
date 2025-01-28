// testApp.js
const OverlayQueryExecutor = require('./OverlayQueryExecutor');

// Instantiate the QueryExecutor
const queryExecutor = new OverlayQueryExecutor();


// Define a test query
const testQuery = "SELECT DISTINCT srvurl FROM LTOVERLAYSERVERINFO T0 , LTOVERLAYKWDWEBIDINFO T1 WHERE T0.SrvID = T1.SRVID AND kwd='miscarriage' AND webid='http://example.org/agent19/profile/card#me'";

// Call executeQuery directly and handle the result
queryExecutor.executeQuery(testQuery, (error, result) => {
    if (error) {
        console.error("Query execution error:", error);
    } else {
        console.log("Query result:", result);
    }
});
