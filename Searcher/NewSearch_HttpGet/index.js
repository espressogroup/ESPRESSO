const express = require('express');
const app = express()
const port = 8080
const axios = require('axios');
const fs = require("fs");
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

app.get('/query', async (req, res, next) => {
    const start = new Date().getTime();
    const { keyword } = req.query;
    if (!keyword) {
        res.send("invalid keyword");
        return;
    }
    const sources = await readSources()
    let integratedResult =[];
    for (let index = 0; index < sources.length; index++) {
        const source = sources[index];
      //  const dirlist  = await getDirectory(source,keyword);
      //  if(dirlist){
            const response = await axios.get(`${source}${keyword}.ndx`).then((resp) => resp).catch((resp) => resp.response);
            if(response.status===200){
                const rows = response.data.split("\r\n").filter(i => i.length > 0);
                for (let i = 0; i < rows.length; i++){
                const [newAddres,frequency] = rows[i].split(",");
                const result = await axios.get(`${source}${newAddres}.file`);
                if(result.status===200){
                    const newvalue = { "address": result.data, "frequency": frequency }
                    integratedResult = [...integratedResult,newvalue];
                }
        //      }
            }
        }
    }
    const end = new Date().getTime();
    fs.appendFileSync('log.txt', `------> Search APP  Total Execution Time: ${end-start} \n`);

    res.json(integratedResult)});

const readSources = async () => {
    const response = await axios.get("https://cupsa.ecs.soton.ac.uk:3000/ESPRESSO/ldptest.csv", { responseType: 'blob' });
    const csvStr = await response.data;
    const result = csvStr.split("\r\n").filter(i => i.length > 0);
    return result;
}
const getDirectory = async(source,keyword)=>{
    const response = await axios.get(source);
    const isContain = response.data.includes(`<${keyword}.ndx>`);
    return isContain;
}
