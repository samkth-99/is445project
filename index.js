// Add packages
const dblib = require("./dblib.js");

dblib.getTotalRecords()
    .then(result => {
        if (result.msg.substring(0, 5) === "Error") {
            console.log(`Error Encountered.  ${result.msg}`);
        } else {
            console.log(`Total number of database records: ${result.totRecords}`);
        };
    })
    .catch(err => {
        console.log(`Error: ${err.message}`);
    });

    const customera = [101, 'Alfred', 'Alexander', 'NV', 1500, 900];
dblib.insertCustomer(customera)
    .then(result => {
        if (result.trans === "fail") {
            console.log("ERROR OCCURED");
            console.log(result.msg);
        } else {
            console.log("Insert Successful");
            console.log(result.msg);
        }
    });

    