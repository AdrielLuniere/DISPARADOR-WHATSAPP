import prisma from '../prisma/client.js';
import { flowQueue } from '../queues/definitions.js';

export class FlowService {
  async createFlow(name: string, steps: { order: number; delayMinutes: number; message: string }[]) {
    return prisma.flow.create({
      data: {
        name,
        steps: {
          create: steps.map(s => ({
            order: s.order,
            delayMinutes: s.delayMinutes,
            message: s.message
          }))
        }
      },
      include: { steps: true }
    });
  }

  async attachListToFlow(flowId: number) {
    // 1. Pegar todos os contatos
    const contacts = await prisma.contact.findMany();
    const flow = await prisma.flow.findUnique({ where: { id: flowId }, include: { steps: { orderBy: { order: 'asc' } } } });

    if (!flow || flow.steps.length === 0) {
      throw new Error('Fluxo inválido ou sem etapas.');
    }

    const firstStep = flow.steps[0];
    const initialDelay = firstStep.delayMinutes * 60 * 1000;

    const executions = [];

    // 2. Para cada contato, criar execução e agendar
    for (const contact of contacts) {
      const execution = await prisma.flowExecution.create({
        data: {
          contactId: contact.id,
          flowId: flow.id,
          currentStepId: firstStep.id,
          status: 'ACTIVE',
          nextExecution: new Date(Date.now() + initialDelay)
        }
      });

      // Agendar na fila
      await flowQueue.add('process-step', {
        executionId: execution.id,
        stepId: firstStep.id
      }, {
        delay: initialDelay
      });

      executions.push(execution);
    }

    return executions.length;
  }
}

export const flowService = new FlowService();
