import * as ads from 'ads-client';
import config from './config.json';

import * as mqtt from 'mqtt';
let mqttclient:mqtt.MqttClient = mqtt.connect ("mqtt://127.0.0.1:1883");
/*
* index.ts
*/
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
    const adsclient = new ads.Client (config.ads);
    // make a connection to the Beckhoff platform 
    await adsclient.connect();
    // set up to read a PLC tag into a SymbolData variable called data
    let data:ads.ReadValueResult;
    for (let x:number = 0; x < tags.length; x++) {
        // await the results of reading that PLC tag and output
        data = await adsclient.readValue (tags[x]);
        console.log ("data for tag:", tags[x],  "is:", data.value, data.dataType.adsDataTypeStr);
        }
        
    //data = await adsclient.readValue (tags[0]);
    //console.log ("data:", data.value);
    // disconnect from ADS
    adsclient.disconnect();
    } catch (err) {
    console.log ("Error:", err);

}
}
main();
