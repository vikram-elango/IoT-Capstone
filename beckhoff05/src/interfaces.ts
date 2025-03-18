/**
 * iMQTTPayload interface to define the structure of the MQTT payload.
 */
export interface iMQTTPayload {
    timestamp: string;
    value: string;
}

/**
 * is_iMQTTPayload function to verify if an object adheres to the iMQTTPayload interface.
 * 
 * @param obj - The object to verify.
 * @returns A boolean indicating whether the object adheres to the iMQTTPayload interface.
 */
export function is_iMQTTPayload(obj: any): boolean {
    if ((typeof obj === 'object') &&
        (typeof obj.timestamp === 'string') &&
        (typeof obj.value === 'string')) {
        return true;
    } else {
        return false;
    }
}
