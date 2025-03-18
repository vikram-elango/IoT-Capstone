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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Configuration class to handle configuration-related functionalities.
 */
class Configuration {
    /**
     * setConfigurationFilename (fname: string): string
     *
     * This function creates a fully qualified path to the configuration file no matter where the compiled JavaScript is run from.
     *
     * @param fname - The name of the path relative file.
     * @returns A string that gives a fully qualified path to the configuration file.
     */
    static setConfigurationFilename(fname) {
        let fn = path.join(path.dirname(__filename), "../", fname);
        return fn;
    }
    /**
     * readFileAsArray (fname: string): string[]
     *
     * This function reads the contents of a file and returns them as a string array.
     * Each row in the file is delimited by a return and newline character combination ("\r\n").
     *
     * @param fname - The filename to read from.
     * @returns A string array containing the rows of text from the file.
     */
    static readFileAsArray(fname) {
        try {
            let textlines = fs.readFileSync(fname).toString().split("\r\n");
            return textlines.filter(line => line.trim() !== ''); // Filter out any empty lines
        }
        catch (err) {
            console.error(`Error reading file ${fname}:`, err);
            return [];
        }
    }
    /**
     * readFileAsJSON (fname: string): any
     *
     * This function reads the contents of a file and returns them as a JSON object.
     *
     * @param fname - The filename to read from.
     * @returns A JSON object containing the data from the file.
     */
    static readFileAsJSON(fname) {
        try {
            let data = fs.readFileSync(fname).toString();
            return JSON.parse(data);
        }
        catch (err) {
            console.error(`Error reading file ${fname}:`, err);
            return {};
        }
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=config.js.map