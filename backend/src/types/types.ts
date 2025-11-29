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

export type board = number[][]; 

export type boardHolder = Map<string, board>; 

export type idHolder = Map<string, string>; 

export type building = string ; 