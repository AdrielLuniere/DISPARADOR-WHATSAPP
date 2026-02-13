import dotenv from 'dotenv';
import { MockWorker } from '../queues/mock.js';
import { connection } from '../queues/connection.js';

dotenv.config();

const USE_REDIS = process.env.USE_REDIS === 'true';

let BullWorker: any;

if (USE_REDIS) {
  try {
     const bullmq = await import('bullmq');
     BullWorker = bullmq.Worker;
  } catch (e) {
     console.error('Falha ao importar BullMQ:', e);
  }
}

export const createWorker = (name: string, processor: any) => {
  if (USE_REDIS && BullWorker) {
    return new BullWorker(name, processor, { connection });
  } else {
    return new MockWorker(name, processor);
  }
};
