require('dotenv').config();
const{ getState, loadState } =  require("./services/database.js")
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { updateRedis } = require('./services/redisService.js');

const { pool } = require('./db.js');

const app = express();

const port = process.env.SERVER_PORT;

const {authRoutes, usersForBuilding} = require("./services/authService.js");

app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.use('/auth', authRoutes);

setInterval(() => {
    loadState()
}, 1000);

// Websocket Logic

const socketToBuilding = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (messageStr) => {
        try {
            const message = JSON.parse(messageStr);

            // 1: PAINT Logic
            if (message.type === 'PAINT') {
                await handlePaintRequest(ws, message);
            }

        } catch (e) {
            console.error("Error processing message:", e);
        }
    });

    ws.on('close', () => {
        // Clean up map when user leaves
        socketToBuilding.delete(ws);
    });
});

async function handlePaintRequest(ws, data) {
    const { x, y, value, userId } = data;

    let buildingId;
    // A. Server looks up building using identifier
    for (const [building, list] in Object.entries(usersForBuilding)) {
        if (list.includes(userId)) {
            buildingId = building;
        }
    }
    
    // Associate this connection with the building (useful for broadcasting later)
    socketToBuilding.set(ws, buildingId);

    // B. Server updates that block in server-side grid  // redis
    const update = {x, y, color: value};
    await updateRedis(buildingId, update);  

    // C. UPDATE Logic: Broadcast to all clients in the SAME building
    broadcastUpdate(buildingId, x, y, value);
}

function broadcastUpdate(targetBuildingId, x, y, value) {
    const updateMsg = JSON.stringify({
        type: 'UPDATE',
        x: x,
        y: y,
        value: value
    });

    wss.clients.forEach((client) => {
        // Only send if client is open AND in the same building
        const clientBuilding = socketToBuilding.get(client);

        if (client.readyState === WebSocket.OPEN && clientBuilding === targetBuildingId) {
            client.send(updateMsg);
        }
    });
}

server.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});

