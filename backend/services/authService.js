require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { pool } = require("../db.js");
const { getState } = require("./database.js");
const authRoutes = express.Router();

const app = express();
app.use(express.json());

const usersForBuilding = {};

/**
 * authenticate the user based on gps coordinates
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
authRoutes.post("/", (req, res) => {
    const coords = req.body.coords;
    const query = `
    SELECT 
        b.id,
        b.name, 
        c.content_data
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

        usersForBuilding[query_res.id] = id;

        res.send({
            id: id,
            building: query_res.name,
            state: query_res.content_data
        });
    }
    });
});

module.exports = {
    authRoutes,
    usersForBuilding
};