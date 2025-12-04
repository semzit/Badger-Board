import { Router } from "express";
import {
    getBoard, 
    authenticate, 
    health, 
    setBoard
} from '../controller/controller'

export const router = Router(); 

router.get('/:id' , getBoard); 
router.post(`/auth`, authenticate);
router.get('/', health); 
router.post('/setBoard', setBoard)

