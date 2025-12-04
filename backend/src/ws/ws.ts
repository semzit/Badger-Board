import { WebSocketServer, WebSocket } from "ws";
import { wsWrite, update } from "../types/types";
import { findBoard, updatePixel, incrementUpdates, resetUpdates } from "../services/boardManager";
import { findBuilding } from "../services/idManager";
import { setClient } from "../services/clientManager";
import {  updateDb } from "../services/dbService";

const WSPORT = Number(process.env.WSPORT) || 8081

const wss = new WebSocketServer({ port : WSPORT});

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

                const update : update = {
                    x : x, 
                    y : y, 
                    color : color
                }; 
 
                const building = findBuilding(userId);
                if  (building){
                    updatePixel(building, x, y, color); 
                    const board = findBoard(building)
                    incrementUpdates(building); 
                    if (board.updates > 20){  // update the board data in the database after 20 updates to board
                        updateDb(building, board); 
                        resetUpdates(building); 
                    }
                    setClient(userId , ws); 
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify(update));
                        }
                    });
                }else{
                    console.log("[WS] Id rejected"); 
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
