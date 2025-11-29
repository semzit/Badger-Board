import { LatLon } from "geolocation-utils";

export type initData = {
    building1 : {building : string, board : Buffer, coords: Buffer},
    building2 : {building : string, board : Buffer, coords: Buffer}
}; 

export type auth = {
    id : string
}; 

export type getBoard = {
    board : board
}; 

export type wsWrite = {
    id : string, 
    x : number, 
    y : number, 
    color : number
}; 

export type board = {
    board : number[][], 
    coords : LatLon[]
}; 

export type boardHolder = Map<string, board>; 

export type idHolder = Map<string, string>; 

export type building = string; 

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