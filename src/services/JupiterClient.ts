import axios from 'axios';
import { TokenData } from '../types';

export class JupiterClient {
    private static BASE_URL = 'https://lite-api.jup.ag/tokens/v2';


    async getTokens(): Promise<TokenData[]> {
        try {

            const response = await axios.get(`${JupiterClient.BASE_URL}/search?query=SOL`);
            const tokens = response.data || [];


            return tokens.map((t: any) => ({
                token_address: t.address,
                token_name: t.name,
                token_ticker: t.symbol,
                price_sol: 0,

                market_cap_sol: 0,
                volume_sol: 0,
                liquidity_sol: 0,
                lastUpdated: Date.now(),
                source: ['jupiter']
            }));
        } catch (error) {
            console.error('Jupiter API error:', error);
            return [];
        }
    }
}
