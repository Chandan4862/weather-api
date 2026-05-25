# Travel Planner Api

Travel planner api using open-meteo api

# API

1. **`searchCities(name: String!, limit: Int): [City!]!`**
2. **`getWeather(latitude: Float!, longitude: Float!, days: Int): WeatherForecast!`**
3. **`getTravelPlan(cityName: String!, days: Int = 7): TravelPlan!`**

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