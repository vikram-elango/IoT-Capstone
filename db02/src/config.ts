import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration class to handle configuration-related functionalities.
 */
export class Configuration {
    /**
     * setConfigurationFilename (fname: string): string
     * 
     * This function creates a fully qualified path to the configuration file no matter where the compiled JavaScript is run from.
     * 
     * @param fname - The name of the path relative file.
     * @returns A string that gives a fully qualified path to the configuration file.
     */
    public static setConfigurationFilename(fname: string): string {
        let fn: string = path.join(path.dirname(__filename), "../", fname);
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
    public static readFileAsArray(fname: string): string[] {
        try {
            let textlines: string[] = fs.readFileSync(fname).toString().split("\r\n");
            return textlines.filter(line => line.trim() !== ''); // Filter out any empty lines
        } catch (err) {
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
    public static readFileAsJSON(fname: string): any {
        try {
            let data: string = fs.readFileSync(fname).toString();
            return JSON.parse(data);
        } catch (err) {
            console.error(`Error reading file ${fname}:`, err);
            return {};
        }
    }
}
