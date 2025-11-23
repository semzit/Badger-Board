require('dotenv').config();
const express = require('express');
// const { pool } = require("./db.js");
const { Pool } = require('pg');

const app = express();

const port = process.env.SERVER_PORT;

const { pool } = require("./db.js")

const authRoutes = require("./services/authService.js");

app.use(express.json());

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

app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});