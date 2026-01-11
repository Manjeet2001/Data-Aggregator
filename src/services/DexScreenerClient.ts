import axios from 'axios';
import { TokenData, DexScreenerPair } from '../types';

export class DexScreenerClient {
    private static BASE_URL = 'https://api.dexscreener.com/latest/dex';
    private lastRequestTime = 0;
    private MIN_REQUEST_INTERVAL = 1000;

    async searchTokens(query: string): Promise<TokenData[]> {
        await this.enforceRateLimit();

        try {
            const response = await axios.get(`${DexScreenerClient.BASE_URL}/search?q=${query}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const pairs: DexScreenerPair[] = response.data.pairs || [];


            const solPairs = pairs.filter(p => p.chainId === 'solana');

            return solPairs.map(this.normalizeTokenData);
        } catch (error) {
            console.error('DexScreener API error:', error);
            return [];
        }
    }

    private normalizeTokenData(pair: DexScreenerPair): TokenData {
        return {
            token_address: pair.baseToken.address,
            token_name: pair.baseToken.name,
            token_ticker: pair.baseToken.symbol,
            price_sol: parseFloat(pair.priceNative),
            market_cap_sol: pair.marketCap || 0,

            volume_sol: pair.volume.h24,
            liquidity_sol: pair.liquidity?.base || 0,
            transaction_count: pair.txns.h24.buys + pair.txns.h24.sells,
            price_1hr_change: pair.priceChange.h1,
            protocol: pair.dexId,
            lastUpdated: Date.now(),
            source: ['dexscreener']
        };
    }

    private async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLast));
        }
        this.lastRequestTime = Date.now();
    }
}
