import { AxiosInstance } from "axios";
import { DailyWeather, ICacheService, IWeatherService, WeatherForecast, WeatherForecastResponse } from "../types";
import config from "../config/env";

export class WeatherService implements IWeatherService {
    constructor(
        private httpClient: AxiosInstance,
        private cacheService: ICacheService
    ) { }

    async getWeather(latitude: number, longitude: number, days: number): Promise<WeatherForecast> {
        const cacheKey = `weather_${latitude}_${longitude}_${days}`;
        const cachedWeather = await this.cacheService.get<WeatherForecast>(cacheKey)
        if (cachedWeather) return cachedWeather;

        const response = await this.httpClient.get<WeatherForecastResponse>(`${config.WEATHER_API.weatherBaseUrl}/forecast`, {
            params: {
                latitude: latitude,
                longitude: longitude,
                daily: [
                    'temperature_2m_max',
                    'temperature_2m_min',
                    'precipitation_sum',
                    'wind_speed_10m_max',
                    'weather_code',
                    'snowfall_sum',
                ].join(','),
                forecast_days: days,
                timezone: 'auto',
            },
        })

        const data = response.data
        const daily = data.daily
        const dailyWeather: DailyWeather[] = daily.time.map((date, i) => ({
            date,
            temperatureMax: daily.temperature_2m_max[i],
            temperatureMin: daily.temperature_2m_min[i],
            precipitationSum: daily.precipitation_sum[i],
            windSpeedMax: daily.wind_speed_10m_max[i],
            weatherCode: daily.weather_code[i],
            snowfallSum: daily.snowfall_sum[i],
        }));

        const forecast: WeatherForecast = {
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
            daily: dailyWeather,
        };

        await this.cacheService.set(cacheKey, forecast, config.WEATHER_API.ttl)

        return forecast
    }
}