import redis from '../config/redis';
import { TokenData } from '../types';

export class CacheService {
    private static TOKEN_PREFIX = 'token:';
    private static ALL_TOKENS_SET = 'tokens:all';
    private static DEFAULT_TTL = 60;

    async saveToken(token: TokenData): Promise<void> {
        const key = `${CacheService.TOKEN_PREFIX}${token.token_address}`;
        await redis.set(key, JSON.stringify(token), 'EX', CacheService.DEFAULT_TTL);
        await redis.sadd(CacheService.ALL_TOKENS_SET, token.token_address);


        await redis.zadd('tokens:by:volume', token.volume_sol, token.token_address);
        await redis.zadd('tokens:by:price_change', token.price_1hr_change || 0, token.token_address);
        await redis.zadd('tokens:by:market_cap', token.market_cap_sol, token.token_address);
    }

    async getToken(address: string): Promise<TokenData | null> {
        const data = await redis.get(`${CacheService.TOKEN_PREFIX}${address}`);
        return data ? JSON.parse(data) : null;
    }

    async getAllTokenAddresses(): Promise<string[]> {
        return redis.smembers(CacheService.ALL_TOKENS_SET);
    }

    async getTopTokensByVolume(limit: number = 20, offset: number = 0): Promise<TokenData[]> {
        const addresses = await redis.zrevrange('tokens:by:volume', offset, offset + limit - 1);
        if (!addresses.length) return [];


        const keys = addresses.map(addr => `${CacheService.TOKEN_PREFIX}${addr}`);
        if (keys.length === 0) return [];

        const data = await redis.mget(...keys);
        return data
            .filter((d): d is string => d !== null)
            .map(d => JSON.parse(d));
    }
}
