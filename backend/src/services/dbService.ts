import { board, initData } from "../types/types";
import sqlite3  from "sqlite3";
import { Database, open } from "sqlite";
import { error } from "console";
import { toLatLon, LatLon } from "geolocation-utils";

let db : Database; 

export const buildDb =  async() => {
  db = await open({
    filename : `./bruh.db`,
    driver : sqlite3.Database,
  }); 

  const creatDBschema : string = `
  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building TEXT, 
    board TEXT,
    coords TEXT  
  );
  `; 

  await db.exec(creatDBschema);  
}; 
 
export const loadBoard = async(building : string, board : number[][], coords: number[][]) => {
  const boardString = JSON.stringify(board); 
  const coordString = JSON.stringify(coords); 

  const update : string =  `
    INSERT OR REPLACE INTO boards (building, board, coords) VALUES 
      (?, ?, ?)
  `;

  await db.run(update, [building, boardString, coordString]); 
}

export const updateDb = async(building : string, board : number[][]) => {
  const boardString = JSON.stringify(board); 

  const update =  `UPDATE boards SET board = ? WHERE building = ?`;

  await db.run(update, [boardString, building]); 
}; 

export const readDb = async(building: string) : Promise<board> => {
  const getBoardSQL = `SELECT board FROM boards WHERE building = ?`;
  const getCoordSQL = `SELECT coords FROM boards WHERE building = ?`;

  const boardSerialized =  await db.get(getBoardSQL, [building]); // should probably made into one statment 
  const coordsSerialized = await db.get(getCoordSQL, [building]); 
  
  if (boardSerialized && coordsSerialized){
    const boardDeserialized : number[][] = JSON.parse(boardSerialized.board);
    const coordsDeserialized : number[][] = JSON.parse(coordsSerialized.coords); 

    let latlons: LatLon[] = []; 

    for (let i = 0 ; i < coordsDeserialized.length ; i++){
      latlons.push(toLatLon([coordsDeserialized[i][0], coordsDeserialized[i][1]])); 
    }

    return {
      board : boardDeserialized, 
      coords : latlons
    };

  }else{
    console.error("[DB] error reading database"); 
    throw error("[DB error reading database]"); 
  }
}; 