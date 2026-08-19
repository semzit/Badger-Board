import { describe, expect, it } from "vitest";
import { isInsidePolygon } from "../src/services/geoService";

const square = [
  { latitude: -1, longitude: -1 },
  { latitude: -1, longitude: 1 },
  { latitude: 1, longitude: 1 },
  { latitude: 1, longitude: -1 },
];

describe("geoService", () => {
  it("returns true for a point inside the polygon", () => {
    expect(isInsidePolygon({ latitude: 0, longitude: 0 }, square)).toBe(true);
  });

  it("returns false for a point outside the polygon", () => {
    expect(isInsidePolygon({ latitude: 5, longitude: 5 }, square)).toBe(false);
  });

  it("returns false for a point on the boundary's far side", () => {
    expect(isInsidePolygon({ latitude: -10, longitude: 0 }, square)).toBe(false);
  });

  it("handles an arbitrary triangle", () => {
    const triangle = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 4 },
      { latitude: 4, longitude: 0 },
    ];
    expect(isInsidePolygon({ latitude: 1, longitude: 1 }, triangle)).toBe(true);
    expect(isInsidePolygon({ latitude: 3, longitude: 3 }, triangle)).toBe(false);
  });
});
