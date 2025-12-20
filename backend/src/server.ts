import { app } from "./app"; 
import { buildDb, readDb, updateDb } from "./services/dbService";
import { setBuilding } from "./services/boardManager";
import { start } from "./ws/ws";
import 'dotenv/config'

app.listen(8080, () => {
  console.log(`Server running on port ${process.env.PORT}`);
})

async function main(){
    try{
        await buildDb();
        
        const boards = await readDb();
        
        // from the db enter all data into board manager
        for (let i = 0; i < boards.length ; i ++){
            const {name, drawing, coords} = boards[i];  
            setBuilding(name , {
                drawing : drawing,
                coords : coords, 
                updates : 0 
            }); 
        };

       start();
    }catch (err){
        console.error(err); 
    }
}



main()

