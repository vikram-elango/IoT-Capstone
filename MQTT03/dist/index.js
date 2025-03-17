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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt = __importStar(require("mqtt"));
const config_1 = require("./config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * processMessageReceived (t: string, m: Buffer)
 *
 * This function processes incoming MQTT messages.
 *
 * @param t - The topic string.
 * @param m - The message buffer.
 */
function processMessageReceived(t, m) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Recv: ${m.toString()} on topic: ${t}`);
        // split payload from MQTT into separate timestamp and value
        let payload = JSON.parse(m.toString());
        // Split the topic string into individual components
        let topicComponents = t.split('/');
        // Create the CSV data string with individual components
        let csvdata = `"${payload.timestamp}","${topicComponents.join('","')}",${payload.value}\n`;
        console.log("our parsed data: ", csvdata);
        // Append the CSV data to a new file named database2.csv
        fs.appendFileSync('database2.csv', csvdata);
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
            // Set up the topic to subscribe to
            let topic = config.mqtt.organization + '/' +
                config.mqtt.division + '/' +
                config.mqtt.plant + '/' +
                config.mqtt.area + '/' +
                config.mqtt.line + '/' +
                config.mqtt.workstation + '/' +
                config.mqtt.type + '/#';
            // Register the message event handler
            mqttclient.on('message', (topic, message) => processMessageReceived(topic, message));
            // Subscribe to the topic
            yield mqttclient.subscribeAsync(topic);
            console.log("subscription established!");
            // set up asynchronous disconnection support via signals
            const shutdown = () => __awaiter(this, void 0, void 0, function* () {
                console.log("disconnecting our services now");
                // TODO: add in other requests to disconnect from services
                yield mqttclient.endAsync();
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