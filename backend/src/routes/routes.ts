import { Router } from "express";
import {
    getBoard, 
    authenticate, 
    health, 
    setBoard
} from '../controller/controller'

export const router = Router(); 

router.get('/:id' , getBoard); 
router.post(`/`, authenticate);
router.get('/', health); 
router.post('/setBoard', setBoard)

