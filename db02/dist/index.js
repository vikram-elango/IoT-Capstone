"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt = __importStar(require("mqtt"));
const config_1 = require("./config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pg_1 = __importDefault(require("pg"));
/**
 * processMessageReceived (t: string, m: Buffer)
 *
 * This function processes incoming MQTT messages.
 *
 * @param t - The topic string.
 * @param m - The message buffer.
 * @param dbclient - The PostgreSQL client.
 */
function processMessageReceived(t, m, dbc) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Recv: ${m.toString()} on topic: ${t}`);
        // Split the topic string into its individual components
        const components = t.split('/');
        let deviceid = components[6];
        let metric = components[7];
        console.log(metric, 'metric');
        // Parse the message Buffer into a JSON object
        let payload = JSON.parse(m.toString());
        console.log(payload, 'payload');
        let ts = payload.timestamp;
        let value = payload.value;
        console.log(payload.value, 'value');
        // Determine the type of value and handle accordingly
        let valueStr;
        if (typeof value === 'boolean') {
            valueStr = value ? 'true' : 'false';
        }
        else if (typeof value === 'number') {
            valueStr = value.toString();
        }
        else if (typeof value === 'string') {
            valueStr = `'${value}'`;
        }
        else {
            console.log("Unsupported value type:", typeof value);
            return;
        }
        let sql_command = "INSERT INTO telemetry(timestamp,deviceid,metric,value) " +
            `VALUES('${ts}','${deviceid}','${metric}',${valueStr});`;
        // Execute the SQL command
        yield dbc.query(sql_command);
        console.log("Data inserted into telemetry table!");
    });
}
/*
* index.ts
*/
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let s = "Hello MQTT01";
        console.log(s);
        // Log current working directory and file paths
        console.log("cwd:", process.cwd());
        console.log("file:", __filename);
        console.log("path:", path.dirname(__filename));
        // Create fully qualified filenames for config.json and tags.txt
        let configFileName = config_1.Configuration.setConfigurationFilename("config.json");
        try {
            // Load configuration data from config.json
            let config = config_1.Configuration.readFileAsJSON(configFileName);
            console.log("MQTT Broker URL:", config.mqtt.brokerUrl);
            // MQTT connection setup
            let url = config.mqtt.brokerUrl + ":" + config.mqtt.mqttPort;
            console.log("URL: ", url);
            const mqttclient = yield mqtt.connectAsync(url);
            console.log("mqtt connected!");
            // PostgreSQL client setup
            const dbclient = new pg_1.default.Client(config.sql_config);
            console.log("database client created");
            // Make a connection to the PostgreSQL server
            yield dbclient.connect();
            console.log("database connected!");
            //read SQL table text file
            let sql_command = fs.readFileSync('./sql/setup_create.txt').toString();
            console.log("SQL command read!");
            // Issue the SQL command
            yield dbclient.query(sql_command);
            console.log("SQL command executed!");
            // Set up the topic to subscribe to
            let topic = config.mqtt.organization + '/' +
                config.mqtt.division + '/' +
                config.mqtt.plant + '/' +
                config.mqtt.area + '/' +
                config.mqtt.line + '/' +
                config.mqtt.workstation + '/' +
                config.mqtt.type + '/#';
            // Register the message event handler
            mqttclient.on('message', (topic, message) => processMessageReceived(topic, message, dbclient));
            // Subscribe to the topic
            yield mqttclient.subscribeAsync(topic);
            console.log("subscription established!");
            // set up asynchronous disconnection support via signals
            const shutdown = () => __awaiter(this, void 0, void 0, function* () {
                console.log("disconnecting our services now");
                // TODO: add in other requests to disconnect from services
                yield mqttclient.endAsync();
                yield dbclient.end();
                process.exit();
            });
            // Register the shutdown function to handle SIGINT and SIGTERM signals
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
        }
        catch (err) {
            console.log("Error:", err);
        }
    });
}
main();
//# sourceMappingURL=index.js.map