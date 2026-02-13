import EventEmitter from 'events';
import { Worker } from 'bullmq';

// Event bus global para simular o Redis pub/sub
const memoryBus = new EventEmitter();

export class MockQueue {
  private name: string;

  constructor(name: string) {
    this.name = name;
    console.log(`[MockQueue:${name}] Inicializada em modo MEMÓRIA.`);
  }

  async add(jobName: string, data: any, opts?: any) {
    const jobId = Date.now().toString();
    const job = { id: jobId, name: jobName, data, opts };
    
    console.log(`[MockQueue:${this.name}] Job adicionado: ${jobName}`);

    const delay = opts?.delay || 0;
    
    if (delay > 0) {
      setTimeout(() => {
        memoryBus.emit(`job:${this.name}`, job);
      }, delay);
    } else {
      setImmediate(() => {
        memoryBus.emit(`job:${this.name}`, job);
      });
    }

    return job;
  }
}

// Simulando a interface do Worker do BullMQ mas rodando em memória
export class MockWorker extends EventEmitter {
  private name: string;
  private processor: Function;

  constructor(name: string, processor: Function) {
    super();
    this.name = name;
    this.processor = processor;
    
    console.log(`[MockWorker:${name}] Worker iniciado em memória e aguardando jobs...`);

    memoryBus.on(`job:${name}`, async (job) => {
      console.log(`[MockWorker:${name}] Processando job ${job.id}`);
      try {
        await this.processor(job);
        this.emit('completed', job);
      } catch (err) {
        console.error(`[MockWorker:${name}] Erro no job ${job.id}:`, err);
        this.emit('failed', job, err);
      }
    });
  }
}
