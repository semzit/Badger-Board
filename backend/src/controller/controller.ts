import { Request, Response, NextFunction } from "express";
import { buildingForCoords, findBoard } from "../services/boardManager";
import { findBuilding, setId } from "../services/idManager";
import { randomUUID } from "crypto";
import { auth } from "../types/types";

export const getBoard = (req : Request, res: Response, next : NextFunction) => {
    try{
        const { id } = req.body; 
        const building = findBuilding(id); 
        if (building === undefined){
            throw new Error("[Controller] building not found for id")
        }
        res.json(JSON.stringify(findBoard(building)))
    }catch (error){
        next(error); 
    }
}; 


export const authenticate = (req: Request, res: Response, next : NextFunction) => {
    try{
        const { coords } = req.body; 
        const building =  buildingForCoords(coords)
        
        if (building){
            const uuid : string = randomUUID();  
            setId(uuid, building); 
            const json : auth = {
                id : uuid
            }; 
            res.status(201).json(json);
        }else{
            res.status(404)  // no id created send to no accessable page
        }
    }catch(error){
        next(error); 
    }
}; 