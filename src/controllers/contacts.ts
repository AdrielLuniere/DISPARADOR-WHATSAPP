import { FastifyInstance } from 'fastify';
import { ContactService } from '../services/contactService.js';

const contactService = new ContactService();

export async function contactRoutes(fastify: FastifyInstance) {
  fastify.post('/import', async (request, reply) => {
    const { contacts } = request.body as { contacts: { name: string; phone: string }[] };
    
    if (!contacts || !Array.isArray(contacts)) {
      return reply.code(400).send({ error: 'Formato inválido. Esperado array de contatos.' });
    }

    const result = await contactService.importContacts(contacts);
    return reply.send({ message: 'Contatos importados', count: result.length });
  });
}
