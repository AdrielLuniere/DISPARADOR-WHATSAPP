import { ContactService } from './src/services/contactService.js';
import prisma from './src/prisma/client.js';

const contactService = new ContactService();

async function seed() {
  console.log('Criando contatos de teste...');
  
  const contacts = [
    { name: 'Alice Teste', phone: '5511999990001' },
    { name: 'Bob Teste', phone: '5511999990002' },
    { name: 'Carol Teste', phone: '5511999990003' },
    { name: 'Dave Teste', phone: '5511999990004' },
    { name: 'Eve Teste', phone: '5511999990005' }
  ];

  await contactService.importContacts(contacts);
  
  console.log(`${contacts.length} contatos criados.`);
}

seed()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
