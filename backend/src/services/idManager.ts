import { idHolder } from "../types/types";

const idHolder : idHolder = new Map(); 

export const findBuilding = (id : string) : string | undefined => {
    const building = idHolder.get(id); 
    return building; 
}

export const setId = (id : string , building: string) => {
    idHolder.set(id, building); 
}