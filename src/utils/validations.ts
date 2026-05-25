import { ValidationError } from "../lib/errors";

export function validateLatitude(lat: number): number {
    if (lat < -90 || lat > 90) {
        throw new ValidationError('Latitude must be between -90 and 90');
    }
    return lat;
}

export function validateLongitude(lon: number): number {
    if (lon < -180 || lon > 180) {
        throw new ValidationError('Longitude must be between -180 and 180');
    }
    return lon;
}