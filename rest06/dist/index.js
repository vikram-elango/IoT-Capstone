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
const express_1 = __importDefault(require("express"));
const pg_1 = __importDefault(require("pg"));
const config_json_1 = __importDefault(require("../config.json"));
let mqttclient = mqtt.connect("mqtt://127.0.0.1:1883");
const PORT = 4000; // listen to port 4000 for web requests
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
    app.use(express_1.default.static('public'));
    // API router for filter
    const apiRouter2 = express_1.default.Router();
    // Middleware specific to this API router
    apiRouter2.use((req, res, next) => {
        console.log("API router specific middleware!");
        res.header('Access-Control-Allow-Origin', '*');
        next();
    });
    // Route handler for filter API
    apiRouter2.get('/filter', (req, res) => __awaiter(this, void 0, void 0, function* () {
        console.log("In our filter API handler");
        // Default values for query parameters
        let from = req.query.from ? req.query.from.toString() : '1970-01-01 00:00:00.000';
        let to = req.query.to ? req.query.to.toString() : '9999-12-31 23:59:59.999';
        let metric = req.query.metric ? req.query.metric.toString() : '';
        let last = convertDataToInteger(req.query.last, 10);
        // Build the SQL query string
        let queryString = `SELECT * FROM telemetry WHERE timestamp >= '${from}' AND timestamp <= '${to}'`;
        if (metric) {
            queryString += ` AND metric = '${metric}'`;
        }
        queryString += ` ORDER BY timestamp DESC LIMIT 100`;
        console.log(`Query String: ${queryString}`);
        // Instantiate the database client
        const client = new pg_1.default.Client(config_json_1.default.pg);
        try {
            // Connect to the database
            yield client.connect();
            console.log('connected');
            // Execute the query
            const result = yield client.query(queryString);
            // Capture the return JSON data
            const rows = result.rows;
            // Send the JSON data as the GET response
            res.json(rows);
        }
        catch (err) {
            console.error('Database query error', err);
            res.status(500).send('Internal Server Error');
        }
        finally {
            // End the connection
            yield client.end();
        }
    }));
    // Route handler for power API
    apiRouter2.get('/power', (req, res) => __awaiter(this, void 0, void 0, function* () {
        console.log("In our power API handler");
        // Default values for query parameters
        let from = req.query.from ? req.query.from.toString() : '1970-01-01 00:00:00.000';
        let to = req.query.to ? req.query.to.toString() : '9999-12-31 23:59:59.999';
        // Build the SQL query string to get torque values
        let queryString = `SELECT timestamp, value FROM telemetry WHERE timestamp >= '${from}' AND timestamp <= '${to}' AND metric LIKE 'HMI_GVL.M.Rob1.MACTTORQUE%'`;
        console.log(`Query String: ${queryString}`);
        // Instantiate the database client
        const client = new pg_1.default.Client(config_json_1.default.pg);
        try {
            // Connect to the database
            yield client.connect();
            console.log('connected');
            // Execute the query
            const result = yield client.query(queryString);
            console.log(result);
            // Capture the return JSON data
            const rows = result.rows;
            console.log(`Rows: ${JSON.stringify(rows)}`);
            // Check if rows are empty
            if (rows.length === 0) {
                console.log('No torque data found');
                res.json([]);
                return;
            }
            // Calculate the maximum absolute torque value
            let maxTorque = 0;
            rows.forEach(row => {
                const torque = Math.abs(parseFloat(row.value));
                if (torque > maxTorque) {
                    maxTorque = torque;
                }
            });
            console.log(`Max Torque: ${maxTorque}`);
            // Calculate power utilization as a percentage of the maximum torque
            const powerUtilization = rows.map(row => {
                const torque = Math.abs(parseFloat(row.value));
                return {
                    timestamp: row.timestamp,
                    power: (torque / maxTorque) * 100
                };
            });
            console.log(`Power Utilization: ${JSON.stringify(powerUtilization)}`);
            // Send the JSON data as the GET response
            res.json(powerUtilization);
        }
        catch (err) {
            console.error('Database query error', err);
            res.status(500).send('Internal Server Error');
        }
        finally {
            // End the connection
            yield client.end();
        }
    }));
    // Use the router
    app.use(apiRouter2);
    // Start the server
    app.listen(PORT, () => {
        console.log(`Hello Seattle, I’m listening! (on port ${PORT})`);
    });
}
main();
//# sourceMappingURL=index.js.map