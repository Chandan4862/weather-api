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

export interface ICityService {
    searchCities(name: string, limit?: number): Promise<City[]>;
}

export interface ICacheService {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number): Promise<"OK">;
    del(key: string): Promise<void>;
}

//Api response
export interface WheatherApiResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    timezone?: string;
    population?: number;
    admin1?: string;
}

export interface WheatherpiResponse {
    results?: WheatherApiResult[];
}
