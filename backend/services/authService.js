require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { pool } = require("../db.js");
const { getState } = require("./database.js");
const authRouter = express.Router();

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
authRouter.post("/", (req, res) => {
    const coords = req.body.coords;
    const query = `
    SELECT 
        b.name, 
        ST_DumpValues(c.content_data, 1) as red_channel,
        ST_DumpValues(c.content_data, 2) as green_channel,
        ST_DumpValues(c.content_data, 3) as blue_channel
    FROM 
        buildings b
    JOIN 
        building_content c ON b.id = c.building_id
    WHERE 
        ST_Intersects(
            b.boundary, 
            ST_Point($1, $2)::geography
        );
    `;
    
    let query_res;

    // Executes query

    pool.query(query, ...coords, (err, qres) => {
        if (err) {
            res.status(500).json({
                message: "Query failed"
            });
        } else {
            const obj = qres.rows;

            console.log(obj);
        }
    });

    // Check if query returned nothing, if so send an error response

    if (!query_res) {
        res.status(401).json({
            success: false,
            status: 401,
            message: "Invalid Location"
        });
    }

    // Else, generate uuid auth token

    const id = crypto.randomUUID();
    
    // Write building and id pair to database

    // Establish Web Socket connection with client

    // Return response containing initial state, building name, and auth token

    res.send({
        id: id,
        building: building,
        state: state
    });
});

module.exports = authRouter;