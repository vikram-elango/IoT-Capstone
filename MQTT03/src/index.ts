import * as mqtt from 'mqtt';
import { Configuration } from './config';
import * as fs from 'fs';
import * as path from 'path';

/**f
 * processMessageReceived (t: string, m: Buffer)
 * 
 * This function processes incoming MQTT messages.
 * 
 * @param t - The topic string.
 * @param m - The message buffer.
 */
async function processMessageReceived(t: string, m: Buffer) {
    console.log(`Recv: ${m.toString()} on topic: ${t}`);
    // split payload from MQTT into separate timestamp and value
    let payload = JSON.parse(m.toString());

    // Split the topic string into individual components
    let topicComponents = t.split('/');

    // Create the CSV data string with individual components
    let csvdata: string = `"${payload.timestamp}","${topicComponents.join('","')}",${payload.value}\n`;
    console.log("our parsed data: ", csvdata);

    // Append the CSV data to a new file named database2.csv
    fs.appendFileSync('database2.csv', csvdata);
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
    let configFileName: string = Configuration.setConfigurationFilename("config.json");

    try {
        // Load configuration data from config.json
        let config = Configuration.readFileAsJSON(configFileName);
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
