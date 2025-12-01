import { idHolder } from "../types/types";

const idH : idHolder = new Map(); 

export const findBuilding = (id : string) : string | undefined => {
    const building = idH.get(id); 
    return building; 
}

export const setId = (id : string , building: string) => {
    idH.set(id, building); 
}

export const readIDHOLDER = () =>{
    console.log(idH); 
}