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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt = __importStar(require("mqtt"));
const express_1 = __importDefault(require("express"));
let mqttclient = mqtt.connect("mqtt://127.0.0.1:1883");
const PORT = 4000; // listen to port 4000 for web requests
/*
* index.ts
*/
function convertDataToInteger(data, def) {
    let n = def;
    if (data != undefined) {
        n = parseInt(data.toString(), 10);
        if (Number.isNaN(n)) {
            n = def;
        }
    }
    return n;
}
function generateTimesTable(ttable, start, end) {
    let output = [];
    let offset = 0;
    let p = 0;
    let x = 0;
    for (x = start; x <= end; x++) {
        p = x * ttable;
        output[offset] = `${x} x ${ttable} = ${p}`;
        console.log(`${x} x ${ttable} = ${p}`);
        offset++;
    }
    return output;
}
function main() {
    let s = "Hello project00";
    console.log(s);
    const app = (0, express_1.default)(); // our new express app
    // Middleware for logging purposes
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
    // Home route
    app.get('/', (req, res) => {
        res.send("Welcome to our first TypeScript REST API App!");
    });
    // API router
    const apiRouter2 = express_1.default.Router();
    // Middleware specific to this API router
    apiRouter2.use((req, res, next) => {
        console.log("API router specific middleware!");
        next();
    });
    // Route handler for API router
    apiRouter2.get('/timestable/:table', (req, res) => {
        console.log("In our times table API handler");
        let ttable = convertDataToInteger(req.params.table, 1);
        let start = convertDataToInteger(req.query.start, 1);
        let end = convertDataToInteger(req.query.end, 10);
        console.log(`ttable: ${ttable} start: ${start} end: ${end}`);
        // res.send(`Times table endpoint reached! Table: ${ttable}, Start: ${start}, End: ${end}`);
        let tableoutput = generateTimesTable(ttable, start, end);
        res.json(tableoutput);
    });
    // Use the router
    app.use(apiRouter2);
    // Start the server
    app.listen(PORT, () => {
        console.log(`Hello Seattle, I’m listening! (on port ${PORT})`);
    });
}
main();
//# sourceMappingURL=index.js.map