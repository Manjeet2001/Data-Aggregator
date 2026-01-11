import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './api/routes';
import { TokenAggregator } from './services/TokenAggregator';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const aggregator = new TokenAggregator();

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

aggregator.on('update', (tokens) => {


    io.emit('price_update', tokens);
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    aggregator.start();
});
