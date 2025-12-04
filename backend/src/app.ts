import  express  from "express";
import { router } from "./routes/routes";
import { errorHandler } from "./middlewares/errorHandler";
import cors from 'cors'; 

export const app = express(); 

const FRONT_END_URL = process.env.FRONT_END_URL || "http://localhost:5173"

app.use(cors({
    origin : 'http://localhost:5173'
})); 

app.use(express.json()); 

app.use('/api/init', router); 

app.use(errorHandler); 
