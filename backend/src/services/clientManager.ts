import { Building, ClientHolder, Id } from "../types/types";

const clientManager : ClientHolder = new Map(); 

/**
 * Add new Id-Client pair
 * @param id 
 * @param client 
 */
export const setClient = (id : Id, client : any) => {
    clientManager.set(id, client); 
}

/** 
 * @param client 
 * @returns building for client
 */
export const getBuilding = (client : any): Building | undefined => {
    return clientManager.get(client);  
}