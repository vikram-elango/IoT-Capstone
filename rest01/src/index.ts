import * as mqtt from 'mqtt';
import express, { Request, Response, NextFunction } from 'express';

let mqttclient: mqtt.MqttClient = mqtt.connect("mqtt://127.0.0.1:1883");
const PORT: number = 4000; // listen to port 4000 for web requests

/*
* index.ts
*/
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

function generateTimesTable(ttable: number, start:number, end: number): string[]{
    let output: string[]=[]
    let offset:number = 0
    let p:number = 0 
    let x: number = 0;
    for (x= start; x<=end; x++){
        p = x*ttable
        output[offset] = `${x} x ${ttable} = ${p}`
        console.log(`${x} x ${ttable} = ${p}`)
        offset++
    }
    return output 
}

function main() {
    let s: string = "Hello project00";
    console.log(s);

    const app: express.Application = express(); // our new express app

    // Middleware for logging purposes
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });

    // Home route
    app.get('/', (req: Request, res: Response) => {
        res.send("Welcome to our first TypeScript REST API App!");
    });

    // API router
    const apiRouter = express.Router();

    // Middleware specific to this API router
    apiRouter.use((req: Request, res: Response, next: NextFunction) => {
        console.log("API router specific middleware!");
        next();
    });

    // Route handler for API router
    apiRouter.get('/timestable/:table', (req: Request, res: Response) => {
        console.log("In our times table API handler");

        let ttable: number = convertDataToInteger(req.params.table, 1);
        let start: number = convertDataToInteger(req.query.start, 1);
        let end: number = convertDataToInteger(req.query.end, 10);
        console.log(`ttable: ${ttable} start: ${start} end: ${end}`);



        // res.send(`Times table endpoint reached! Table: ${ttable}, Start: ${start}, End: ${end}`);

        let tableoutput: string[] = generateTimesTable(ttable, start, end)
        res.json(tableoutput)

    });

    // Use the router
    app.use(apiRouter);

    // Start the server
    app.listen(PORT, () => {
        console.log(`Hello Seattle, I’m listening! (on port ${PORT})`);
    });
}

main();
