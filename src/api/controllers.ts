import { Request, Response } from 'express';
import { CacheService } from '../services/CacheService';

const cache = new CacheService();

export const getTokens = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;


        const tokens = await cache.getTopTokensByVolume(limit, offset);

        res.json({
            data: tokens,
            meta: {
                limit,
                offset,
                total: (await cache.getAllTokenAddresses()).length
            }
        });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
