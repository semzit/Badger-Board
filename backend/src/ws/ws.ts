import { WebSocketServer, WebSocket } from "ws";
import { wsWrite, update } from "../types/types";
import { updatePixel } from "../services/boardManager";
import { findBuilding, readIDHOLDER, setId } from "../services/idManager";
import { getBuilding, setClient } from "../services/clientManager";

const wss = new WebSocketServer({ port : 8081});

export const start = () : void => {
    try{
        console.log('[WS] Websocket started'); 
        wss.on('connection', (ws) => {
            ws.on('error', console.error);
            ws.on('message', (msg) => {
                console.log('[WS] Websocket message received'); 
                const msgAsString = msg.toString('utf-8');
                const msgObject = JSON.parse(msgAsString) as wsWrite; 

                const {userId, x, y, color} = msgObject; 

                console.log(color); 
                const update : update = {
                    x : x, 
                    y : y, 
                    color : color
                }; 
 
                const building = findBuilding(userId);

                if  (building){
                    updatePixel(building, x, y, color); 
                    setClient(userId , ws); 
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify(update));
                        }
                    });
                }else{
                    console.log("[WS] Id rejected"); 
                    console.log(readIDHOLDER()); 
                }
                
            });
        });

        wss.on('close', () => console.log('Connection closed'));
    }catch (error){
        console.error(error); 
        process.exit(1);
    }
}; 


wss.on('close', () => console.log('Connection closed')) ;
