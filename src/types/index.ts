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

export interface DailyWeather {
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitationSum: number;
    windSpeedMax: number;
    weatherCode: number;
    snowfallSum: number;
}

export interface WeatherForecast {
    latitude: number;
    longitude: number;
    timezone: string;
    daily: DailyWeather[];
}

//------------------------------------
export interface ICityService {
    searchCities(name: string, limit?: number): Promise<City[]>;
}

export interface ICacheService {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number): Promise<"OK">;
    del(key: string): Promise<void>;
}

export interface IWeatherService {
    getWeather(latitude: number, longitude: number, days: number): Promise<WeatherForecast>
}

//------------------------------------

//Api response
export interface WeatherApiResult {
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

export interface WeatherpiResponse {
    results?: WeatherApiResult[];
}

export interface WeatherForecastResponse {
    latitude: number;
    longitude: number;
    timezone: string;
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
        weather_code: number[];
        snowfall_sum: number[];
    };
}
