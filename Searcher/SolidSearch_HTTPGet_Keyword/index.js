const express = require('express');
const app = express()
const port = 8080
const axios = require('axios');
const fs = require("fs");
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

app.get('/query', async (req, res, next) => {
    const { keyword } = req.query;
    const [query, webId] = keyword.split(",");
    if (!query) {
        res.send("invalid keyword");
        return;
    }
	const webIdQuery = webId.replace(/[^a-zA-Z0-9]/g, "");
        
    const sources = await readSources()
    let integratedResult = [];
    for (let index = 0; index < sources.length; index++) {
        const source = sources[index];
       	const response = await axios.get(`${source}${query}.ndx`).then((resp) => resp).catch((resp) => resp.response);   
        if (response.status === 200) {
            const rows = response.data.split("\r\n").filter(i => i.length > 0);
			 const webIdAccess = await axios.get(`${source}${webIdQuery}.webid`).then((resp) => resp).catch((resp) => resp.response);  //5
        if(webIdAccess.status !== 200){
            continue;
          }
        const webIdAccessList = webIdAccess.data.split("\r\n").filter(i => i.length > 0);
            for (let i = 0; i < rows.length; i++) {
                const [newAddres, frequency] = rows[i].split(",");
                const hasAccess = webIdAccessList.some(i => i === newAddres)
                if (hasAccess) {
                    const result = await axios.get(`${source}${newAddres}.file`);     
                    if (result.status === 200) {
                        const [address] = result.data.split(",");
                        const newvalue = { "address": address, "frequency": frequency }
                        integratedResult = [...integratedResult, newvalue];
                    }
                }
            }
        }
    }
    res.json(integratedResult)
});

const readSources = async () => {
    const response = await axios.get("https://srv03812.soton.ac.uk:3000/ESPRESSO/webidpodmetaindex.csv", { responseType: 'blob' });
    const csvStr = await response.data;
    const result = csvStr.split("\r\n").filter(i => i.length > 0);
    return result;
}