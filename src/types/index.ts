export interface City {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    countryCode: string;
    timezone?: string;
    population?: number;
    admin1?: string;
}