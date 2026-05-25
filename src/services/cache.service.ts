import Redis from "ioredis";
import { ICacheService } from "../types";


export class CacheService implements ICacheService {
    constructor(private redis: Redis) { }

    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await this.redis.get(key)
            if (raw === null) return null
            return JSON.parse(raw)
        } catch {
            return null
        }
    }

    async set(key: string, value: string | number, ttl: number): Promise<"OK"> {
        const stringify = JSON.stringify(value)
        return await this.redis.setex(key, ttl, stringify);
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }
}