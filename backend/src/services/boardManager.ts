import { LatLon } from "geolocation-utils";
import { Board, boardHolder, Building, coords } from "../types/types";
import { validCoords } from "./geoService";

const boardHolder : boardHolder = new Map(); 

/** 
* @returns all boards
*/ 
export const boards = () : Board[] => {
    return Array.from(boardHolder.values()); 
}

/**
 * @param building 
 * @returns board for building
 */
export const findBoard = (building : Building) : Board => {
    const board = boardHolder.get(building); 
    if (board === undefined){
        throw new Error("[Board] Board not found in boardHolder"); 
    }
    return board; 
};

/**
 * Removes building's board
 * @param building 
 */
export const removeBoard = (building : Building) : void => {
    boardHolder.delete(building)
}

/**
 * Add a building board pair
 * @param building 
 * @param board 
 */
export const setBuilding = (building: string , board: Board) => {
    boardHolder.set(building, board); 
};

/**
 * If a valid building exists return it otherwise return no building 
 * @param coords 
 * @returns 
 */
export const buildingForCoords = (coords: LatLon) : Building | undefined => {
    for (const [key, value] of boardHolder.entries()){
        console.log(`coords should be latlon: ${JSON.stringify(coords)}`); 
        console.log(value.coords); 
        if (validCoords(coords, value.coords)){
            return key; 
        }
    }
};

/**
 * Update pixel on a building's board
 * @param building 
 * @param xCoord 
 * @param yCoord 
 * @param color 
 */
export const updatePixel = (building : string, xCoord : number, yCoord : number, color : number) => {
    const drawing = findBoard(building).drawing; 
    drawing[xCoord][yCoord] = color; 
}; 

/**
 * Increase updates counter by 1 for a building's board 
 * @param building 
 */
export const incrementUpdates = (building : string) => {
    const {drawing, coords, updates} = findBoard(building); 
    boardHolder.set(building, {
        location : building, 
        drawing : drawing,
        coords : coords, 
        updates : updates + 1
    }); 
}; 
