import { Board, Building } from "../types/types";
import sqlite3  from "sqlite3";
import { Database, open } from "sqlite";
import { toLatLon, LatLon } from "geolocation-utils";

let db : Database; 

export const buildDb =  async() => {
  const dbPath = process.env.DB_PATH || './bruh.db'; 

  db = await open({
    filename : dbPath,
    driver : sqlite3.Database,
  }); 

  await db.exec("PRAGMA journal_mode = WAL;");
  await db.exec("PRAGMA synchronous = NORMAL;");
  
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

export const updateDb = async(building : Building, board : Board) => {
  console.log(`Updating db data for ${building}`);
  const {drawing} = board; 

  const boardString = JSON.stringify(drawing); 

  const update = `UPDATE boards SET board = ? WHERE building = ?`;

  await db.run(update, [boardString, building]); 
}; 

/**
 * @returns array of boards to be entered into the board manager
 */
export const readDb = async () : Promise<Board[]> => {
  const getBuildingSQL = 'SELECT building FROM boards'; 
  const getCoordSQL = `SELECT coords FROM boards`;
  const getBoardSQL = `SELECT board FROM boards`;
  

  const buildingSerialized = await db.all(getBuildingSQL);
  const coordsSerialized = await db.all(getCoordSQL); 
  const boardSerialized =  await db.all(getBoardSQL); 

  if (boardSerialized && coordsSerialized){
    const boards : Board[]= []; 

    console.log(JSON.stringify(buildingSerialized)); 
    
    const buildingDeSerialized : any[] = buildingSerialized; 
    const coordsDeserialized : any[] = coordsSerialized;
    const boardDeserialized : any[] = boardSerialized; 
    
    for (let i = 0 ; i < buildingSerialized.length ; i ++){
      let currentBuilding = buildingDeSerialized[i].building;
      let currentCoords : number[][] = JSON.parse(coordsDeserialized[i].coords); 
      let currentBoard : number[][] = JSON.parse(boardDeserialized[i].board);

      let latlons: LatLon[] = []; 
      for (let j = 0 ; j < currentCoords.length ; j++){
        latlons.push(toLatLon([currentCoords[j][0], currentCoords[j][1]])); 
      }

      const board : Board = {
        location : currentBuilding,
        drawing : currentBoard, 
        coords : latlons, 
        updates : 0
      } ; 

      boards.push(board); 
    }

    console.log(boards); 
    
    return boards; 
  }else{
    console.error("[DB] error reading database"); 
    throw new Error("[DB error reading database]"); 
  }
  
}; 

export const deleteBoardDb = async (building : string) : Promise<void> => {
  const deleteBoardSQL = 'DELETE FROM boards WHERE building = ?'; 
  await db.run(deleteBoardSQL, [building]); 
}