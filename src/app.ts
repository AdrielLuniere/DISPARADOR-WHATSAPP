import Fastify from 'fastify';
import { contactRoutes } from './controllers/contacts.js';
import { flowRoutes } from './controllers/flows.js';
import { campaignRoutes } from './controllers/campaigns.js';

const app = Fastify({ logger: true });

// Registrar rotas
app.register(contactRoutes, { prefix: '/contacts' });
app.register(flowRoutes, { prefix: '/flows' });
app.register(campaignRoutes, { prefix: '/campaigns' });

// Rota raiz para status
app.get('/', async () => {
  return { status: 'online', service: 'WhatsApp Dispatcher API', mode: process.env.USE_REDIS === 'true' ? 'Redis' : 'Mock (In-Memory)' };
});

const start = async () => {
  try {
    const port = 3000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
