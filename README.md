# Kafka-Stream

Monorepo de aprendizado e prática de **Apache Kafka** com boas práticas de mercado em 2026.

Dois microsserviços Node.js + TypeScript integrados via Kafka: um **producer** expõe uma REST API e publica eventos; um **consumer** consome esses eventos e persiste no PostgreSQL via TypeORM.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20+ |
| Linguagem | TypeScript 5 (strict) |
| Mensageria | Apache Kafka (KafkaJS) |
| HTTP | Fastify |
| ORM | TypeORM |
| Banco | PostgreSQL 16 |
| Infra local | Docker Compose |
| Paradigma | Programação Funcional (Result type, pipe, sem mutação) |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Kafka-Stream Monorepo                │
│                                                         │
│  ┌──────────────┐   orders.created   ┌───────────────┐ │
│  │   Producer   │ ─────────────────► │   Consumer    │ │
│  │  (Fastify)   │                    │  (KafkaJS)    │ │
│  │  :3001       │   orders.created   │               │ │
│  │              │ ◄── DLQ ────────── │               │ │
│  └──────────────┘    .dlq            └───────┬───────┘ │
│                                              │         │
│                                         TypeORM        │
│                                              │         │
│                                       ┌──────▼──────┐  │
│                                       │  PostgreSQL │  │
│                                       │  events     │  │
│                                       │  orders     │  │
│                                       └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Boas práticas implementadas

- **Idempotência** — constraint `UNIQUE(topic, partition, offset)` na tabela `events` garante que mensagens reentregues não sejam processadas duas vezes
- **Dead Letter Queue (DLQ)** — mensagens que falham após todos os retries vão para `orders.created.dlq` para inspeção e replay manual
- **Exactly-once producer** — KafkaJS com `idempotent: true` evita duplicatas no broker
- **Retry com backoff exponencial** — consumer não rejeita mensagens imediatamente; tenta novamente com delay crescente
- **Graceful shutdown** — SIGTERM drena mensagens em vôo antes de fechar conexões
- **Result type** — sem `throw` em fluxos esperados; erros são valores explícitos
- **Partition key** — producer usa `customerId` como chave, garantindo ordem por cliente
- **Auto-create topics desabilitado** — topics criados explicitamente com partições e retenção configuradas
- **Transação no consumer** — audit log + persistência do pedido em uma única transação atômica

---

## Estrutura do monorepo

```
kafka-stream/
├── packages/
│   └── shared/               # Tipos, contratos e utilitários funcionais
│       └── src/index.ts      # KafkaEvent, Result, Topics, pipe...
├── services/
│   ├── producer/             # Microsserviço HTTP → Kafka
│   │   └── src/
│   │       ├── config/env.ts
│   │       ├── kafka/client.ts
│   │       ├── kafka/publisher.ts
│   │       ├── routes/orders.ts
│   │       └── main.ts
│   └── consumer/             # Microsserviço Kafka → PostgreSQL
│       └── src/
│           ├── config/env.ts
│           ├── database/data-source.ts
│           ├── entities/event.entity.ts
│           ├── entities/order.entity.ts
│           ├── repositories/order.repository.ts
│           ├── processors/order.processor.ts
│           ├── kafka/consumer.ts
│           └── main.ts
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml   # Kafka, Zookeeper, Schema Registry, PG, Kafka UI
│   │   └── postgres/init.sql
│   └── scripts/
│       └── create-topics.mjs   # Cria os topics antes de subir os serviços
├── tsconfig.base.json
├── package.json                # npm workspaces
└── .env.example
```

---

## Setup local

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/Yokuny/Kafka-Stream.git
cd Kafka-Stream
cp .env.example .env
npm install
```

### 2. Subir a infra (Kafka + PostgreSQL)

```bash
npm run infra:up
```

Aguarde ~30 segundos para o Kafka ficar healthy, então:

```bash
# Criar os topics no Kafka
node infra/scripts/create-topics.mjs
```

### 3. Rodar os serviços em modo dev

```bash
# Ambos simultaneamente
npm run dev

# Ou separados
npm run dev:producer
npm run dev:consumer
```

### 4. Testar

```bash
# Publicar um evento de pedido
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-001",
    "customerId": "customer-abc",
    "productId": "product-xyz",
    "quantity": 2,
    "amount": 149.90
  }'

# Health check
curl http://localhost:3001/health
```

### 5. Monitorar

- **Kafka UI**: http://localhost:8080 — visualize topics, mensagens, consumer groups
- **Schema Registry**: http://localhost:8081

---

## Fluxo de uma mensagem

```
POST /orders
    │
    ▼
Producer valida body (AJV via Fastify)
    │
    ▼
buildOrderCreatedEvent() — cria envelope com eventId (UUID), timestamp, version
    │
    ▼
publishOrderCreated() — envia para orders.created com chave = customerId
    │
    ▼ (Kafka broker)
    │
    ▼
Consumer recebe EachMessagePayload
    │
    ├─► parseOrderEvent()       — parse JSON → Result<OrderCreatedEvent>
    ├─► validateOrderPayload()  — valida campos → Result<OrderCreatedEvent>
    │
    ▼ (transação PostgreSQL)
    ├─► insertEventRecord()     — salva audit log (idempotency guard)
    ├─► upsertOrder()           — persiste pedido
    └─► updateEventStatus()     — marca como "processed"
    
    Em caso de falha → retry com backoff → DLQ
```

---

## Próximos passos (Fases seguintes)

- [ ] **Fase 3** — Migrations TypeORM (substituir init.sql)
- [ ] **Fase 4** — Testes de integração com Testcontainers
- [ ] **Fase 5** — Schema Registry com Avro (serialização tipada)
- [ ] **Fase 6** — Observabilidade: OpenTelemetry + traces distribuídos
- [ ] **Fase 7** — Docker multi-stage build + Dockerfile para cada serviço
