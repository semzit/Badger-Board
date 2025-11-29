import { board, boardHolder, building } from "../types/types";

const boardHolder : boardHolder = new Map(); 

export const getBoard = (building : building) : board => {
    const board = boardHolder.get(building); 
    if (board === undefined){
        throw new Error("[Board] Board not found in boardHolder"); 
    }
    return board; 
}

export const setBuilding = (building: string , board: board) => {
    boardHolder.set(building, board); 
}

