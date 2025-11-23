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

    pool.query(query, coords, (err, qres) => {
        if (err) {
            res.status(500).json({
                message: "Query failed"
            });
        } else {
            const obj = qres.rows;

            query_res = obj[0];

            if (!query_res) {
                res.status(401).json({
                    success: false,
                    status: 401,
                    message: "Invalid Location"
                });
            }

        const id = crypto.randomUUID();
    
        const state = new Array(100);

        for (let i = 0; i < 100; i++) {
            state[i] = new Array(100);
        }

        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                state[i][j] = [query_res.red_channel[i][j], query_res.green_channel[i][j], query_res.blue_channel[i][j]];
            }
        }

        res.send({
            id: id,
            building: query_res.name,
            state: state
        });
    }
    });
});

module.exports = authRouter;