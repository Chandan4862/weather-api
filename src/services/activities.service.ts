import { ActivityRecommendation, ActivityType, DailyWeather, IActivityService } from "../types";
import { scoreIndoorSight, scoreOutDoorSight, scoreSkiing, scoreSurfing } from "../utils/scoring";

export class ActivityService implements IActivityService {
    private activityScoreMapping: any
    constructor() {
        this.activityScoreMapping = [
            [ActivityType.INDOOR_SIGHTSEEING, scoreIndoorSight],
            [ActivityType.OUTDOOR_SIGHTSEEING, scoreOutDoorSight],
            [ActivityType.SKIING, scoreSkiing],
            [ActivityType.SURFING, scoreSurfing]
        ]
    }

    rankActivities(weather: DailyWeather): ActivityRecommendation[] {
        const results: ActivityRecommendation[] = []

        for (const [type, scorer] of this.activityScoreMapping) {
            const { score } = scorer(weather);
            results.push({
                activity: type,
                score,
                rank: 0
            })
        }

        results.sort((a, b) => a.score - b.score)

        results.forEach((item, i) => {
            item.rank = i + 1
        })

        return results
    };
}