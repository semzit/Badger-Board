import { LatLon } from "../schemas";
import { insidePolygon } from "geolocation-utils";

/**
 * Check whether a coordinate lies inside the given polygon vertices.
 */
export const isInsidePolygon = (point: LatLon, polygon: LatLon[]): boolean =>
  insidePolygon(point, polygon);
