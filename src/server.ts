// Em modo MOCK (sem Redis), precisamos rodar tudo no mesmo processo
// para que o EventEmitter da memória seja compartilhado.

console.log('[System] Iniciando sistema unificado (API + Workers)...');

// Importa os workers (eles se registram e começam a escutar eventos)
import './workers/index.js';

// Importa a API (ela inicia o servidor Fastify)
import './app.js';
