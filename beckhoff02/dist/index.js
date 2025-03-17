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
const mqtt = __importStar(require("mqtt"));
let mqttclient = mqtt.connect("mqtt://127.0.0.1:1883");
/*
* index.ts
*/
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let s = "Hello Beckhoff01";
        console.log(s);
        console.log("localAmsNetId:", config_json_1.default.ads.localAmsNetId);
        let tags = ["HMI_GVL.M.Rob1.ROBOTPOS.X",
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
            const adsclient = new ads.Client(config_json_1.default.ads);
            // make a connection to the Beckhoff platform 
            yield adsclient.connect();
            // set up to read a PLC tag into a SymbolData variable called data
            let data;
            for (let x = 0; x < tags.length; x++) {
                // await the results of reading that PLC tag and output
                data = yield adsclient.readValue(tags[x]);
                console.log("data for tag:", tags[x], "is:", data.value, data.dataType.adsDataTypeStr);
            }
            //data = await adsclient.readValue (tags[0]);
            //console.log ("data:", data.value);
            // disconnect from ADS
            adsclient.disconnect();
        }
        catch (err) {
            console.log("Error:", err);
        }
    });
}
main();
//# sourceMappingURL=index.js.map