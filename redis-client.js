import Redis from "ioredis";
let redis;
if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
}
export const getRedisClient = () => {
    if (!redis) {
        redis = new Redis(process.env.REDIS_URL);
    }
    return redis;
};