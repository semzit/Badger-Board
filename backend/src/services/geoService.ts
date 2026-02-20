import { insidePolygon, LatLon } from "geolocation-utils";
import { coords } from "../types/types";

/**
 * Validate coords fit inside of the building 
 * @param cords 
 * @param coords2 
 * @returns 
 */
export const validCoords = (cords : LatLon, coords2 : coords) => {
    return insidePolygon(cords, coords2); 
}