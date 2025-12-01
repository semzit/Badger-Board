import { Request, Response, NextFunction } from "express";
import { buildingForCoords, findBoard, setBuilding } from "../services/boardManager";
import { findBuilding, setId } from "../services/idManager";
import { randomUUID } from "crypto";
import { auth } from "../types/types";
import { LatLon, toLatLon } from "geolocation-utils"
import { loadBoard } from "../services/dbService";

export const getBoard = (req : Request, res: Response, next : NextFunction) => {
    try{
        console.log("Get board request received"); 
        const id : string = req.params.id;  
        const building = findBuilding(id) ; 
        if (building ){
            const board = findBoard(building);
            res.json(board)
        }
    }catch (error){
        next(error); 
    }
}; 

export const authenticate = (req: Request, res: Response, next : NextFunction) => {
    try{
        let { coords } = req.body;
        console.log(req.body); 
        coords = toLatLon([coords.latitude, coords.longitude])
        const building =  buildingForCoords(coords);
        console.log("Authenticate request received"); 
        if (building){
            const uuid : string = randomUUID();  
            setId(uuid, building); 
            const json : auth = {
                id : uuid
            }; 
            console.log(`sent: ${JSON.stringify(json)}`);
            res.status(201).json(json);
        }else{
            console.log("[Controller] building not found for coords"); 
            res.status(404)  // no id created send to no accessable page
        }
    }catch(error){
        next(error); 
    }
}; 

export const health = (req: Request, res: Response, next : NextFunction) => {
    try{
        console.log("Health request received"); 
        res.status(200).json({hello: "hi"}) ; 
    }catch(error){
        next(error); 
    }
}; 

export const setBoard = (req: Request, res: Response, next : NextFunction) => {
    try{
        console.log("setBoard request received");
        const { boardName, board } = req.body;

        const {boardVals, coords} = board; 

        console.log(coords)
        // load board into the database
        // convert coords to latLot and add to DB and board manager
        const latLons : LatLon[] = [];
        for (let i = 0 ; i < coords.length ; i ++){
            latLons.push(toLatLon([coords[i][0], coords[i][1]])); 
        }

        loadBoard(boardName, boardVals, coords); 

        setBuilding(boardName,
            {
                board : boardVals,
                coords : coords
            }
        ); 
        
        console.log("Authenticate request received"); 
    
    }catch(error){
        console.log('[Controller] Set board error'); 
        next(error); 
    }
}; 