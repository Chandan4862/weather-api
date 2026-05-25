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

export function validateCityName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
        throw new ValidationError('City name must be at least 2 characters');
    }
    if (trimmed.length > 100) {
        throw new ValidationError('City name must not exceed 100 characters');
    }
    return trimmed;
}