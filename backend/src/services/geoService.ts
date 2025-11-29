import { insidePolygon, LatLon } from "geolocation-utils";
import { coords } from "../types/types";

function success(pos : any) {
  const crd = pos.coords;

  console.log("Your current position is:");
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);

  return crd; 
}

function error(err : any){
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

export const getGPS = () => {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(success, error); 
    }
    return success; 
}

export const validCoords = (cords : LatLon, coords2 : coords) => {
    return insidePolygon(cords, coords2); 
}