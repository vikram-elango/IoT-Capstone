import * as ads from 'ads-client';
import * as fs from 'fs';
import * as path from 'path';
import * as mqtt from 'mqtt';

/**
 * readFileAsArray (fname: string): string[]
 * 
 * This function reads the contents of a file and returns them as a string array.
 * Each row in the file is delimited by a return and newline character combination ("\r\n").
 * 
 * @param fname - The filename to read from.
 * @returns A string array containing the rows of text from the file.
 */
function readFileAsArray(fname: string): string[] {
    try {
        let textlines: string[] = fs.readFileSync(fname).toString().split("\r\n");
        return textlines.filter(line => line.trim() !== ''); // Filter out any empty lines
    } catch (err) {
        console.error(`Error reading file ${fname}:`, err);
        return [];
    }
}

/**
 * readFileAsJSON (fname: string): any
 * 
 * This function reads the contents of a file and returns them as a JSON object.
 * 
 * @param fname - The filename to read from.
 * @returns A JSON object containing the data from the file.
 */
function readFileAsJSON(fname: string): any {
    try {
        let data: string = fs.readFileSync(fname).toString();
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file ${fname}:`, err);
        return {};
    }
}

/**
 * setConfigurationFilename (fname: string): string
 * 
 * This function creates a fully qualified path to the configuration file no matter where the compiled JavaScript is run from.
 * 
 * @param fname - The name of the path relative file.
 * @returns A string that gives a fully qualified path to the configuration file.
 */
function setConfigurationFilename(fname: string): string {
    let fn: string = path.join(path.dirname(__filename), "../", fname);
    return fn;
}

// Global variable declaration for config
var config: any;

async function processReadRequest(adsclient: ads.Client, tags: string[], mqttclient: mqtt.MqttClient) {
    // set up a variable to hold the results of the read of PLC data
    let data: ads.ReadValueResult;
    // one common time stamp for all of the readings we’re doing
    let d: Date = new Date();
    // iterate through all tags
    for (let x: number = 0; x < tags.length; x++) {
        // Skip empty tags to avoid runtime errors
        if (tags[x].trim() === '') continue;

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

    // Log current working directory and file paths
    console.log("cwd:", process.cwd());
    console.log("file:", __filename);
    console.log("path:", path.dirname(__filename));

    // Create fully qualified filenames for config.json and tags.txt
    let configFileName: string = setConfigurationFilename("config.json");
    let tagsFileName: string = setConfigurationFilename("tags.txt");

    // Load configuration data from config.json
    config = readFileAsJSON(configFileName);
    console.log("localAmsNetId:", config.ads.localAmsNetId);
    
    // Read tags from the tags.txt file
    let tags: string[] = readFileAsArray(tagsFileName);
    
    // Verify all tags loaded cleanly
    tags.forEach(tag => console.log("Loaded tag:", tag));
    
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

        // Comment out the one-shot request
        // await processReadRequest(adsclient, tags, mqttclient);
        
        // Re-establish the interval processor
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
