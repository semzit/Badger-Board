require('dotenv').config
const express = require('express');
// const { pool } = require("./db.js");
const { Pool } = require('pg');

const app = express();

const port = process.env.SERVER_PORT;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

app.get("/", (req, res) => {
    const doQuery = async () => {        
        pool.query("SELECT * FROM buildings", (err, res) => {
            if (err) {
                console.log("Query failed");
            } else {
                console.log(res.rows);
            }
        });
    };

    doQuery();

    res.json({
        msg: "query executed"
    });
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});