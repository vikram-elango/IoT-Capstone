import * as mqtt from 'mqtt';
import express, { Request, Response, NextFunction } from 'express';
import pg from 'pg';
import config from '../config.json';

let mqttclient: mqtt.MqttClient = mqtt.connect("mqtt://127.0.0.1:1883");
const PORT: number = 4000; // listen to port 4000 for web requests

function convertDataToInteger(data: any, def: number): number {
    let n: number = def;
    if (data != undefined) {
        n = parseInt(data.toString(), 10);
        if (Number.isNaN(n)) {
            n = def;
        }
    }
    return n;
}

function main() {
    let s: string = "Hello project00";
    //console.log(s);

    const app: express.Application = express(); // our new express app

    // Middleware for logging purposes
    app.use((req: Request, res: Response, next: NextFunction) => {
        //console.log(`${req.method} ${req.path}`);
        next();
    });

    // Home route
    app.get('/', (req: Request, res: Response) => {
        res.send("Welcome to our first TypeScript REST API App!");
    });
    app.use(express.static('public'));

    // API router for filter
    const apiRouter2 = express.Router();

    // Middleware specific to this API router
    apiRouter2.use((req: Request, res: Response, next: NextFunction) => {
        //console.log("API router specific middleware!");
        res.header('Access-Control-Allow-Origin', '*');

        next();
    });

    // Route handler for filter API
    apiRouter2.get('/filter', async (req: Request, res: Response) => {
        //console.log("In our filter API handler");

        // Default values for query parameters
        let from: string = req.query.from ? req.query.from.toString() : '1970-01-01 00:00:00.000';
        let to: string = req.query.to ? req.query.to.toString() : '9999-12-31 23:59:59.999';
        let metric: string = req.query.metric ? req.query.metric.toString() : '';
        let last: number = convertDataToInteger(req.query.last, 10);

        // Build the SQL query string
        let queryString = `SELECT * FROM telemetry WHERE timestamp >= '${from}' AND timestamp <= '${to}'`;
        if (metric) {
            queryString += ` AND metric = '${metric}'`;
        }
        queryString += ` ORDER BY timestamp DESC LIMIT 1000`;

        //console.log(`Query String: ${queryString}`);

        // Instantiate the database client
        const client = new pg.Client(config.pg);

        try {
            // Connect to the database
            await client.connect();
            //console.log('connected')

            // Execute the query
            const result = await client.query(queryString);

            // Capture the return JSON data
            const rows = result.rows;

            // Send the JSON data as the GET response
            res.json(rows);
        } catch (err) {
            console.error('Database query error', err);
            res.status(500).send('Internal Server Error');
        } finally {
            // End the connection
            await client.end();
        }
    });



    // Route handler for power API
// Route handler for power API
apiRouter2.get('/power', async (req: Request, res: Response) => {
    // Default values for query parameters
    let from: string = req.query.from ? req.query.from.toString() : '1970-01-01 00:00:00.000';
    let to: string = req.query.to ? req.query.to.toString() : '9999-12-31 23:59:59.999';
    let last: number = convertDataToInteger(req.query.last, 5000); // Fetch last 100 entries by default

    // Build the SQL query string to get torque values
    let queryString = `
        SELECT timestamp, value 
        FROM telemetry 
        WHERE timestamp >= '${from}' 
        AND timestamp <= '${to}' 
        AND metric LIKE 'HMI_GVL.M.Rob1.MACTTORQUE%'
        ORDER BY timestamp DESC 
        LIMIT ${last}
    `;

    const client = new pg.Client(config.pg);

    try {
        await client.connect();
        const result = await client.query(queryString);
        const rows = result.rows;

        if (rows.length === 0) {
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

        // Calculate power utilization as a percentage of the maximum torque
        const powerUtilization = rows.map(row => {
            const torque = Math.abs(parseFloat(row.value));
            const power = (torque / maxTorque) * 100;
            return {
                timestamp: row.timestamp,
                power: power
            };
        });

        res.json(powerUtilization);
    } catch (err) {
        console.error('Database query error', err);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.end();
    }
});

apiRouter2.get('/xyz', async (req: Request, res: Response) => {
    // Default values for query parameters
    let from: string = req.query.from ? req.query.from.toString() : '1970-01-01 00:00:00.000';
    let to: string = req.query.to ? req.query.to.toString() : '9999-12-31 23:59:59.999';
    let last: number = convertDataToInteger(req.query.last, 1); // Fetch the latest value by default

    // Build the SQL query string to get XYZ positions
    let queryString = `
        SELECT timestamp, metric, value 
        FROM telemetry 
        WHERE timestamp >= '${from}' 
        AND timestamp <= '${to}' 
        AND (metric = 'HMI_GVL.M.Rob1.ROBOTPOS.X' 
             OR metric = 'HMI_GVL.M.Rob1.ROBOTPOS.Y' 
             OR metric = 'HMI_GVL.M.Rob1.ROBOTPOS.Z')
        ORDER BY timestamp DESC 
        LIMIT 3
    `;

    const client = new pg.Client(config.pg);

    try {
        await client.connect();
        const result = await client.query(queryString);
        const rows = result.rows;

        if (rows.length === 0) {
            res.json([]);
            return;
        }

        // Organize the data into X, Y, Z positions
        const xyzData = {
            x: rows.find(row => row.metric === 'HMI_GVL.M.Rob1.ROBOTPOS.X')?.value || 0,
            y: rows.find(row => row.metric === 'HMI_GVL.M.Rob1.ROBOTPOS.Y')?.value || 0,
            z: rows.find(row => row.metric === 'HMI_GVL.M.Rob1.ROBOTPOS.Z')?.value || 0,
            timestamp: rows[0].timestamp // Use the latest timestamp
        };

        res.json(xyzData);
    } catch (err) {
        console.error('Database query error', err);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.end();
    }
});


    // Use the router
    app.use(apiRouter2);

    // Start the server
    app.listen(PORT, () => {
        //console.log(`Hello Seattle, I’m listening! (on port ${PORT})`);
    });
}

main();
