require('dotenv').config();
const { Client } = require('pg');

async function connectToSupabase() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await client.connect();

  const res = await client.query('SELECT * FROM buildings');
  console.log(res.rows);
}

module.exports = {
    getClient: connectToSupabase
};