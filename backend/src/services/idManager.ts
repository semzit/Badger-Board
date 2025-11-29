import { idHolder } from "../types/types";

const idHolder : idHolder = new Map(); 

export const getBuilding = (id : string) : string => {
    const building = idHolder.get(id); 
    if (building === undefined){
        throw new Error("[ID] Id not found in idHolder"); 
    }
    return building; 
}

export const setBuilding = (id : string , building: string) => {
    idHolder.set(id, building); 
}

