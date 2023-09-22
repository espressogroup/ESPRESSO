const { workerData, parentPort } = require("worker_threads");
const axios = require('axios');

(async function () {
   let integratedResult = [];
    const response = await axios.get(`${workerData.source}${workerData.query}.ndx`).then((resp) => resp).catch((resp) => resp.response);
    if (response.status === 200) {
        const rows = response.data.split("\r\n").filter(i => i.length > 0);
        const webIdAccess = await axios.get(`${workerData.source}${workerData.webIdQuery}.webid`).then((resp) => resp).catch((resp) => resp.response);
        if(webIdAccess.status !== 200){
            parentPort.postMessage([]);
            return;
        }
        const webIdAccessList = webIdAccess.data.split("\r\n").filter(i => i.length > 0);
        for (let i = 0; i < rows.length; i++) {
            const [newAddres, frequency] = rows[i].split(",");
            const hasAccess = webIdAccessList.some(i => i === newAddres)
            if (hasAccess) {
                const result = await axios.get(`${workerData.source}${newAddres}.file`);
                if (result.status === 200) {
                    const [address] = result.data.split(",");
                    const newvalue = { "address": address, "frequency": frequency }
                    integratedResult = [...integratedResult, newvalue];
                }
            }
        }
    }
    parentPort.postMessage(integratedResult);
    return;
}());
