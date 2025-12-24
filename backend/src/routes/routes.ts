import { Router } from "express";
import {
    getBoard, 
    authenticate, 
    health, 
    setBoard, 
    deleteBoard, 
    getBoardNames
} from '../controller/controller'

export const router = Router(); 

router.get(`init/:id` , getBoard); 
router.post(`init/auth`, authenticate);
router.get(`/`, health); 
router.post(`/setBoard`, setBoard)
router.post(`/deleteBoard`, deleteBoard); 
router.get(`/boards`, getBoardNames); 