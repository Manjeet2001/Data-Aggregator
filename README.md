# Real-time Data Aggregation Service

A high-performance backend service that aggregates real-time meme coin data from multiple DEX sources (DexScreener, Jupiter) with efficient caching and live WebSocket updates.

## Features
- **Multi-Source Aggregation**: Fetches and merges data from DexScreener and Jupiter APIs.
- **Smart Caching**: Uses Redis with configurable TTL (default 60s) and Sorted Sets for efficient ranking.
- **Real-time Updates**: WebSocket (Socket.io) server pushes price/volume updates to connected clients.
- **Rate Limiting**: Respects API limits (e.g. 300 req/min for DexScreener) using exponential backoff/queuing.
- **REST API**: Clean endpoints for fetching filtered and sorted token lists.

## Tech Stack
- **Runtime**: Node.js + TypeScript
- **Web Framework**: Express.js
- **Database/Cache**: Redis
- **Real-time**: Socket.io
- **HTTP Client**: Axios

## Prerequisites
- Node.js (v18+)
- Redis Server (Running on default port `6379` or configured via `REDIS_URL`)

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Redis URL defaults to `redis://localhost:6379`.

3. **Build**
   ```bash
   npx tsc
   ```
   (Output to `dist/`)

4. **Start Server**
   ```bash
   npm run build && npm start
   # Or for development with hot-reload:
   npm run dev
   ```

## API Documentation

### REST API
- **GET /api/tokens**
  - **Query Params**: `limit` (default 20), `offset` (default 0).
  - **Response**: JSON object with `data` (array of tokens) and `meta` (pagination).
  - **Example**: `curl http://localhost:3000/api/tokens?limit=5`

### WebSocket API
- **Connect**: `ws://localhost:3000`
- **Events**:
  - `price_update`: Emitted when aggregator refreshes data. Payload is an array of updated tokens.

## Design Decisions
- **Aggregation Strategy**: DexScreener is used as the primary source for discovery ("SOL" search). Data is normalized and stored individually in Redis keys (`token:{addr}`) and indexes (`tokens:by:volume`).
- **Caching**: Data is cached for 60 seconds to minimize upstream API calls while keeping data relatively fresh.
- **Scalability**: Redis handles high-throughput read/write. The aggregator runs asynchronously. WebSocket broadcasts are decoupled from the API request cycle.

## Deployment
Deployed link : https://data-aggregator-opaz.onrender.com
