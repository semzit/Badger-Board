import { serialize1d, serialize2d, deserialize } from "./serialize";
import { initData } from "../types/types";
import sqlite3  from "sqlite3";
import { Database, open } from "sqlite";
import { error } from "console";

export const buildDb =  async() => {

  const db = await open({
    filename : `./database.db`,
    driver : sqlite3.Database,
  }); 

  const creatDBschema : string = `
  CREATE TABLE IF NOT EXISTS boards (
    building TEXT NOT NULL PRIMARY KEY, 
    board BLOB,
    coords BLOB 
  );
  `; 

  await db.exec(creatDBschema);  

  const twoInit = serialize2d(Array.from({ length: 100 }, () =>
    Array.from({ length: 100 }, () => 0)
  )); 

  const oneInit = serialize1d(Array.from({ length: 100 })); 

  const initialData : initData = {
    building1 : {building : 'morgridge' , board : twoInit, coords : oneInit}, 
    building2 : {building : 'concord' , board : twoInit, coords : oneInit}
  }; 

  const buildDb : string = `
    INSERT OR REPLACE INTO boards (building, board, coords) VALUES 
      (?, ?, ?),
      (?, ?, ?)
  `;  

  await db.run(buildDb, [
    initialData.building1.building, 
    initialData.building1.board, 
    initialData.building1.coords, 

    initialData.building2.building, 
    initialData.building2.board, 
    initialData.building2.coords
  ]); 
  
  return db; 
}; 

export const updateDb = (db:Database , building : string, board : number[][]) => {
  const blob = serialize2d(board); 

  const update =  `UPDATE boards SET board = ? WHERE building = ?`;

  db.run(update, [blob, building]); 
}; 

export const readDb = async(db:Database, building: string) : Promise<number[][]> => {
  const get = `SELECT board FROM boards WHERE building =?`;
  
  const boardSerialized =  await db.get(get, [building]);
  
  if (boardSerialized){
    const boardDeserialized : number[][] = deserialize(boardSerialized);
    return boardDeserialized;    
  }else{
    console.error("[DB] error reading database"); 
    throw error("[DB error reading database]"); 
  }
}; 