function calculateBM25({
                           termFrequency,
                           documentLength,
                           documentFrequency,
                           totalDocuments,
                           avgDocumentLength,
                           k1 = 1.5,
                           b = 0.75
                       }, decimalPlaces = 4) {
    const idf = Math.log((totalDocuments - documentFrequency + 0.5) / (documentFrequency + 0.5) + 1);
    const tfNorm = (termFrequency * (k1 + 1)) / (termFrequency + k1 * (1 - b + b * (documentLength / avgDocumentLength)));

    return parseFloat((idf * tfNorm).toFixed(decimalPlaces));
}
function calculateLanguageModelling({
                                        termFrequency,          // tf: frequency of the term in the document
                                        documentLength,         // dl: length of the document
                                        collectionFrequency,    // cf: total occurrences of the term in the collection
                                        totalTermsInCollection, // N: total number of terms in the collection
                                        mu = 2000               // Smoothing parameter (Dirichlet)
                                    },decimalPlaces = 4) {
    // Calculate the probability for the term
    const p_t_given_D = (termFrequency + mu * (collectionFrequency / totalTermsInCollection)) / (documentLength + mu);

    // Return the log-probability as the "weight" of the term
    return parseFloat(Math.log(p_t_given_D).toFixed(decimalPlaces));
}
function calculateTFIDF({
                            termFrequency,       // tf: frequency of the term in the document
                            documentFrequency,   // df: number of documents containing the term
                            totalDocuments       // N: total number of documents in the collection
                        },decimalPlaces = 4) {
    const tf = termFrequency;
    const idf = Math.log((totalDocuments + 1) / (documentFrequency + 1)); // Adding 1 to avoid division by zero
    return parseFloat((tf * idf).toFixed(decimalPlaces)); // Return TF-IDF score
}

function calculateQueryScores({
                                  queryTerms,             // Array of terms with attributes for each term
                                  documentLength,         // dl: length of the document
                                  totalTermsInCollection, // N: total number of terms in the collection
                                  totalDocuments,
                                  avgDocumentLength,      // Average document length for BM25 calculation
                                  mu = 2000,              // Smoothing parameter (Dirichlet) for Query Likelihood
                                  k1 = 1.5,               // BM25 parameter
                                  b = 0.75                // BM25 parameter
                              }) {
    // Initialize total scores for each ranking model
    let totalBM25Score = 0;
    let totalQLScore = 0;
    let totalTFIDFScore = 0;

    // Process each term in the query
    queryTerms.forEach(termData => {
        const {
            term,                   // Term string itself
            termFrequency,          // tf: frequency of the term in the document
            collectionFrequency,    // cf: frequency of the term in the collection (for QL)
            documentFrequency,      // df: number of documents containing the term (for TF-IDF)
            documentFrequencyBM25,  // df: number of documents containing the term (for BM25)
        } = termData;

        // Calculate BM25 score for the term
        const termBM25Score = calculateBM25({
            termFrequency,
            documentLength,
            documentFrequency,
            totalDocuments,
            avgDocumentLength,
            k1,
            b
        });
        totalBM25Score += parseFloat(termBM25Score);

        // Calculate Query Likelihood score for the term
        const termQLScore = calculateLanguageModelling({
            termFrequency,
            documentLength,
            collectionFrequency,
            totalTermsInCollection,
            mu
        });
        totalQLScore += parseFloat(termQLScore);

        // Calculate TF-IDF score for the term
        const termTFIDFScore = calculateTFIDF({
            termFrequency,
            documentFrequency,
            totalDocuments
        });
        totalTFIDFScore += parseFloat(termTFIDFScore);
    });

    // Return final scores for each ranking model
    return {
        bm25Score: totalBM25Score,
        queryLikelihoodScore: totalQLScore,
        tfidfScore: totalTFIDFScore
    };
}


module.exports = {
    calculateBM25,
    calculateLanguageModelling,
    calculateTFIDF,
    calculateQueryScores
};
