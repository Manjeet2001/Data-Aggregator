import Redis from 'ioredis';
import { config } from './index';

const redis = new Redis(config.redisUrl);

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redis;
