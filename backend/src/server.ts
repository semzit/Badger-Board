import { app } from "./app"; 
import { buildDb, readDb } from "./services/dbService";
import { setBuilding } from "./services/boardManager";
import { start } from "./ws/ws";

const RESTPORT : number = Number(process.env.RESTPORT) || 8080; 

app.listen(RESTPORT , () => {
  console.log(`Server running on port ${RESTPORT}`);
})

async function main(){
    try{
        await buildDb();
        
        const boards = await readDb();
        
        // from the db enter all data into board manager
        for (let i = 0; i < boards.length ; i ++){
            const {location} = boards[i];  
            setBuilding(location , boards[i]); 
        };

       start();
    }catch (err){
        console.error(err); 
    }
}



main()

