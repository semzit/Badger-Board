import { LatLon } from "geolocation-utils";

export type InitData = {
    building1 : {building : string, board : string, coords: string},
    building2 : {building : string, board : string, coords: string}
}; 

export type Auth = {
    id : string
}; 

export type GetBoard = {
    board : Board
}; 

export type WsWrite = {
    userId : string, 
    x : number, 
    y : number, 
    color : number
}; 

export type Update = {
    x : number, 
    y : number, 
    color : number
}; 

export type Board = {
    location : Building, 
    drawing : number[][], 
    coords : LatLon[], 
    updates : number  
}; 

export type SetBoard = {
    boardName : string, 
    board : Board
}

export type Id = string; 

export type Building = string; 

export type ClientHolder = Map<Id, any>; 

export type boardHolder = Map<Building, Board>; 

export type idHolder = Map<Id, Building>;

/**
 * coords example
 * coords = [
  [4.03146, 51.9644],
  [4.03151, 51.9643],
  [4.05279, 51.9605],
  [4.03146, 51.9644]
  ]
 */
export type coords = LatLon[]