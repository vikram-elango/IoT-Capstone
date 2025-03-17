import * as ads from 'ads-client';
import config from './config.json';
import * as fs from 'fs';
import * as path from 'path';
import * as mqtt from 'mqtt';

/*
* processReadRequest (adsclient: ads.Client, tags: string[], mqttclient: mqtt.MqttClient);
* 
* This function will process all ADS reads to PLC tags in the tags array and publish the data to the MQTT broker.
*/
async function processReadRequest(adsclient: ads.Client, tags: string[], mqttclient: mqtt.MqttClient) {
    // set up a variable to hold the results of the read of PLC data
    let data: ads.ReadValueResult;
    // one common time stamp for all of the readings we’re doing
    let d: Date = new Date();
    // iterate through all tags
    for (let x: number = 0; x < tags.length; x++) {
        // await the results of reading that PLC tag and output
        data = await adsclient.readValue(tags[x]);
        console.log("data for tag:", tags[x], "is:", data.value, data.dataType.adsDataTypeStr);

        // Create the filename string
        let filename: string = path.join("c:/capstone/data/", tags[x].replace(/\./g, '_') + ".json");

        // Create the data object to write to the file
        let fileData = {
            timestamp: d.toISOString(),
            tag: tags[x],
            value: data.value,
            dataType: data.dataType.adsDataTypeStr
        };

        // Write the data to the file
        fs.writeFileSync(filename, JSON.stringify(fileData, null, 2));

        // add in MQTT payload and topic processing
        // first, set up a new topic for the PLC tag we just extracted
        let topic: string = config.mqtt.baseTopic + tags[x];
        // next, set up a payload with a timestamp and the data value
        let payload = {
            "timestamp": d.toISOString(),
            "value": data.value.toString()
        };
        // and publish to the MQTT broker
        await mqttclient.publishAsync(topic, JSON.stringify(payload));
        console.log("published:", topic, "with payload:", JSON.stringify(payload));
    }
}

/*
* index.ts
*/
async function main() {
    let s: string = "Hello Beckhoff01";
    console.log(s);
    console.log("localAmsNetId:", config.ads.localAmsNetId);
    
    // Add additional tags to the array
    let tags: string[] = [
        
        "HMI_GVL.M.INITIALIZED",
        "HMI_GVL.M.RUNNING",
        "HMI_GVL.M.PAUSED",
        "HMI_GVL.M.SAFETY_ENABLE",
        "HMI_GVL.M.SPEEDPERCENTAGE",
        "HMI_GVL.M.FINISHEDPARTNUM",

        "HMI_GVL.M.Rob1.INITIALIZED",
        "HMI_GVL.M.Rob1.RUNNING",
        "HMI_GVL.M.Rob1.WSVIOLATION",
        "HMI_GVL.M.Rob1.PAUSED",
        "HMI_GVL.M.Rob1.SPEEDPERCENTAGE",
        "HMI_GVL.M.Rob1.FINISHEDPARTNUM",

        "HMI_GVL.M.Rob1.ROBOTPOS.X",
        "HMI_GVL.M.Rob1.ROBOTPOS.Y",
        "HMI_GVL.M.Rob1.ROBOTPOS.Z",

        "HMI_GVL.M.Rob1.MACTTORQUE[1]",
        "HMI_GVL.M.Rob1.MACTTORQUE[2]",
        "HMI_GVL.M.Rob1.MACTTORQUE[3]",
        "HMI_GVL.M.Rob1.MACTTORQUE[4]"

        
        // Add the new tag here
    ];
    
    try {
        // build a client object
        const adsclient = new ads.Client(config.ads);
        // make a connection to the Beckhoff platform 
        await adsclient.connect();
        
        // MQTT connection setup
        let url: string = config.mqtt.brokerUrl + ":" + config.mqtt.mqttPort;
        console.log("URL: ", url);
        const mqttclient: mqtt.MqttClient = await mqtt.connectAsync(url);
        console.log("mqtt connected!");

        // Build the complete base topic string dynamically
        config.mqtt.baseTopic = config.mqtt.organization + '/' +
        config.mqtt.division + '/' +
        config.mqtt.plant + '/' +
        config.mqtt.area + '/' +
        config.mqtt.line + '/' +
        config.mqtt.workstation + '/' +
        config.mqtt.type + '/';
        // Comment out the interval handler
        // setInterval(processReadRequest, 1000, adsclient, tags);
        
        // Add a one-shot request to process read requests
        //await processReadRequest(adsclient, tags, mqttclient);
        setInterval(processReadRequest, 1000, adsclient, tags, mqttclient);
        // set up asynchronous disconnection support via signals
        const shutdown = async () => {
            console.log("disconnecting our services now");
            await adsclient.disconnect();
            await mqttclient.endAsync();
            // TODO: add in other requests to disconnect from services
            process.exit();
        };
        
        // Register the shutdown function to handle SIGINT and SIGTERM signals
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        
    } catch (err) {
        console.log("Error:", err);
    }
}

main();
