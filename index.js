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

function moneyToNumber(money) {
  if (money == undefined) {
    return;
  }
  let value = money.replace(',', '');
  value = value.replace(/[^0-9,.]*/, '');
  value = parseFloat(value);
  return value;
};

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

// Get /edit
app.get("/edit/:cusid", async (req, res) => {
  const foundCustomer = await dblib.findCustomers(req.params);
  if (foundCustomer.result[0] !== undefined) {
    if (foundCustomer.result[0].cussalesytd !== undefined) {
      foundCustomer.result[0].cussalesytd = moneyToNumber(foundCustomer.result[0].cussalesytd);
    }
    if (foundCustomer.result[0].cussalesprev !== undefined) {
      foundCustomer.result[0].cussalesprev = moneyToNumber(foundCustomer.result[0].cussalesprev);
    }
  }
  res.render("edit", {
    customer: foundCustomer.result[0]
  });
});

// POST /edit
app.post("/edit", upload.array(), async (req, res) => {
  dblib.editCustomer(req.body)
    .then(result => {
      res.send(result);
    })
    .catch(err => res.send({trans: "Error", result: err.message}));
});

// GET /delete
app.get("/delete/:cusid", async (req, res) => {
  const foundCustomer = await dblib.findCustomers(req.params);
  if (foundCustomer.result[0] !== undefined) {
    if (foundCustomer.result[0].cussalesytd !== undefined) {
      foundCustomer.result[0].cussalesytd = moneyToNumber(foundCustomer.result[0].cussalesytd);
    }
    if (foundCustomer.result[0].cussalesprev !== undefined) {
      foundCustomer.result[0].cussalesprev = moneyToNumber(foundCustomer.result[0].cussalesprev);
    }
  }
  res.render("delete", {
    customer: foundCustomer.result[0]
  });
});

// POST /delete/
app.post("/delete", upload.array(), async (req, res) => {
  console.log(req.body);
  dblib.deleteCustomer(req.body)
  .then(result => {
    res.send(result);
  })
  .catch(err => res.send({trans: "Error", result: err.message}));
});

//Get/input
app.get("/input", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  res.render("input", {
      totRecs: totRecs.totRecords,
  });
});

//Post/input
app.post("/input", upload.single('filename'), async (req, res) => {
  if(!req.file || Object.keys(req.file).length === 0) {
      message = "Error: Import file not uploaded";
      return res.send(message);
  };
  //Read file line by line, inserting records
  const buffer = req.file.buffer; 
  const lines = buffer.toString().split(/\r?\n/);
  let message = {
    processed: 0,
    inserted: 0,
    notInserted: 0,
    msg: []
  };

  for (let i = 0; i < lines.length; i++) {
    line = lines[i];
    if (line === '') {
      continue;
    }
    customer = line.split(",");
    const insertResult = await dblib.insertCustomer(customer);
    console.log(insertResult);
    if (insertResult.trans === 'success') {
      message.processed ++;
      message.inserted ++;
    }
    if (insertResult.trans === 'fail') {
      message.processed ++;
      message.notInserted ++;      
      if (insertResult.msg !== undefined && insertResult.msg !== '') {
        message.msg.push(`${insertResult.msg}`); //??
      }
    }
  }
  // console.log(message);
  // console.log("the type of message :", typeof(message));
  res.send(message);
  // res.send(message.msg.map(word => {
  //   return (word + "\n\r");
  // }))
  
  
  
  
  
  
  
  
  // for (let i = 0; i < words.length; i++) {
  //   const wordssss = words[i];
  //   res.send(wordssss);
  // };
  // res.send(words.map(word => {
  //   return word;
  // }));
  // console.log(mm);

  // lines.forEach(async line => {
  //   //console.log(line);
  //   if (line === '') {
  //     return;
  //   }
  //   customer = line.split(",");
  //   // console.log(`index customer:`, customer);
  //   const msg = await dblib.insertCustomer(customer);
  //     // .then(result => {
  //     //   message += result.msg + '\n';
  //     //   mm.push(result.msg);
  //     //   console.log(mm.length);
  //     //   res.send(result.msg);
  //     //   // console.log(message);
  //     // })
  //   // console.log(msg);
  //   mm.push(msg);
  // });
  // console.log(mm);

  // setTimeout( function() {console.log(mm);}, 3000);
  
  // console.log(`Final`);
  // console.log(mm);

  // res.send(message);)
  // message = `Processing Complete - Processed ${lines.length} records`;
  // res.send(message);
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
  const sql = "SELECT * FROM customer ORDER BY cusid";
  pool.query(sql, [], (err, result) => {
    var message = "";
    if(err) {
      message = `Error - ${err.message}`;
      res.render("output", { message: message })
    } else {
      var output = "";
      result.rows.forEach(customer => {
          output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${moneyToNumber(customer.cussalesytd)},${moneyToNumber(customer.cussalesprev)}\r\n`;
      });
      const fileName = req.body.fileName ? req.body.fileName : "export.txt";
      res.header("Content-Type", "text/csv");
      res.attachment(fileName);
      return res.send(output);
    };
  });
}); 