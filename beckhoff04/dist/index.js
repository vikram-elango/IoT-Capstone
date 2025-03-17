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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ads = __importStar(require("ads-client"));
const config_json_1 = __importDefault(require("./config.json"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mqtt = __importStar(require("mqtt"));
/*
* processReadRequest (adsclient: ads.Client, tags: string[], mqttclient: mqtt.MqttClient);
*
* This function will process all ADS reads to PLC tags in the tags array and publish the data to the MQTT broker.
*/
function processReadRequest(adsclient, tags, mqttclient) {
    return __awaiter(this, void 0, void 0, function* () {
        // set up a variable to hold the results of the read of PLC data
        let data;
        // one common time stamp for all of the readings we’re doing
        let d = new Date();
        // iterate through all tags
        for (let x = 0; x < tags.length; x++) {
            // await the results of reading that PLC tag and output
            data = yield adsclient.readValue(tags[x]);
            console.log("data for tag:", tags[x], "is:", data.value, data.dataType.adsDataTypeStr);
            // Create the filename string
            let filename = path.join("c:/capstone/data/", tags[x].replace(/\./g, '_') + ".json");
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
            let topic = config_json_1.default.mqtt.baseTopic + tags[x];
            // next, set up a payload with a timestamp and the data value
            let payload = {
                "timestamp": d.toISOString(),
                "value": data.value.toString()
            };
            // and publish to the MQTT broker
            yield mqttclient.publishAsync(topic, JSON.stringify(payload));
            console.log("published:", topic, "with payload:", JSON.stringify(payload));
        }
    });
}
/*
* index.ts
*/
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let s = "Hello Beckhoff01";
        console.log(s);
        console.log("localAmsNetId:", config_json_1.default.ads.localAmsNetId);
        // Add additional tags to the array
        let tags = [
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
            const adsclient = new ads.Client(config_json_1.default.ads);
            // make a connection to the Beckhoff platform 
            yield adsclient.connect();
            // MQTT connection setup
            let url = config_json_1.default.mqtt.brokerUrl + ":" + config_json_1.default.mqtt.mqttPort;
            console.log("URL: ", url);
            const mqttclient = yield mqtt.connectAsync(url);
            console.log("mqtt connected!");
            // Build the complete base topic string dynamically
            config_json_1.default.mqtt.baseTopic = config_json_1.default.mqtt.organization + '/' +
                config_json_1.default.mqtt.division + '/' +
                config_json_1.default.mqtt.plant + '/' +
                config_json_1.default.mqtt.area + '/' +
                config_json_1.default.mqtt.line + '/' +
                config_json_1.default.mqtt.workstation + '/' +
                config_json_1.default.mqtt.type + '/';
            // Comment out the interval handler
            // setInterval(processReadRequest, 1000, adsclient, tags);
            // Add a one-shot request to process read requests
            //await processReadRequest(adsclient, tags, mqttclient);
            setInterval(processReadRequest, 1000, adsclient, tags, mqttclient);
            // set up asynchronous disconnection support via signals
            const shutdown = () => __awaiter(this, void 0, void 0, function* () {
                console.log("disconnecting our services now");
                yield adsclient.disconnect();
                yield mqttclient.endAsync();
                // TODO: add in other requests to disconnect from services
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