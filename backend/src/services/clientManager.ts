import { building, clientHolder, id } from "../types/types";

const clientManager : clientHolder = new Map(); 

export const setClient = (id : id, client : any) => {
    clientManager.set(id, client); 
}

export const getBuilding = (client : any): building | undefined => {
    return clientManager.get(client);  
}