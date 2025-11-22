require('dotenv').config
const express = require('express');
const { getClient } = require("./db.js");

const app = express();

const port = process.env.SERVER_PORT;

app.get("/", (req, res) => {
    const doQuery = async () => {        
        getClient();

    };

    doQuery();

    res.json({
        msg: "query executed"
    });
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});