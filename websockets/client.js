// Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:8080');

// Generate a random ID for this session (simulating a logged-in user)
const myUserId = "user_" + Math.floor(Math.random() * 1000);

// --- 1. SENDING DATA (PAINT) ---

// Call this function when the user clicks a grid cell
function sendPaint(x, y, colorValue) {
    if (ws.readyState === WebSocket.OPEN) {
        const payload = {
            type: 'PAINT',
            userId: myUserId,
            x: x,
            y: y,
            value: colorValue
        };
        
        ws.send(JSON.stringify(payload));
        console.log(`Sent Paint: ${x}, ${y} -> ${colorValue}`);
    } else {
        console.error("Connection not open");
    }
}

// --- 2. RECEIVING DATA (UPDATE) ---

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.type === 'UPDATE') {
            handleUpdateMessage(data);
        }
    } catch (e) {
        console.error("Failed to parse incoming message", e);
    }
};

function handleUpdateMessage(data) {
    const { x, y, value } = data;

    // Logic to update your frontend UI
    console.log(`Received Update from Server: Cell [${x}, ${y}] is now ${value}`);
    
    // Example: Update HTML canvas or DOM element
    // updateLocalGridVisuals(x, y, value); 
}

// --- Connection Events ---

ws.onopen = () => {
    console.log("Connected to Paint Server");
};

ws.onclose = () => {
    console.log("Disconnected from Paint Server");
};