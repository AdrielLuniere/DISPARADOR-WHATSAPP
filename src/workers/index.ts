import { whatsappWorker } from './whatsappWorker.js';
import { flowWorker } from './flowWorker.js';

console.log('[Worker Service] Iniciando processadores de fila...');

whatsappWorker.on('completed', (job) => {
  console.log(`[WhatsAppWorker] Job ${job.id} completado.`);
});

whatsappWorker.on('failed', (job, err) => {
  console.error(`[WhatsAppWorker] Job ${job?.id} falhou: ${err.message}`);
});

flowWorker.on('completed', (job) => {
  console.log(`[FlowWorker] Job ${job.id} processado com sucesso.`);
});

flowWorker.on('failed', (job, err) => {
  console.error(`[FlowWorker] Job ${job?.id} falhou: ${err.message}`);
});

console.log('[Worker Service] Workers ativos e aguardando jobs.');
