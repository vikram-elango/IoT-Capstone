import * as mqtt from 'mqtt';
let mqttclient:mqtt.MqttClient = mqtt.connect ("mqtt://127.0.0.1:1883");
/*
* index.ts
*/
function main()
{
let s:string = "Hello project00";
console.log (s);
}
main();
