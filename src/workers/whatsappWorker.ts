import { Job } from 'bullmq';
import { createWorker } from './factory.js';
import prisma from '../prisma/client.js';
import { whatsAppService } from '../services/whatsapp.js';

interface WhatsAppJobData {
  contactId: number;
  message: string;
  queueItemId: number;
}

export const whatsappWorker = createWorker('whatsapp-queue', async (job: Job<WhatsAppJobData>) => {
  const { contactId, message, queueItemId } = job.data;
  
  console.log(`[WhatsAppWorker] Processando envio para Contato ID ${contactId}...`);

  try {
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) throw new Error('Contato não encontrado');

    const sent = await whatsAppService.sendText(contact.phone, message);

    await prisma.queueItem.update({
      where: { id: queueItemId },
      data: {
        status: sent ? 'SENT' : 'FAILED',
        attempts: { increment: 1 }
      }
    });

    if (!sent) throw new Error('Falha no envio do serviço WhatsApp');

  } catch (error) {
    console.error(`[WhatsAppWorker] Erro no job ${job.id}:`, error);
    
    // Atualiza status para falha se exceder tentativas (o BullMQ faz retry automático também)
    await prisma.queueItem.update({
      where: { id: queueItemId },
      data: { status: 'FAILED', attempts: { increment: 1 } }
    });
    
    throw error; // Lança erro para o BullMQ tentar novamente se configurado
  }
});
