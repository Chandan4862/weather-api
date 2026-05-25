# Travel Planner Api

Travel planner api using open-meteo api

# Setup
- docker compose up

# API

1. **`searchCities(name: String!, limit: Int): [City!]!`**
  ```graphql
query SearchCities($name: String!, $limit: Int) {
  searchCities(name: $name, limit: $limit) {
    id
    name
    latitude
    longitude
  }
}
  ```

2. **`getWeather(latitude: Float!, longitude: Float!, days: Int): WeatherForecast!`**
  ```graphql
query GetWeather($latitude: Float!, $longitude: Float!, $days: Int) {
  getWeather(latitude: $latitude, longitude: $longitude, days: $days) {
    latitude
    longitude
    timezone
    daily {
      date
      temperatureMax
      temperatureMin
      precipitationSum
      windSpeedMax
      weatherCode
      snowfallSum
    }
  }
}
  ```
3. **`getTravelPlan(cityName: String!, days: Int = 7): TravelPlan!`**
  ```graphql
  query GetTravelPlan($cityName: String!, $days: Int) {
    getTravelPlan(cityName: $cityName, days: $days) {
      city {
        name
        country
        latitude
        longitude
      }
      dailyPlans {
        date
        weather {
          temperatureMax
          precipitationSum
        }
        activities {
          activity
          rank
        }
      }
    }
  }
  ```

# Architecture & Technical Choices

- **API**: **GraphQL** (`express-graphql`)
- Resolvers with Dependency Injected services.
- Business Logic in service file.
- **Caching**: **Redis** - uses redis for caching external api data
- **Testing**: **Jest** and **Supertest**

# Omissions and Future Improvements:

- Ranking activity uses placeholder logic (`Math.random()`). A proper logic with weather data taken into consideration.

- Database persistence: Currently the application is stateless. Persist user data in database, so that user can save their travel plan.

- **Rate Limiting**: Skipped to keep it simple, public API needs to be rate limited

- **Downstream Service** - Along with rate limitter, auto retry and Circuit Breaker pattern (if api is down)

- **Weather API** - Current service relies on open-meteo api, a factory pattern to create an instance of open-meto class, so that another weather-api can be easily intergrated.