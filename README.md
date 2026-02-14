# Sistema de Automação de WhatsApp (Backend)

Sistema robusto para gestão de contatos, envio de mensagens em massa e orquestração de fluxos automáticos de comunicação via WhatsApp.

**Adaptação Local:** Este projeto foi configurado para rodar com `tsx` e filas em memória (Mock), eliminando a necessidade de Docker/Redis para desenvolvimento.

## 🚀 Como Rodar (Simplificado)

1.  **Instale as dependências:**

    ```bash
    npm install
    ```

2.  **Prepare o Banco de Dados (Primeira vez):**

    ```bash
    npx prisma migrate dev --name init
    ```

3.  **Crie dados de teste (Opcional):**

    ```bash
    npm run seed
    ```

4.  **Inicie o Sistema (API + Workers):**
    ```bash
    npm run start:dev
    ```
    _O servidor iniciará em `http://localhost:3000`_

## 🧪 Testando (PowerShell ou Bash)

**1. Verificar Status:**
Abra no navegador: [http://localhost:3000](http://localhost:3000)

**2. Disparar Campanha:**

```powershell
curl -Uri "http://localhost:3000/campaigns" -Method Post -ContentType "application/json" -Body '{"message": "Ola, oferta imperdivel!", "delayMin": 1, "delayMax": 5}'
```

**3. Criar Fluxo Automático:**

```powershell
curl -Uri "http://localhost:3000/flows" -Method Post -ContentType "application/json" -Body '{"name": "Boas Vindas", "steps": [{"order": 1, "delayMinutes": 0, "message": "Bem vindo!"}, {"order": 2, "delayMinutes": 1, "message": "Veja nosso catalogo."}]}'
```

**4. Ativar Fluxo para Todos:**

```powershell
curl -Uri "http://localhost:3000/flows/1/attach-list" -Method Post -ContentType "application/json" -Body '{}'
```

## 🏗 Estrutura do Projeto

- `src/app.ts`: API Fastify.
- `src/workers`: Processadores de fila (WhatsApp e Fluxos).
- `src/services`: Lógica de negócio (Mock WhatsApp, Contatos).
- `src/queues`: Configuração de filas (Factory para Mock/Redis).
- `src/server.ts`: Entrypoint unificado para desenvolvimento.

## 🔧 Solução de Problemas e Adaptações (Windows/Node 24)

Este projeto contém adaptações específicas para rodar em ambientes de desenvolvimento Windows sem Docker:

1.  **Ausência de Docker/Redis:**
    - **Problema:** O sistema original depende do Redis para gerenciar filas (BullMQ). Sem Docker instalado, a conexão falhava (`ECONNREFUSED`).
    - **Solução:** Implementação de um `MockQueue` (Fila em Memória) que simula o comportamento do BullMQ/Redis usando `EventEmitter` e `setTimeout`. Isso permite testar toda a lógica de negócio sem infraestrutura externa.

2.  **Compatibilidade Node v24 + `ts-node`:**
    - **Problema:** O executor `ts-node/esm` apresentou incompatibilidade com a versão experimental do Node v24 (`triggerUncaughtException`), impedindo a inicialização.
    - **Solução:** Migração para o executor **`tsx`**, que é mais moderno, rápido e compatível com as versões recentes do Node e módulos ES (ESM).

3.  **Logs não apareciam (Processos Separados):**
    - **Problema:** Ao rodar API e Worker em terminais separados (`start:api` e `start:worker`), a fila em memória (Mock) não funcionava, pois cada processo tinha sua própria memória isolada.
    - **Solução:** Criação do script `npm run start:dev` que executa o arquivo `src/server.ts`. Esse arquivo inicia tanto a API quanto os Workers no **mesmo processo Node.js**, permitindo o compartilhamento de memória e o funcionamento correto da fila Mock.

## 🤖 Desenvolvimento Colaborativo com IA

Este projeto utilizou Inteligência Artificial como ferramenta de suporte técnico avançado ("Pair Programming"). A IA foi fundamental para:

1.  **Diagnóstico Rápido:** Identificação e correção de incompatibilidades entre bibliotecas (`ts-node` vs Node 24).
2.  **Arquitetura Adaptativa:** Brainstorming para criar a solução de `MockQueue`, contornando limitações de infraestrutura local (Docker/Windows) sem sacrificar a qualidade do código.
3.  **Automação:** Geração de scripts de setup e scaffolding inicial do banco de dados.
