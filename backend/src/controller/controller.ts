import { Request, Response, NextFunction } from "express";
import { boards, buildingForCoords, findBoard, setBuilding, removeBoard } from "../services/boardManager";
import { findBuilding, setId } from "../services/idManager";
import { randomUUID } from "crypto";
import { Auth, Board } from "../types/types";
import { LatLon, toLatLon } from "geolocation-utils"
import { loadBoard, deleteBoardDb } from "../services/dbService";

/**
 * Get board for an id 
 * @param req 
 * @param res 
 * @param next 
 */
export const getBoard = (req : Request, res: Response, next : NextFunction) => {
    try{
        console.log("Get board request received"); 
        const id : string = req.params.id;  
        const building = findBuilding(id) ; 
        if (building){
            const board : Board = findBoard(building);
            res.json(board)
        }
    }catch (error){
        next(error); 
    }
}; 

/**
 * Authenticate a users location and pass ID to user
 * @param req
 * @param res 
 * @param next 
 */
export const authenticate = (req: Request, res: Response, next : NextFunction) => {
    try{
        let { coords } = req.body;
        console.log(req.body); 
        coords = toLatLon([coords.longitude, coords.latitude])
        const building =  buildingForCoords(coords);
        console.log("Authenticate request received"); 
        if (building){
            const uuid : string = randomUUID();  
            setId(uuid, building); 
            const json : Auth = {
                id : uuid
            }; 
            console.log(`sent: ${JSON.stringify(json)}`);
            res.status(201).json(json);
        }else{
            console.log("[Controller] building not found for coords"); 
            res.status(404).send()  // no id created send to outside page
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

/**
 * Update a board 
 * @param req 
 * @param res 
 * @param next 
 */
export const setBoard = async (req: Request, res: Response, next : NextFunction) => {
    try{
        console.log("setBoard request received");
        const { boardName, board, password } = req.body;

        const serverPass = process.env.ADMIN_PASSWORD || 1234; 
        if (password != serverPass) {
            throw new Error("invalid password"); 
        }
        
        const {drawing, coords} = board; 

        // load board into the database
        // convert coords to latLot and add to DB and board manager
        const latLons : LatLon[] = [];
        for (let i = 0 ; i < coords.length ; i ++){
            latLons.push(toLatLon([coords[i][1], coords[i][0]])); 
        }

        const boardInit = Array(100).fill(0).map(() => Array(100).fill(0));

        // load board manager
        await setBuilding(boardName, {
            location : boardName,
            drawing: boardInit, 
            coords : latLons, 
            updates : 0
        }); 
        
        // load db 
        await loadBoard(boardName, drawing, coords); 
        res.status(201).send(); 
    }catch(error){
        console.log('[Controller] Set board error'); 
        res.status(404).send(); 
        next(error); 
    }
}; 

/**
 * Delete board controller 
 * @param req 
 * @param res 
 * @param next 
 */
export const deleteBoard =  async (req: Request, res: Response, next : NextFunction) => {
    try {
        console.log("deleteBoard request received"); 
        const { boardName, password } = req.body; 

        const serverPass = process.env.ADMIN_PASSWORD || 1234; 
        if (password != serverPass) {
            throw new Error("invalid password"); 
        }

        await removeBoard(boardName); 
        await deleteBoardDb(boardName); 
        res.status(201).send(); 
    } catch (error) {
        console.log('[Controller] Delete board error')
        next(error); 
    }
}; 

/**
 * Get names of available buildings
 * @param req 
 * @param res 
 * @param next 
 */
export const getBoardNames = async (req: Request, res: Response, next : NextFunction) => {
    try{
        console.log("getBoards request received"); 
        let boardList : any = []; 

        boards().forEach((element) =>{
            boardList.push(element.location); 
        })
        // add to json 
        console.log(boardList); 
        res.json(boardList); 
    }catch(error){
        console.log('[Controller] get board name error')
        next(error); 
    }
}; 