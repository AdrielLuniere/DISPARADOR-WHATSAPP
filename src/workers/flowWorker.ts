import { Job } from 'bullmq';
import { createWorker } from './factory.js';
import prisma from '../prisma/client.js';
import { whatsappQueue, flowQueue } from '../queues/definitions.js';

interface FlowJobData {
  executionId: number;
  stepId: number; // O passo que deve ser executado AGORA
}

export const flowWorker = createWorker('flow-queue', async (job: Job<FlowJobData>) => {
  const { executionId, stepId } = job.data;
  
  console.log(`[FlowWorker] Executando passo ${stepId} da execução ${executionId}`);

  const execution = await prisma.flowExecution.findUnique({
    where: { id: executionId },
    include: { contact: true, flow: true }
  });

  if (!execution || execution.status !== 'ACTIVE') {
    console.log(`[FlowWorker] Execução ${executionId} não encontrada ou inativa.`);
    return;
  }

  const currentStep = await prisma.flowStep.findUnique({ where: { id: stepId } });

  if (!currentStep) {
    console.error(`[FlowWorker] Passo ${stepId} não encontrado.`);
    return;
  }

  // 1. Enviar mensagem do passo atual (Agendar na fila de envio imediato)
  // Criar registro na fila de envio para rastreabilidade
  const queueItem = await prisma.queueItem.create({
    data: {
      contactId: execution.contactId,
      message: currentStep.message,
      status: 'PENDING'
    }
  });

  await whatsappQueue.add('send-message', {
    contactId: execution.contactId,
    message: currentStep.message,
    queueItemId: queueItem.id
  });

  console.log(`[FlowWorker] Mensagem do passo ${stepId} agendada para envio.`);

  // 2. Determinar próximo passo
  const nextStep = await prisma.flowStep.findFirst({
    where: {
      flowId: execution.flowId,
      order: { gt: currentStep.order }
    },
    orderBy: { order: 'asc' }
  });

  if (nextStep) {
    // Calcular delay (converter minutos para milissegundos)
    const delayMs = nextStep.delayMinutes * 60 * 1000;
    const nextExecutionTime = new Date(Date.now() + delayMs);

    // Atualizar execução
    await prisma.flowExecution.update({
      where: { id: executionId },
      data: {
        currentStepId: nextStep.id,
        nextExecution: nextExecutionTime
      }
    });

    // Agendar job do próximo passo no FLOW queue
    await flowQueue.add('process-step', {
      executionId: execution.id,
      stepId: nextStep.id
    }, {
      delay: delayMs // AQUI A MÁGICA: O BullMQ segura o job até dar o tempo
    });

    console.log(`[FlowWorker] Próximo passo (${nextStep.order}) agendado para ${nextExecutionTime}`);

  } else {
    // Fim do fluxo
    await prisma.flowExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPLETED',
        nextExecution: null
      }
    });
    console.log(`[FlowWorker] Fluxo ${execution.flowId} concluído para contato ${execution.contactId}`);
  }

});
