import { Queue as BullQueue, JobsOptions } from 'bullmq';
import { connection } from './connection.js';

// Interface compatível com BullMQ Queue basic methods
export interface IQueue {
  add(name: string, data: any, opts?: JobsOptions): Promise<any>;
}

class MockQueue implements IQueue {
  private name: string;

  constructor(name: string) {
    this.name = name;
    console.warn(`[MockQueue] Fila '${name}' inicializada em modo MEMÓRIA (Redis indisponível). Jobs não serão persistidos.`);
  }

  async add(name: string, data: any, opts?: JobsOptions) {
    const delay = opts?.delay || 0;
    console.log(`[MockQueue:${this.name}] Job '${name}' agendado (Delay: ${delay}ms)`);
    
    // Simula o processamento do worker via evento/timeout
    // Nota: Em um sistema real mockado, precisariamos de um EventBus para acionar o worker.
    // Para simplificar, apenas logamos que foi aceito.
    // O Worker precisaria ser refatorado para consumir de um EventBus em memória também.
    
    // Solução mais simples: Se não tem Redis, não processa background jobs reais, 
    // ou fazemos um processamento síncrono fake aqui mesmo se o delay for curto?
    
    // Vamos optar por avisar o usuário que sem Redis, a automação para.
    return { id: 'mock-id-' + Date.now(), name, data, opts };
  }
}

// Factory para decidir qual Queue usar
export const createQueue = (name: string) => {
  // Vamos tentar conectar, mas o construtor do BullMQ não falha imediatamente, ele retenta.
  // A estratégia aqui será: O usuário não tem Docker.
  // Vamos forçar o uso de uma implementação simples ou avisar.
  
  // Devido a complexidade de reescrever todo o worker para memória,
  // vamos manter o BullMQ mas instruir o usuário.
  
  // PORÉM, para o servidor HTTP rodar sem ficar "crashando" com logs de erro,
  // podemos envolver a criação.
  
  return new BullQueue(name, { connection });
};
