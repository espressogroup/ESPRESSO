const { fetchBloomFilterStream, filterQuery } = require('./bloomfiltersmodule');

async function testFilterQuery() {
    const bloomFilterUrl = 'https://srv03812.soton.ac.uk:3000/ESPRESSO/metaindex/httpexampleorgagent95profilecardme-pods-ESPRESSO.bloom';
    const query = 'medication transfusion ribofjfd';

    try {
        // Fetch Bloom filter stream
        console.log(`Fetching Bloom filter from ${bloomFilterUrl}...`);
        const bloomFilterStream = await fetchBloomFilterStream(bloomFilterUrl);
        console.log('Bloom filter fetched successfully.');

        // Filter the query
        console.log(`Filtering query: "${query}"`);
        const filteredQuery = await filterQuery(query, bloomFilterStream);
        console.log(`Filtered Query: "${filteredQuery}"`);
    } catch (error) {
        console.error(`Test failed: ${error.message}`);
    }
}

testFilterQuery();
