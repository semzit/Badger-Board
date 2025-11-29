import { Request, Response, NextFunction } from "express";
import { getBoard, auth } from "../types/types";
import {}

export const getBoard = (req : Request, res: Response, next : NextFunction){
    try{
        const { id } = req.body; 

        res.json(JSON.stringify())
    }catch (error){
        next(error); 
    }
}; 