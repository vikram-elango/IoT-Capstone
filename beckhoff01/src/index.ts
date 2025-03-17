import * as ads from 'ads-client';
import config from './config.json';
import * as fs from 'fs';
import * as path from 'path';
import * as mqtt from 'mqtt';
let mqttclient:mqtt.MqttClient = mqtt.connect ("mqtt://127.0.0.1:1883");
/*
* index.ts
*/

/*
* processReadRequest (adsclient: ads.Client, tags:string[]);
* 
* This function will process all ADS reads to PLC tags in the tags array.
*/

async function processReadRequest (adsclient:ads.Client, tags:string[])
{
// set up a variable to hold the results of the read of PLC data
let data:ads.ReadValueResult;
// iterate through all tags

for (let x:number = 0; x < tags.length; x++) {
// await the results of reading that PLC tag and output
data = await adsclient.readValue (tags[x]);
console.log ("data for tag:", tags[x], "is:", data.value,data.dataType.adsDataTypeStr);
let filename: string = path.join("c:/capstone/data/", tags[x].replace(/\./g, '_') + ".json");

let fileData = {
    timestamp: new Date().toISOString(),
    tag: tags[x],
    value: data.value,
    dataType: data.dataType.adsDataTypeStr
};

fs.writeFileSync(filename, JSON.stringify(fileData, null, 2));

}
}


async function main()
{
let s:string = "Hello Beckhoff01";
console.log (s);
console.log ("localAmsNetId:", config.ads.localAmsNetId);
let tags:string[] = [ "HMI_GVL.M.Rob1.ROBOTPOS.X", 
    "HMI_GVL.M.Rob1.ROBOTPOS.Y", 
    "HMI_GVL.M.Rob1.ROBOTPOS.Z", 
    "HMI_GVL.M.Rob1.INITIALIZED",
    "HMI_GVL.M.Rob1.RUNNING",
    "HMI_GVL.M.Rob1.WSVIOLATION",
    "HMI_GVL.M.Rob1.PAUSED",
    "HMI_GVL.M.Rob1.SPEEDPERCENTAGE",
    "HMI_GVL.M.Rob1.FINISHEDPARTNUM",
    "HMI_GVL.M.Rob1.MACTTORQUE"

];
try {
     // build a client object
     const adsclient = new ads.Client(config.ads);
     // make a connection to the Beckhoff platform 
     await adsclient.connect();

      // Set up the interval to call processReadRequest every 1000 milliseconds (1 second)
    setInterval(processReadRequest, 1000, adsclient, tags);

    const shutdown = async () => {
        console.log("disconnecting our services now");
        await adsclient.disconnect();
        // TODO: add in other requests to disconnect from services
        process.exit();
    };
     // call the processReadRequest function with adsclient and tags
     //await processReadRequest(adsclient, tags);
     process.on('SIGINT', shutdown);
     process.on('SIGTERM', shutdown);


     // disconnect from ADS
     //await adsclient.disconnect();
    } catch (err) {
    console.log ("Error:", err);

}
}
main();


