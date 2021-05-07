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

app.get("/search", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    res.render("search", {
        type: "get",
        totRecs: totRecs.totRecords
    });
});

app.post("/search", async (req, res) => {
    // Omitted validation check
    //  Can get this from the page rather than using another DB call.
    //  Add it as a hidden form value.
    const totRecs = await dblib.getTotalRecords();
    console.log("req,body is", req.body);

    dblib.findCustomers(req.body)
        .then(result => {
            console.log("result is", result);
            res.render("search", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: result,
                prod: req.body
            })
        })
        .catch(err => {
            res.render("search", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: `Unexpected Error: ${err.message}`,
                prod: req.body
            });
        });
});

app.get("/searchajax", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    res.render("searchajax", {
        totRecs: totRecs.totRecords,
    });
});
app.post("/searchajax", upload.array(), async (req, res) => {
    dblib.findCustomers(req.body)
        .then(result => res.send(result))
        .catch(err => res.send({trans: "Error", result: err.message}));

});