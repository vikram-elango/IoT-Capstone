import * as mqtt from 'mqtt';
import * as fs from 'fs';
import * as path from 'path';
import { Configuration } from './config';
import { iMQTTPayload } from './interfaces';
import pg from 'pg'
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
    // split payload from MQTT into separate timestamp and value
    
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
        const dbclient = new pg.Client (config.sql_config);
        console.log ("database client created");
        await dbclient.connect();
    
        console.log("MQTT Broker URL:", config.mqtt.brokerUrl);

        // MQTT connection setup
        let url: string = config.mqtt.brokerUrl + ":" + config.mqtt.mqttPort;
        console.log("URL: ", url);
        const mqttclient: mqtt.MqttClient = await mqtt.connectAsync(url);
        console.log("mqtt connected!");

        let sql_command:string = fs.readFileSync('./sql/setup_create.txt').toString();

        let d: Date = new Date(Date.now())
        let ts: string = d.toISOString()
        let deviceid: string = "test_device"
        let metric: string = "PLCtag"
        let value: number = 555.55

        sql_command = "INSERT INTO  telemetry(timestamp, deviceid, metric, value)"+`VALUES('${ts}', '${deviceid}', '${metric}', '${value}')`
        await dbclient.query (sql_command);

        
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
            await dbclient.end();
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
