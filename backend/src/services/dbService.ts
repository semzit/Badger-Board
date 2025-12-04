import { board, boardComplete, initData } from "../types/types";
import sqlite3  from "sqlite3";
import { Database, open } from "sqlite";
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

export const updateDb = async(building : string, board : board) => {
  const {drawing, coords} = board; 

  const boardString = JSON.stringify(drawing); 
  const coordString = JSON.stringify(coords); 

  const update =  `UPDATE boards SET board = ? coords = ? WHERE building = ?`;

  await db.run(update, [boardString, coordString, building]); 
}; 

/**
 * @returns array of boards to be entered into the board manager
 */
export const readDb = async () : Promise<boardComplete[]> => {
  const getBuildingSQL = 'SELECT building FROM boards'; 
  const getBoardSQL = `SELECT board FROM boards`;
  const getCoordSQL = `SELECT coords FROM boards`;

  const buildingSerialized = await db.get(getBuildingSQL);
  const boardSerialized =  await db.get(getBoardSQL); 
  const coordsSerialized = await db.get(getCoordSQL); 
  
  if (boardSerialized && coordsSerialized){
    const boards = []; 
    const buildingDeSerialized : string[] = JSON.parse(buildingSerialized.building); 
    const boardDeserialized : number[][][] = JSON.parse(boardSerialized.boards);
    const coordsDeserialized : number[][][] = JSON.parse(coordsSerialized.coords); 

    for (let i = 0 ; i < buildingSerialized.length ; i ++){
      
      let latlons: LatLon[] = []; 

      for (let j = 0 ; j < coordsDeserialized.length ; j++){
        latlons.push(toLatLon([coordsDeserialized[i][j][0], coordsDeserialized[i][j][1]])); 
      }

      const board = {
        name : buildingDeSerialized[i],
        drawing : boardDeserialized[i], 
        coords : latlons
      } ; 

      boards.push(board); 
    }
    
    return boards; 
  }else{
    console.error("[DB] error reading database"); 
    throw new Error("[DB error reading database]"); 
  }
  
}; 