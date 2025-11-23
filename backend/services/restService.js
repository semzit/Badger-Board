require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { sql } = require("./db.js");
const { getState } = require("./database.js");


const app = express();
app.use(express.json());

const port = process.env.SERVER_PORT;


/**
 * authentica the user based on gps coordinates
 * req.body = {
 *   coords: {
 *     latitude: number,
 *     longitude: number
 *   }
 * }
 * res.body = {
 *   id: string, 
 *   building: string
 *   state: string
 */ 
app.post("/auth/location", (req, res) => {
    
    const coords = req.body.coords;
    const { state, building } = getState(coords);
    
    const id = crypto.randomUUID();
    // write building and id pair to database

    res.send({
        id: id,
        building: building,
        state: state
    });
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});