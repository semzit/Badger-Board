const WebSocket = require('ws');

// 1. Setup the WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

// Track which building each connected socket belongs to
// Map<WebSocket, String (BuildingID)>
const socketToBuilding = new Map();

// --- MOCK DATABASE LOGIC (Abstracted as requested) ---
const db = {
    // Looks up which building a user belongs to
    getBuildingForUser: async (userId) => {
        // In reality: await pool.query('SELECT building_id FROM users WHERE id = $1', [userId])
        // Mocking return value:
        return "building_1"; 
    },
    // Updates the grid in the DB
    updateGridBlock: async (buildingId, x, y, value) => {
        // In reality: await pool.query('UPDATE grids SET ...')
        console.log(`[DB] Updated Grid for ${buildingId}: [${x}, ${y}] = ${value}`);
        return true;
    }
};
// ----------------------------------------------------

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

    // A. Server looks up building using identifier
    const buildingId = await db.getBuildingForUser(userId);
    
    // Associate this connection with the building (useful for broadcasting later)
    socketToBuilding.set(ws, buildingId);

    // B. Server updates that block in server-side grid
    await db.updateGridBlock(buildingId, x, y, value);

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

console.log("WebSocket server started on port 8080");