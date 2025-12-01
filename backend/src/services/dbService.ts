import { serialize1d, serialize2d,deserializeCoords2d, deserialize1d, deserialize2d } from "./serialize";
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
    building TEXT NOT NULL, 
    board TEXT NOT NULL,
    coords TEXT NOT NULL 
  );
  `; 

  await db.exec(creatDBschema);  

  const boardInit: number[][] = Array(100).fill(0).map(() => Array(100).fill(0));

  const coordInit = [
      [45.6581812088617, -94.6197712462103], 
      [45.36719016965179, -82.90951936954298], 
      [40.591149344196786, -93.84462454988244],
      [39.936286135844675, -86.78525285118228]
    ]; 
    
  const initialData : initData = {
    building1 : {building : 'morgridge' , board : JSON.stringify(boardInit), coords : JSON.stringify(coordInit)}, 
    building2 : {building : 'concord' , board : JSON.stringify(boardInit), coords : JSON.stringify(coordInit)}
  }; 

  const buildDb : string = `
    INSERT OR REPLACE INTO boards (building, board, coords) VALUES 
      (?, ?, ?)
  `;  

  await db.run(buildDb, [
    initialData.building1.building, 
    initialData.building1.board, 
    initialData.building1.coords, 
  ]);

  await db.run(buildDb, [
    initialData.building2.building, 
    initialData.building2.board, 
    initialData.building2.coords, 
  ]);
}; 

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