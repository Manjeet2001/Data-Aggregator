import { EventEmitter } from 'events';
import { DexScreenerClient } from './DexScreenerClient';
import { JupiterClient } from './JupiterClient';
import { CacheService } from './CacheService';
import { TokenData } from '../types';

export class TokenAggregator extends EventEmitter {
    private dexClient: DexScreenerClient;
    private jupClient: JupiterClient;
    private cache: CacheService;
    private isRunning: boolean = false;

    constructor() {
        super();
        this.dexClient = new DexScreenerClient();
        this.jupClient = new JupiterClient();
        this.cache = new CacheService();
    }

    async start(intervalMs: number = 30000) {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('Aggregator started...');


        const runLoop = async () => {
            if (!this.isRunning) return;
            try {
                await this.aggregate();
            } catch (error) {
                console.error('Aggregation error:', error);
            }
            setTimeout(runLoop, intervalMs);
        };

        runLoop();
    }

    async aggregate() {
        console.log('Fetching data...');

        // 1. Fetch from sources (Primary: DexScreener)
        let tokens = await this.dexClient.searchTokens('SOL');

        // Fallback to Jupiter if DexScreener failed or was rate limited
        if (!tokens || tokens.length === 0) {
            console.log('DexScreener yielded no results (or rate limited). Falling back to Jupiter...');
            tokens = await this.jupClient.getTokens();
        }

        // 2. Merge and Save
        for (const token of tokens) {
            await this.cache.saveToken(token);
        }

        this.emit('update', tokens);
        console.log(`Aggregated ${tokens.length} tokens.`);
    }
}
