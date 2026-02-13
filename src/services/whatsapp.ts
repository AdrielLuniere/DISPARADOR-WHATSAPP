export class WhatsAppService {
  constructor() {
    console.log('[WhatsAppService] Inicializado (MOCK MODE)');
  }

  async sendText(phone: string, message: string): Promise<boolean> {
    // Simula delay de rede e processamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simula 90% de chance de sucesso
    const success = Math.random() > 0.1;
    
    if (success) {
      console.log(`[WhatsAppService] Enviado para ${phone}: "${message}"`);
      return true;
    } else {
      console.error(`[WhatsAppService] Falha ao enviar para ${phone}`);
      return false;
    }
  }
}

export const whatsAppService = new WhatsAppService();
