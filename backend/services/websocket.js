import WebSocket, { WebSocketServer } from "ws";
import { removeConnection,  } from "";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, req) => { 
    console.log("New client connected");
    

    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
        
        const data = JSON.parse(message);
        const uuid = data.id;
        const type = data.type;  
        const color = data.color;
        const {x, y} = data.place;


        if (type === "paint") {
            updateState(uuid, {x, y, color});
            broadcast(message);
        } else  {
            ws.send("Unknown message type");
        }

        ws.send(`Server received: ${message}`);
    }); 

    ws.on("close", () => {
        console.log("Client disconnected");
        removeConnection (ws.id);
    }); 

});


/**
 * Broadcast message to all connected clients
 */
function broadcast(msg) {
  const str = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  });
}