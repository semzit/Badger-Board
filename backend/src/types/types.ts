import { LatLon } from "geolocation-utils";

export type initData = {
    building1 : {building : string, board : string, coords: string},
    building2 : {building : string, board : string, coords: string}
}; 

export type auth = {
    id : string
}; 

export type getBoard = {
    board : board
}; 

export type wsWrite = {
    userId : string, 
    x : number, 
    y : number, 
    color : number
}; 

export type update = {
    x : number, 
    y : number, 
    color : number
}; 

export type board = {
    board : number[][], 
    coords : LatLon[]
}; 

export type id = string; 

export type building = string; 

export type clientHolder = Map<id, any>; 

export type boardHolder = Map<building, board>; 

export type idHolder = Map<id, building>;

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