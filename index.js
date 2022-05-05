
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


    app.get("/manage", async (req, res) => {
        // Omitted validation check
        const totRecs = await dblib.getTotalRecords();
        res.render("manage", {
            type: "get",
            totRecs: totRecs.totRecords
        });
    });
    
    app.post("/manage", async (req, res) => {
        // Omitted validation check
        //  Can get this from the page rather than using another DB call.
        //  Add it as a hidden form value.
        const totRecs = await dblib.getTotalRecords();
    
        dblib.findCustomers(req.body)
            .then(result => {
                res.render("manage", {
                    type: "post",
                    totRecs: totRecs.totRecords,
                    result: result,
                    prod: req.body
                })
            })
            .catch(err => {
                res.render("manage", {
                    type: "post",
                    totRecs: totRecs.totRecords,
                    result: `Unexpected Error: ${err.message}`,
                    prod: req.body
                });
            });
    });

    app.get("/manage", async (req, res) => {
        // Omitted validation check
        const totRecs = await dblib.getTotalRecords();
        //Create an empty customer object (To populate form with values)
        const prod = {
            cusID: "",
            cusFname: "",
            cusLname: "",
            cusState: "",
            cusSalesYTD: "", 
            cusSalesPrev: ""

        };
        res.render("manage", {
            type: "get",
            totRecs: totRecs.totRecords,
            prod: prod
        });
    });

    