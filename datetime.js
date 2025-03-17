//Steven MaDE THIS


function main() {

    let startTime = new Date();

    for (let i = 1; i <= 1000; i++) {
        // Instantiate a new date object
        let d = new Date();
        
        // Output the corresponding date string
        console.log(`Iteration ${i}: ${d}`);
        console.log("Millies", d.getMilliseconds());
    }

// Instantiate a date object just before the end
let endTime = new Date();
    
// Determine the elapsed time in milliseconds
let elapsedTimeMillis = endTime.getTime() - startTime.getTime();

// Convert elapsed time to seconds
let elapsedTimeSeconds = elapsedTimeMillis / 1000;
    
// Output the elapsed time in milliseconds and seconds
console.log(`Elapsed time: ${elapsedTimeMillis} milliseconds`);
console.log(`Elapsed time: ${elapsedTimeSeconds} seconds`);
console.log(`Swag: ${endTime} gucci`);

let MyBirthday = new Date(1994,1,9);

//Displays my birthday
console.log( {MyBirthday} );

//Now is date now
let Now = new Date ();

// Calculate the time difference in milliseconds
let timeDifferenceMillis = Now.getTime() - MyBirthday.getTime();
    
 
// Convert the time difference to days
 let timeDifferenceDays = timeDifferenceMillis / (1000 * 60 * 60 * 24);

 // Output the time difference in days
 console.log(`Time difference between today and my birth date: ${timeDifferenceDays} days`);
}



// Example usage:
main();

