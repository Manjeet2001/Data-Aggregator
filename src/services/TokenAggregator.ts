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

        const dexTokens = await this.dexClient.searchTokens('SOL');


        for (const token of dexTokens) {
            await this.cache.saveToken(token);
        }

        this.emit('update', dexTokens);
        console.log(`Aggregated ${dexTokens.length} tokens.`);
    }
}
