# Kafka-Stream

O projeto é um MVP de arquitetura baseada em eventos (Event-Driven Architecture) utilizando node, monorepo (PNPM) e Kafka. A stack foca no ecossistema e ferramentas modernas para a separação de responsabilidades (comunicação assíncrona entre um produtor e um consumidor).

## 🚀 Arquitetura e como as partes se relacionam

A estrutura adere a um padrão de **monorepo** isolado nos seguintes blocos lógicos:

* **`packages/shared`**: 
  Funciona como um contrato estrito entre os serviços. Exporta o tipo `KafkaEvent<T>`, além da estrutura funcional `Result<T,E>` para tratamento de erros puramente funcionais e o registro de tópicos do negócio. *Nenhum serviço depende de outro, apenas dependem do `shared`.*
  
* **`services/producer`**:
  Api REST usando *Fastify* rodando na porta `3001`. Recebe solicitações POST na rota `/support-ticket`, valida a requisição, empacota em um evento formal de sistema (através da assinatura construída no *shared*) e **publica o evento** (`support-ticket.created`) de forma idempotente para o Kafka.

* **`services/consumer`**:
  Um Worker puro que roda em background sem portas HTTP. Ouve continuamente o tópico `support-ticket.created`, passando seus eventos por um pipeline funcional e salva de maneira final o ticket num banco local (PostgreSQL via TypeORM). Há implementações de *retry logging* (Exponencial) que enviam a mensagem estragada para um outro tópico, a DLQ (`support-ticket.created.dlq`) caso falhe várias vezes.

* **`Infra`** (Docker Compose): 
  O ambiente encapsulado de dependências: *Kafka*, *Zookeeper* (necessário para clusters gerenciarem brokers do Kafka), *PostgreSQL* para o banco de dados final e um painel visual do *Kafka UI* acessível para debugar eventos que passam pelo pipeline.

---

## 📦 Dependências Necessárias

- [Node.js](https://nodejs.org/) (v20+ recomendado)
- [PNPM](https://pnpm.io/) (v10+ recomendado)
- [Docker](https://www.docker.com/) e Docker Compose

---

## 🔧 Como rodar o projeto

**1.** Configure as dependências locais no workspace inteiro do PNPM:
```bash
pnpm install
```

**2.** Suba a infraestrutura do Datahub (Bancos e Kafka Node):
```bash
pnpm run infra:up
```

**3.** Crie os tópicos do Kafka (antes de colocar os serviços no ar):
```bash
pnpm run topics:create
```

**4.** Inicie o **Producer**:
*Em um terminal, inicie o container da API rest (produtor)*
```bash
pnpm run dev:producer
```

**5.** Inicie o **Consumer**:
*Em um segundo terminal, inicie o Worker de armazenamento*
```bash
pnpm run dev:consumer
```

---

## 🧪 Como testar e ver o que ele faz

Uma vez que toda a sua infraestrutura e ambos os serviços estão online, você pode abrir tickets de suporte e ver como o sistema age de forma interconectada por trás dos panos:

**1. Faça uma API Request:**
Em outro terminal paralelo ou utilizando alguma ferramenta como Postman/Insomnia/cURL, dispare a rota:
```bash
curl -X POST http://localhost:3001/support-ticket \
-H "Content-Type: application/json" \
-d '{
  "ticketId": "8f8e0b0e-6b99-4c3e-9bf8-9d8e7c6ac510",
  "userId": "user-123",
  "currentPage": "/dashboard",
  "previousPage": "/login",
  "message": "Não consigo acessar o relatório",
  "currentError": "403 Forbidden"
}'
```

**2. Acompanhe a Viagem do Evento no Console:**
- **Terminal do Producer**: Você deve conseguir ver a atividade do Fastify validando a requisição e mandando o evento pro ar junto de uma resposta HTTP 201 Created.
- **Terminal do Consumer**: Assim que mandado pro ar, de forma instantânea o processo worker vai imprimir a captura da transação `support-ticket.created` e processá-la. Caso a transação der erro transacional no banco, você vai conseguir perceber o algoritmo de retry tentando processar o evento multiplas vezes até jogá-lo na DLQ (Dead Letter Queue).

**3. Teste usando visualizações (Kafka UI & Database):**
Você pode acompanhar em TEMPO REAL através da Web as publicações e as tabelas:
- Abra seu navegador no painel [http://localhost:8080](http://localhost:8080) (`Kafka UI`). Vá no cluster mapeado em **Topics** e abra o `support-ticket.created`. Navegue para a tab **Messages** e lá estará o seu evento rastreável listado!
- Você pode se conectar ao BD PostgreSQL no `localhost:5432` com as credenciais configuradas (`kafkastream`:`kafkastream`) usando seu cliente SQL preferido para confirmar se o consumo gerou dados materializados.
