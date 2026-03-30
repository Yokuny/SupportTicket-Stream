# Kafka-Stream — Arquitetura e Convenções

## Visão Geral

Monorepo PNPM com arquitetura **event-driven** baseada em **Layered Architecture**. Todo o código de lógica é escrito em **programação funcional** — sem classes para regras de negócio.

```
packages/shared/        # Contratos compartilhados (schemas, types, utils)
services/producer/      # API REST (Fastify) — recebe requests e publica eventos Kafka
services/consumer/      # Worker — consome eventos Kafka e persiste no PostgreSQL
infra/                  # Docker Compose (Kafka, Zookeeper, PostgreSQL, Kafka UI)
```

---

## Camadas (Layered Architecture)

```
Route → Handler (inline) → Publisher / Repository → Database / Kafka
```

| Camada | Localização | Responsabilidade |
|--------|-------------|-----------------|
| **config** | `src/config/env.ts` | Validação de variáveis de ambiente via Zod |
| **routes** | `src/routes/*.ts` | Definição de endpoints + validação de body via middleware |
| **kafka** | `src/kafka/*.ts` | Producer: build + publish de eventos. Consumer: parse + processamento |
| **repositories** | `src/repositories/*.ts` | Acesso ao banco via TypeORM — apenas operações de persistência |
| **database/entities** | `src/database/entities/*.ts` | Definição de entidades TypeORM com `EntitySchema` (sem classes) |
| **middlewares** | `src/middlewares/*.ts` | Validação de request com Zod |

---

## Regras de Código

### Programação funcional — sem classes
Todo código de negócio é exportado como funções. Não use `class` para serviços, repositories ou handlers.

```typescript
// CORRETO
export const saveSupportTicket = async (dataSource: DataSource, ticket: SupportTicket) => { ... };

// ERRADO
class SupportTicketRepository {
  async save(ticket: SupportTicket) { ... }
}
```

### Entities TypeORM com EntitySchema
Use `EntitySchema` em vez de decorators `@Entity()` para manter o estilo funcional.

```typescript
export const SupportTicketEntity = new EntitySchema<SupportTicket>({
  name: 'support_tickets',
  columns: { ... },
});
```

### Zod como fonte única de tipos
Schemas Zod no `packages/shared` são a fonte de verdade para validação e tipagem.

```typescript
export const SupportTicketPayloadSchema = z.object({ ... });
export type SupportTicketPayload = z.infer<typeof SupportTicketPayloadSchema>;
```

### Barrel exports (index.ts)
Sempre exporte via `index.ts`. Nunca importe diretamente de arquivos internos fora do seu próprio módulo.

```typescript
// CORRETO
import { saveSupportTicket } from '../repositories/index.js';

// EVITAR
import { saveSupportTicket } from '../repositories/support-ticket.repository.js';
```

### Nomenclatura de arquivos
`dominio.camada.ts` — ex: `support-ticket.entity.ts`, `support-ticket.repository.ts`, `support-ticket.processor.ts`

---

## Domínio: Support Ticket

### Payload (POST /support-ticket)
```json
{
  "ticketId": "string",
  "userId": "string",
  "currentPage": "string",
  "previousPage": "string",
  "message": "string",
  "currentError": "string"
}
```

### Fluxo completo
1. Cliente envia `POST /support-ticket` ao Producer (porta 3001)
2. Producer valida o body com `SupportTicketPayloadSchema`
3. Producer constrói `KafkaEvent<SupportTicketPayload>` e publica no tópico `support-ticket.created`
4. Consumer recebe a mensagem, valida com `SupportTicketCreatedEventSchema`
5. Consumer persiste o ticket na tabela `support_tickets` via TypeORM

### Tópicos Kafka
- `support-ticket.created` — tópico principal (3 partições)
- `support-ticket.created.dlq` — dead letter queue para mensagens com falha

---

## Variáveis de Ambiente

### Producer
```env
PRODUCER_PORT=3001
PRODUCER_LOG_LEVEL=info
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=producer-name
KAFKA_TOPIC_SUPPORT_TICKET=support-ticket.created
KAFKA_TOPIC_SUPPORT_TICKET_DLQ=support-ticket.created.dlq
```

### Consumer
```env
NODE_ENV=development
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=consumer-name
KAFKA_GROUP_ID_CONSUMER=consumer-group-name
KAFKA_TOPIC_SUPPORT_TICKET=support-ticket.created
KAFKA_TOPIC_SUPPORT_TICKET_DLQ=support-ticket.created.dlq
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=kafkastream
POSTGRES_PASSWORD=kafkastream
POSTGRES_DB=kafkastream
POSTGRES_SSL=false
CONSUMER_LOG_LEVEL=info
CONSUMER_MAX_RETRIES=3
CONSUMER_RETRY_DELAY_MS=1000
```

---

## Comandos

```bash
pnpm install              # Instalar dependências
pnpm run infra:up         # Subir Docker (Kafka + PostgreSQL)
pnpm run topics:create    # Criar tópicos Kafka
pnpm run dev:producer     # Iniciar producer (porta 3001)
pnpm run dev:consumer     # Iniciar consumer
pnpm run build            # Compilar TypeScript
pnpm run lint             # Lint com Biome
```

---

## Shared Package

O pacote `@kafka-stream/shared` é o contrato entre producer e consumer. Nunca importe diretamente entre os serviços — use apenas o shared.

```
packages/shared/src/
├── constants/topics.ts         # Enum de tópicos Kafka
├── interfaces/                 # Types TypeScript (inferidos dos schemas Zod)
├── schemas/                    # Schemas Zod (validação + tipagem)
└── utils/result.ts             # Result<T,E> monad para tratamento funcional de erros
```
