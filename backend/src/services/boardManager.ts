import { LatLon } from "geolocation-utils";
import { Board, boardHolder, Building, coords } from "../types/types";
import { validCoords } from "./geoService";

const boardHolder : boardHolder = new Map(); 

export const boards = () : Board[] => {
    return Array.from(boardHolder.values()); 
}

export const findBoard = (building : Building) : Board => {
    const board = boardHolder.get(building); 
    if (board === undefined){
        throw new Error("[Board] Board not found in boardHolder"); 
    }
    return board; 
};

export const removeBoard = (building : Building) : void => {
    boardHolder.delete(building)
}

export const setBuilding = (building: string , board: Board) => {
    boardHolder.set(building, board); 
};

// If a valid building exists return it otherwise return no building 
export const buildingForCoords = (coords: LatLon) : Building | undefined => {
    for (const [key, value] of boardHolder.entries()){
        console.log(`coords should be latlon: ${JSON.stringify(coords)}`); 
        console.log(value.coords); 
        if (validCoords(coords, value.coords)){
            return key; 
        }
    }
};

export const updatePixel = (building : string, xCoord : number, yCoord : number, color : number) => {
    const drawing = findBoard(building).drawing; 
    drawing[xCoord][yCoord] = color; 
}; 

export const incrementUpdates = (building : string) => {
    const {drawing, coords, updates} = findBoard(building); 
    boardHolder.set(building, {
        location : building, 
        drawing : drawing,
        coords : coords, 
        updates : updates + 1
    }); 
}; 

export const resetUpdates = (building : string) => {
    const {drawing, coords } = findBoard(building); 
    boardHolder.set(building, {
        location : building, 
        drawing : drawing,
        coords : coords, 
        updates : 0
    }); 
}