


//Type Script Version
/**
 * Function times_table
 * This function outputs the multiplication table for a given number.
 * If no number is provided, it defaults to the 1 times table.
 * 
 * @param {number} [num=1] - The number for which the times table is to be generated.
 * @returns {void} - Outputs the times table to the console.
 */
function times_table(num: number = 1): void {
    for (let i = 1; i <= 10; i++) {
        console.log(`${i} x ${num} = ${i * num}`);
    }
}

/**
 * Function main
 * This function calls the times_table function 12 times, once for each times table from 1 to 12.
 * 
 * @returns {void} - Outputs the times tables from 1 to 12 to the console.
 */
function main(): void {
    for (let i = 1; i <= 12; i++) {
        console.log(`Times Table for ${i}:`);
        times_table(i);
        console.log(''); // Add a blank line for better readability
    }
}

// Example usage:
main();
