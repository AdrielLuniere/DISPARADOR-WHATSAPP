import prisma from '../prisma/client.js';

export class ContactService {
  async importContacts(contacts: { name: string; phone: string }[]) {
    // Upsert para evitar duplicados por telefone
    const results = [];
    for (const c of contacts) {
      const contact = await prisma.contact.upsert({
        where: { phone: c.phone },
        update: { name: c.name },
        create: { name: c.name, phone: c.phone }
      });
      results.push(contact);
    }
    return results;
  }
}

export const contactService = new ContactService();
