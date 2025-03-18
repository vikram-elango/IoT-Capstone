"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_iMQTTPayload = void 0;
/**
 * is_iMQTTPayload function to verify if an object adheres to the iMQTTPayload interface.
 *
 * @param obj - The object to verify.
 * @returns A boolean indicating whether the object adheres to the iMQTTPayload interface.
 */
function is_iMQTTPayload(obj) {
    if ((typeof obj === 'object') &&
        (typeof obj.timestamp === 'string') &&
        (typeof obj.value === 'string')) {
        return true;
    }
    else {
        return false;
    }
}
exports.is_iMQTTPayload = is_iMQTTPayload;
//# sourceMappingURL=interfaces.js.map