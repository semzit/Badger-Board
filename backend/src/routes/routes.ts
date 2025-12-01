import { Router } from "express";
import {
    getBoard, 
    authenticate, 
    health
} from '../controller/controller'

export const router = Router(); 

router.get('/:id' , getBoard); 
router.post(`/`, authenticate);
router.get('/', health ) 

