import { FastifyInstance } from 'fastify';
import prisma from '../prisma/client.js';
import { whatsappQueue } from '../queues/definitions.js';

export async function campaignRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const { message, delayMin, delayMax } = request.body as { message: string, delayMin: number, delayMax: number };
    
    // Cria campanha
    const campaign = await prisma.campaign.create({
      data: { message, delayMin, delayMax, status: 'ACTIVE' }
    });

    // Pega todos os contatos
    const contacts = await prisma.contact.findMany();

    // Agenda envio para cada um com delay aleatório
    for (const contact of contacts) {
      const randomDelay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin) * 1000;
      
      const queueItem = await prisma.queueItem.create({
        data: { contactId: contact.id, message, status: 'PENDING' }
      });

      await whatsappQueue.add('send-campaign', {
        contactId: contact.id,
        message,
        queueItemId: queueItem.id
      }, {
        delay: randomDelay
      });
    }

    return reply.send({ message: 'Campanha iniciada', campaignId: campaign.id, contactsCount: contacts.length });
  });
}
