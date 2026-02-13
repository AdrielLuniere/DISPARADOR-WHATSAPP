import dotenv from 'dotenv';
import { MockQueue } from './mock.js';

dotenv.config();

const USE_REDIS = process.env.USE_REDIS === 'true';

// Se precisarmos do Redis, teremos que importar o BullMQ. 
// Mas se o usuário não tem Docker, melhor nem tentar importar para não dar erro de binário ou conexão.

let BullQueue: any;

if (USE_REDIS) {
  try {
     // Tentativa arriscada de import dinâmico síncrono (não existe em ESM puro sem await).
     // Em ts-node/esm, top-level await pode funcionar.
     const bullmq = await import('bullmq');
     BullQueue = bullmq.Queue;
  } catch (e) {
    console.error('Falha ao importar BullMQ:', e);
  }
}

import { connection } from './connection.js';

export const createQueue = (name: string) => {
  if (USE_REDIS && BullQueue) {
    return new BullQueue(name, { connection });
  } else {
    // Se USE_REDIS for true mas falhou import, cai no mock? Não, melhor avisar.
    if (USE_REDIS && !BullQueue) console.warn('BullMQ não carregado, usando Mock.');
    return new MockQueue(name);
  }
};
