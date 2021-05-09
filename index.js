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

app.get("/searchajax", async (req, res) => {
    // Omitted validation check
    const totRecs = await dblib.getTotalRecords();
    res.render("searchajax", {
        totRecs: totRecs.totRecords,
    });
});
app.post("/searchajax", upload.array(), async (req, res) => {
    dblib.findCustomers(req.body)
        .then(result => {
            // console.log("search ajax result:", result);
            res.send(result)
        })
        .catch(err => res.send({trans: "Error", result: err.message}));

});

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Get /edit
app.get("/edit/:cusid", (req, res) => {
    const id = req.params.cusid;
    const sql = "SELECT * FROM customer WHERE cusId = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("edit", { customer: result.rows[0] });
    });
  });

// POST /edit
app.post("/edit/:id", (req, res) => {
    console.log("tyring to POST edit");
    const id = req.params.id;
    
    const cus = [req.body.ID, req.body.cusFname, req.body.cusLname, req.body.cusState, req.body.cusSalesYTD, req.body.cusSalesPrev];    
    const sql = "UPDATE customer SET cusFname = $2, cusLname = $3, cusState = $4, cusSalesYTD = $5, cusSalesPrev = $6 WHERE (cusId = $1)";
    console.log(cus);
    console.log(sql);
    pool.query(sql, cus, (err, result) => {
      // if (err) ...
      res.redirect("/searchajax");
    });
  });

// GET /create
app.get("/create", (req, res) => {
    res.render("create", { customer: {} });
  });

// POST /create
app.post("/create", upload.array(), async (req, res) => {
    dblib.createCustomer(req.body)
        .then(result => {
            res.send(result);
        })
        .catch(err => res.send({trans: "Error", result: err.message}));
});

// GET /delete
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM customer WHERE cusId = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("delete", { customer: result.rows[0] });
    });
  });

// POST /delete/
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM customer WHERE cusId = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.redirect("/searchajax");
    });
  });

//Get/input
app.get("/input", async (req, res) => {
    const totRecs = await dblib.getTotalRecords();
    res.render("input", {
        totRecs: totRecs.totRecords,
    });
 });

//Post/input
app.post("/input",  upload.single('filename'), (req, res) => {
  if(!req.file || Object.keys(req.file).length === 0) {
      message = "Error: Import file not uploaded";
      return res.send(message);
  };
  //Read file line by line, inserting records
  const buffer = req.file.buffer; 
  const lines = buffer.toString().split(/\r?\n/);

  lines.forEach(line => {
       //console.log(line);
       customer = line.split(",");
       //console.log(product);
       const sql = "INSERT INTO customer(cusId, cusFname, cusLname, cusState, cusSalesYTD, cusSalesPrev) VALUES ($1, $2, $3, $4, $5, $6)";
       pool.query(sql, customer, (err, result) => {
           if (err) {
               console.log(`Insert Error.  Error message: ${err.message}`);
           } else {
               console.log(`Inserted successfully`);
           }
      });
  });
  message = `Processing Complete - Processed ${lines.length} records`;
  res.send(message);
}); 


//Get/output
app.get("/output", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  var message = "";
  res.render("output",{
    totRecs: totRecs.totRecords,
    message: message });
 });


//Post/output
app.post("/output", (req, res) => {
  const sql = "SELECT * FROM customer ORDER BY cusId";
  pool.query(sql, [], (err, result) => {
      var message = "";
      if(err) {
          message = `Error - ${err.message}`;
          res.render("output", { message: message })
      } else {
          var output = "";
          result.rows.forEach(customer => {
              output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd},${customer.cussalesprev}\r\n`;
          });
          res.header("Content-Type", "text/csv");
          res.attachment("export.txt");
          return res.send(output);
      };
  });
}); 