import { TokenAggregator } from '../src/services/TokenAggregator';
import { DexScreenerClient } from '../src/services/DexScreenerClient';
import { CacheService } from '../src/services/CacheService';

jest.mock('../src/services/DexScreenerClient');
jest.mock('../src/services/JupiterClient');
jest.mock('../src/services/CacheService');

describe('TokenAggregator', () => {
    let aggregator: TokenAggregator;
    let mockSaveToken: jest.Mock;

    beforeEach(() => {
        mockSaveToken = jest.fn();
        (CacheService as unknown as jest.Mock).mockImplementation(() => ({
            saveToken: mockSaveToken
        }));

        (DexScreenerClient as unknown as jest.Mock).mockImplementation(() => ({
            searchTokens: jest.fn().mockResolvedValue([
                {
                    token_address: 'addr1',
                    token_name: 'T1',
                    token_ticker: 'T1',
                    price_sol: 1.0,
                    market_cap_sol: 1000,
                    volume_sol: 500,
                    liquidity_sol: 100,
                    lastUpdated: 1234567890,
                    source: ['dexscreener']
                }
            ])
        }));

        aggregator = new TokenAggregator();
    });

    it('should fetch and save tokens', async () => {
        await aggregator.aggregate();
        expect(mockSaveToken).toHaveBeenCalledTimes(1);
    });

    it('should emit update event', async () => {
        const spy = jest.fn();
        aggregator.on('update', spy);
        await aggregator.aggregate();
        expect(spy).toHaveBeenCalled();
    });
});
