import { LatLon } from "geolocation-utils";
import { board, boardHolder, building, coords } from "../types/types";
import { validCoords } from "./geoService";

const boardHolder : boardHolder = new Map(); 

export const findBoard = (building : building) : board => {
    const board = boardHolder.get(building); 
    if (board === undefined){
        throw new Error("[Board] Board not found in boardHolder"); 
    }
    return board; 
};

export const setBuilding = (building: string , board: board) => {
    boardHolder.set(building, board); 
};

// If a valid building exists return it otherwise return no building 
export const buildingForCoords = (coords: LatLon) : building | undefined => {
    for (const [key, value] of boardHolder.entries()){
        console.log(`coords should be latlon: ${JSON.stringify(coords)}`); 
        console.log(value.coords); 
        if (validCoords(coords, value.coords)){
            return key; 
        }
    }
};

export const updatePixel = (building : string, xCoord : number, yCoord : number, color : number) => {
    const board = findBoard(building).board; 
    
    console.log(color);
    board[xCoord][yCoord] = color; 
    console.log(board[xCoord])
}