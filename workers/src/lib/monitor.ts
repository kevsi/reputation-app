import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { scrapingQueue, analysisQueue, notificationsQueue, reportsQueue } from './queues';

export const setupMonitor = () => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
        queues: [
            new BullAdapter(scrapingQueue as any),
            new BullAdapter(analysisQueue as any),
            new BullAdapter(notificationsQueue as any),
            new BullAdapter(reportsQueue as any),
        ],
        serverAdapter: serverAdapter,
    });

    const app = express();
    app.use('/admin/queues', serverAdapter.getRouter());

    const PORT = process.env.MONITOR_PORT || 3005;
    app.listen(PORT, () => {
        console.log(`📊 Worker Monitor available at http://localhost:${PORT}/admin/queues`);
    });
};
