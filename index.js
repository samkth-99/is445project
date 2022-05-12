
// Required modules 
const express = require("express");
const app = express();
const dblib = require("./dblib.js");

const multer = require("multer");
const upload = multer();

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Setup EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

// Setup routes
app.get("/", (req, res) => {
    //res.send("Root resource - Up and running!")
    res.render("index");
});

// app.get("/manage", async (req, res) => {
//         // Omitted validation check
//         const totRecs = await dblib.getTotalRecords();
//         res.render("manage", {
//             type: "get",
//             totRecs: totRecs.totRecords
//         });
//     });
    
app.get("/manage", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    //Create an empty customer object (To populate form with values)
    const cus = {
        cusId: "",
        cusFname: "",
        cusLname: "",
        cusState: "",
        cusSalesYTD: "", 
        cusSalesPrev: ""
    };
    console.log("cus is: ", cus);
    res.render("manage", {
        type: "get",
        totRecs: totRecs.totRecords,
        cus: cus
    });
});

app.post("/manage", async (req, res) => {
        // Omitted validation check
        //  Can get this from the page rather than using another DB call.
        //  Add it as a hidden form value.
        const totRecs = await dblib.getTotalRecords();
    
        dblib.findCustomers(req.body)
            .then(result => {
                console.log(result)
                res.render("manage", {
                    type: "post",
                    totRecs: totRecs.totRecords,
                    result: result,
                    cus: req.body
                })
            })
            .catch(err => {
                res.render("manage", {
                    type: "post",
                    totRecs: totRecs.totRecords,
                    result: `Unexpected Error: ${err.message}`,
                    cus: req.body
                });
            });
    });

// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const { render } = require("express/lib/response");
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
//import local file 
app.get("/import", async (req, res) => {
    res.render("import");
 });
 
 app.post("/import",  upload.single('filename'), async (req, res) => {
     if(!req.file || Object.keys(req.file).length === 0) {
         message = "Error: Import file not uploaded";
         return res.send(message);
     };
     //Read file line by line, inserting records
     const buffer = req.file.buffer; 
     const lines = buffer.toString().split(/\r?\n/);


//Capture Error
//declare variable
var numFailed = 0;
var numInserted = 0;
var errorMessage = "";

     for (line of lines) {
          //console.log(line);
          customer = line.split(",");
          //console.log(customer);
          const result = await dblib.insertCustomer(customer);
    console.log("result is: ", result);
    if (result.trans === "success") {
        numInserted++;
    } else {
        numFailed++;
        errorMessage += `${result.msg} \r\n`;
    };
};    
console.log(`Records processed: ${numInserted + numFailed}`);
console.log(`Records successfully inserted: ${numInserted}`);
console.log(`Records with insertion errors: ${numFailed}`);
if(numFailed > 0) {
    console.log("Error Details:");
    console.log(errorMessage);
}; 
 
     //message = `Processing Complete - Processed ${lines.length} records`;
     message = `Total records processed: ${numInserted + numFailed} \n Records inserted successfully: ${numInserted} \n Records not inserted: ${numFailed} \n Errors: \n ${errorMessage} \r\n`;
     res.send(message);
});
 


 //output file 
 app.get("/export", (req, res) => {
    var message = "";
    res.render("export",{ message: message });
   });
   
   
   app.post("/export", (req, res) => {
       const sql = "SELECT * FROM CUSTOMER ORDER BY cusID";
       pool.query(sql, [], (err, result) => {
           var message = "";
           if(err) {
               message = `Error - ${err.message}`;
               res.render("export", { message: message })
           } else {
               var output = "";
               result.rows.forEach(customer => {
                   output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd},${customer.cussalesprev}\r\n`;
               });
               res.header("Content-Type", "text/txt");
               res.attachment("export.txt");
               return res.send(output);
           };
       });
   });

//create customer
// GET Route to form page
app.get('/create', async (req, res) => {
    const message = "get";
    const data = {
        cusId: "",
        cusFname: "",
        cusLname: "",
        cusState: "",
        cusSalesYTD: "", 
        cusSalesPrev: ""

    };
    res.render("create", 
        {
            message: message,
            data: data
        });
});
// POST Route to form page
app.post('/create', upload.array(), async (req, res) => { 
    const message = "post";
// Loop to insert - using async () function and await
// Not using try catch block
// Send form data back to the form
const data = {
    cusId: req.body.cusId,
    cusFname: req.body.cusFname,
    cusLname: req.body.cusLname, 
    cusState: req.body.cusState,
    cusSalesYTD: req.body.cusSalesYTD,
    cusSalesPrev: req.body.cusSalesPrev

}

//use function to insert data
const result = dblib.insertCustomer(data) 
    .then(result => {
        if (result.trans === "fail") {
            console.log("ERROR OCCURED");
            console.log(result.msg);
        } else {
            console.log("Insert Successful");
            console.log(result.msg);
        }
        
    })
    

//delete
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    dblib.findCustomers(id)
      .then(result => {
          render("delete", {
            result: result })
      })
      .catch(err => {
        res.render("delete", {
            result: `Unexpected Error: ${err.message}`,
            
            
        });
});

});


})
