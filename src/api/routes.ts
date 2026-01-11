import { Router } from 'express';
import { getTokens } from './controllers';

const router = Router();

router.get('/tokens', getTokens);

export default router;
