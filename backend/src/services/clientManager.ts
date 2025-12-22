import { Building, ClientHolder, Id } from "../types/types";

const clientManager : ClientHolder = new Map(); 

export const setClient = (id : Id, client : any) => {
    clientManager.set(id, client); 
}

export const getBuilding = (client : any): Building | undefined => {
    return clientManager.get(client);  
}