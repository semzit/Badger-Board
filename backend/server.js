require('dotenv').config();
const express = require('express');

const app = express();

const port = process.env.SERVER_PORT;


const authRoutes = require("./services/authService.js");

app.use(express.json());

app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});

