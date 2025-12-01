import { app } from "./app"; 
import { buildDb, readDb, updateDb } from "./services/dbService";
import { setBuilding } from "./services/boardManager";
import { board } from "./types/types";
import { start } from "./ws/ws";

app.listen(8080, () => {
  console.log(`Server running on port ${process.env.PORT}`);
})

async function main(){
    try{
        await buildDb();
        
        //await readDb(); 


        const concordInfo : board = await readDb("concord"); 

        await setBuilding("concord", concordInfo); 

       start();
       
       const interval = setInterval(updateDb, 10 * 60 * 1000); 

    }catch (err){
        console.error(err); 
    }
}

main()

