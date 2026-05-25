import { AxiosInstance } from "axios";
import { ICacheService, ICityService, City, WeatherpiResponse } from "../types";
import config from "../config/env";
import { ExternalApiError, NotFoundError } from "../lib/errors";

export class CityService implements ICityService {
    constructor(
        private httpClient: AxiosInstance,
        private cacheService: ICacheService
    ) { }

    async searchCities(name: string, limit?: number): Promise<City[]> {
        const cacheKey = `search_cities_${name.toLocaleLowerCase().trim()}:${limit}`;

        // 1. Check cache (swallow failures — cache is non-critical)
        try {
            const cachedCities = await this.cacheService.get<City[]>(cacheKey);
            if (cachedCities) {
                return cachedCities;
            }
        } catch (err) {
            console.warn('CityService -- Cache read failed:', (err as Error).message);
        }

        // 2. Fetch from external Geocoding API
        const response = await this.httpClient.get<WeatherpiResponse>(
            `${config.WEATHER_API.geocodingBaseUrl}/search`,
            {
                params: {
                    name,
                    count: limit,
                    language: 'en',
                    format: 'json',
                },
            }
        );

        const results = response.data.results;
        if (!results || results.length === 0) {
            return [];
        }

        // 3. Map API response to City domain model
        const cities: City[] = results.map((r) => ({
            id: r.id,
            name: r.name,
            latitude: r.latitude,
            longitude: r.longitude,
            country: r.country,
            countryCode: r.country_code,
            timezone: r.timezone,
            population: r.population,
            admin1: r.admin1,
        }));

        // 4. Write to cache (fire-and-forget — don't block the response)
        this.cacheService.set(cacheKey, cities, config.WEATHER_API.ttl).catch((err) => {
            console.warn('CityService -- Cache write failed:', err.message);
        });

        return cities;
    }
}