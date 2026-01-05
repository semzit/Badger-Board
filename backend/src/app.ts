import  express  from "express";
import { router } from "./routes/routes";
import { errorHandler } from "./middlewares/errorHandler";
import cors from 'cors'; 

export const app = express(); 

app.use(cors({
    origin : process.env.FRONTEND_URL || "http://localhost",
    credentials : true
})); 

app.use(express.json()); 

app.use('/api', router); 

app.use(errorHandler); 
