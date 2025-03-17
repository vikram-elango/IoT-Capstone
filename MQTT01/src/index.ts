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

/**
 * processMessageReceived (t: string, m: Buffer)
 * 
 * This function processes incoming MQTT messages.
 * 
 * @param t - The topic string.
 * @param m - The message buffer.
 */
async function processMessageReceived(t: string, m: Buffer) {
    console.log(`Recv: ${m.toString()} on topic: ${t}`);
    // TODO: add in additional processing for the received message
}

/*
* index.ts
*/
async function main() {
    let s: string = "Hello MQTT01";
    console.log(s);

    // Log current working directory and file paths
    console.log("cwd:", process.cwd());
    console.log("file:", __filename);
    console.log("path:", path.dirname(__filename));

    // Create fully qualified filenames for config.json and tags.txt
    let configFileName: string = setConfigurationFilename("config.json");

    try {
        // Load configuration data from config.json
        config = readFileAsJSON(configFileName);
        console.log("MQTT Broker URL:", config.mqtt.brokerUrl);

        // MQTT connection setup
        let url: string = config.mqtt.brokerUrl + ":" + config.mqtt.mqttPort;
        console.log("URL: ", url);
        const mqttclient: mqtt.MqttClient = await mqtt.connectAsync(url);
        console.log("mqtt connected!");

        // Set up the topic to subscribe to
        let topic: string = config.mqtt.organization + '/' +
                            config.mqtt.division + '/' +
                            config.mqtt.plant + '/' +
                            config.mqtt.area + '/' +
                            config.mqtt.line + '/' +
                            config.mqtt.workstation + '/' +
                            config.mqtt.type + '/#';

        // Register the message event handler
        mqttclient.on('message', (topic, message) => processMessageReceived(topic, message));

        // Subscribe to the topic
        await mqttclient.subscribeAsync(topic);
        console.log("subscription established!");

        // set up asynchronous disconnection support via signals
        const shutdown = async () => {
            console.log("disconnecting our services now");
            // TODO: add in other requests to disconnect from services
            await mqttclient.endAsync();
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
