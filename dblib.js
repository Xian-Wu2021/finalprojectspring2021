// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customer";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

const insertCustomer = (customer) => {
    // Will accept either a product array or product object
    if (customer instanceof Array) {
        params = customer;
    } else {
        params = Object.values(customer);
    };
    console.log(params);
// ?? dynamic sql ?
    const sql = `INSERT INTO customer (cusid, cusfname, cuslname, cusstate, cussalesytd, cussalesprev)
                 VALUES ($1, $2, $3, $4, $5, $6)`;

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                msg: `Customer id ${params[0]} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "fail", 
                msg: `Customer ID: ${params[0]} - Error: ${err.message}`
                // Error on insert of customer id ${params[0]}.  ${err.message}`
            };
        });
};

const createCustomer = (customer) => {
    console.log(customer);
    sql = "INSERT INTO customer (";
    let i = 1;
    params = [];

    // Check data provided and build query as necessary
    if (customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += `cusid`;
        i++;
    };
    if (customer.cusfname !== "") {
        params.push(`${customer.cusfname}`);
        sql += `, cusfname`;
        i++;
    };
    if (customer.cuslname !== "") {
        params.push(`${customer.cuslname}`);
        sql += `, cuslname`;
        i++;
    };
    if (customer.cusstate !== "") {
        params.push(`${customer.cusstate}`);
        sql += `, cusstate`;
        i++;
    };   
    if (customer.cussalesytd !== "") {
        params.push(parseFloat(customer.cussalesytd));
        sql += `, cussalesytd`;
        i++;
    };
    if (customer.cussalesprev !== "") {
        params.push(parseFloat(customer.cussalesprev));
        sql += `, cussalesprev`;
        i++;
    };

    sql += `) VALUES ($1`;
    for (let j = 2; j < i; ++j) {
        sql += `, $${j}`;
    }
    sql += `)`;

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

const findCustomers = (customer) => {
    let i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build query as necessary
    if (customer.cusid !== undefined && customer.cusid !== "") {
        params.push(parseInt(customer.cusid));
        sql += ` AND cusid = $${i}`;
        i++;
    };
    if (customer.cusfname !== undefined && customer.cusfname !== "") {
        params.push(`${customer.cusfname}`);
        sql += ` AND UPPER(cusfname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cuslname !== undefined && customer.cuslname !== "" ){
        params.push(`${customer.cuslname}`);
        sql += ` AND UPPER(cuslname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusstate !== undefined && customer.cusstate !== ""){
        params.push(`${customer.cusstate}`);
        sql += ` AND UPPER(cusstate) = UPPER($${i})`;
        i++;
    };   
    if (customer.cussalesytd !== undefined && customer.cussalesytd !== ""){
        params.push(parseFloat(customer.cussalesytd));
        sql += ` AND cussalesytd >= $${i}`;
        i++;
    };
    if (customer.cussalesprev !== undefined && customer.cussalesprev !== ""){
        params.push(parseFloat(customer.cussalesprev));
        sql += ` AND cussalesprev >= $${i}`;
        i++;
    };

    sql += ` ORDER BY cusid`;

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

const editCustomer = (customer) => {
    let i = 1;
    params = [];
    sql = "UPDATE customer SET";
    // cusfname = $2, cuslname = $3, cusstate = $4, cussalesytd = $5, cussalesprev = $6 WHERE (cusid = $1)";
    if (customer.cusfname !== undefined && customer.cusfname !== "") {
        params.push(`${customer.cusfname}`);
        sql += ` cusfname = $${i},`;
        i++;
    };
    if (customer.cuslname !== undefined && customer.cuslname !== "" ){
        params.push(`${customer.cuslname}`);
        sql += ` cuslname = $${i},`;
        i++;
    };
    if (customer.cusstate !== undefined && customer.cusstate !== ""){
        params.push(`${customer.cusstate}`);
        sql += ` cusstate = $${i},`;
        i++;
    };   
    if (customer.cussalesytd !== undefined && customer.cussalesytd !== ""){
        params.push(parseFloat(customer.cussalesytd));
        sql += ` cussalesytd = $${i},`;
        i++;
    };
    if (customer.cussalesprev !== undefined && customer.cussalesprev !== ""){
        params.push(parseFloat(customer.cussalesprev));
        sql += ` cussalesprev = $${i},`;
        i++;
    };
    sql = sql.substr(0, sql.length - 1) + ` WHERE (cusid = ${customer.cusid})`;
 
    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

const deleteCustomer = (customer) => {
    params = [parseInt(customer.cusid)];
    sql = "DELETE FROM customer WHERE cusid = $1";

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

module.exports.getTotalRecords = getTotalRecords;
module.exports.insertCustomer = insertCustomer;
module.exports.findCustomers = findCustomers;
module.exports.createCustomer = createCustomer;
module.exports.deleteCustomer = deleteCustomer;
module.exports.editCustomer = editCustomer;