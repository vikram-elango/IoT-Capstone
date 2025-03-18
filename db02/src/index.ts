import * as mqtt from 'mqtt';
import { Configuration } from './config';
import { iMQTTPayload, is_iMQTTPayload } from './interfaces';
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

/**
 * processMessageReceived (t: string, m: Buffer)
 * 
 * This function processes incoming MQTT messages.
 * 
 * @param t - The topic string.
 * @param m - The message buffer.
 * @param dbclient - The PostgreSQL client.
 */
async function processMessageReceived(t: string, m: Buffer, dbc: pg.Client) {
    console.log(`Recv: ${m.toString()} on topic: ${t}`);
    // Split the topic string into its individual components
    const components: string[] = t.split('/');
    let deviceid: string = components[0];
    let metric: string = components[1];
    console.log(metric, 'metric')
    // Parse the message Buffer into a JSON object
    let payload: any = JSON.parse(m.toString());
    console.log(payload, 'payload')
    let ts: string = payload.timestamp;
    let value: any = payload.value;
    console.log(payload.value, 'value')
    // Determine the type of value and handle accordingly
    let valueStr: string;
    if (typeof value === 'boolean') {
        valueStr = value ? 'true' : 'false';
    } else if (typeof value === 'number') {
        valueStr = value.toString();
    } else if (typeof value === 'string') {
        valueStr = `'${value}'`;
    } else {
        console.log("Unsupported value type:", typeof value);
        return;
    }

    let sql_command = 
        "INSERT INTO telemetry(timestamp,deviceid,metric,value) " +
        `VALUES('${ts}','${deviceid}','${metric}',${valueStr});`;

    // Execute the SQL command
    await dbc.query(sql_command);
    console.log("Data inserted into telemetry table!");
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

        // PostgreSQL client setup
        const dbclient = new pg.Client(config.sql_config);
        console.log("database client created");

        // Make a connection to the PostgreSQL server
        await dbclient.connect();
        console.log("database connected!");

        //read SQL table text file
        let sql_command:string = 
        fs.readFileSync('./sql/setup_create.txt').toString();
        console.log("SQL command read!");

        // Issue the SQL command
        await dbclient.query(sql_command);
        console.log("SQL command executed!");

        // Set up the topic to subscribe to
        let topic: string = config.mqtt.organization + '/' +
                            config.mqtt.division + '/' +
                            config.mqtt.plant + '/' +
                            config.mqtt.area + '/' +
                            config.mqtt.line + '/' +
                            config.mqtt.workstation + '/' +
                            config.mqtt.type + '/#';

        // Register the message event handler
        mqttclient.on('message', (topic, message) => processMessageReceived(topic, message, dbclient));

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
