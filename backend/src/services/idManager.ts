import { idHolder } from "../types/types";

const idH : idHolder = new Map(); 

/**
 * Find building for id 
 * @param id 
 * @returns the building for an ID
 */
export const findBuilding = (id : string) : string | undefined => {
    const building = idH.get(id); 
    return building; 
}

/**
 * Set new id - building pair 
 * @param id 
 * @param building - name of building
 */
export const setId = (id : string , building: string) => {
    idH.set(id, building); 
}

export const readIDHOLDER = () =>{
    console.log(idH); 
}