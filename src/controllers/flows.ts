import { FastifyInstance } from 'fastify';
import { FlowService } from '../services/flowService.js';

const flowService = new FlowService();

export async function flowRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const { name, steps } = request.body as { name: string; steps: any[] };
    const flow = await flowService.createFlow(name, steps);
    return reply.send(flow);
  });

  fastify.post('/:id/attach-list', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const count = await flowService.attachListToFlow(parseInt(id));
      return reply.send({ message: 'Fluxo iniciado para lista de contatos', executionCount: count });
    } catch (e: any) {
      return reply.code(400).send({ error: e.message });
    }
  });
}
