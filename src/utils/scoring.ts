import { ActivityScorer, DailyWeather } from "../types"

export const scoreIndoorSight: ActivityScorer = (weather: DailyWeather) => {
    return { score: Math.floor(Math.random() * 10) + 1 };
}

export const scoreOutDoorSight: ActivityScorer = (weather: DailyWeather) => {
    return { score: Math.floor(Math.random() * 10) + 1 };
}

export const scoreSkiing: ActivityScorer = (weather: DailyWeather) => {
    return { score: Math.floor(Math.random() * 10) + 1 };
}

export const scoreSurfing: ActivityScorer = (weather: DailyWeather) => {
    return { score: Math.floor(Math.random() * 10) + 1 };
}