const express = require('express');
const app = express()
const port = 8080
const axios = require('axios');
const fs = require("fs");
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

app.get('/query', async (req, res) => {
    const { keyword } = req.query;
    const [searchWord, webId] = keyword.split(",");
    if (!searchWord) {
        res.send("invalid keyword");
        return;
    }

    const webIdQuery = webId.replace(/[^a-zA-Z0-9 ]/g, "");
    const sources = await readSources()
    let integratedResult = [];
    for (let index = 0; index < sources.length; index++) {
        const source = sources[index];
        const baseAdress = source.replace(/\/espressoindex\//,"/");
        const response = await axios.get(`${source}${searchWord}.ndx`).then((resp) => resp).catch((resp) => resp.response);
        if (response.status === 200) {
            const webIdAccess = await axios.get(`${source}${webIdQuery}.webid`).then((resp) => resp).catch((resp) => resp.response);
            if(webIdAccess.status !== 200){
                continue;
            }
            const webIdRow = webIdAccess.data.split("\r\n").filter(i => i.length > 0);     
        	const ndxRow = response.data.split("\r\n").filter(i => i.length > 0);
            for (let i = 0; i < ndxRow.length; i++) {
                const [fileId, frequency] = ndxRow[i].split(",");
              //  for (let j = 0; j < webIdRow.length; j++) {
                const access = webIdRow.find(i => i.split(",")[0] == fileId); 		
                if (access) {
					const [fileId2, fileName] = access.split(",");
                    const newvalue = { "address": `${baseAdress}${fileName}`, "frequency": frequency }
                    integratedResult = [...integratedResult, newvalue];
                }
		   	//}
           }
        }
    }
  res.json(integratedResult)
});

const readSources = async () => {
    const response = await axios.get("https://srv03812.soton.ac.uk:3000/ESPRESSO/expDemoSingaporemetaindex.csv", { responseType: 'blob' });
    const csvStr = await response.data;
    const result = csvStr.split("\r\n").filter(i => i.length > 0);
    return result;
}
