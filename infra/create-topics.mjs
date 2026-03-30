import { Kafka } from 'kafkajs';

const BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';

const kafka = new Kafka({
  clientId: 'topic-creator',
  brokers: BROKERS.split(','),
});

const admin = kafka.admin();

const createTopics = async () => {
  console.log('Connecting to Kafka admin...');
  await admin.connect();

  const topics = [
    {
      topic: 'support-ticket.created',
      numPartitions: 3,
      replicationFactor: 1,
    },
    {
      topic: 'support-ticket.created.dlq',
      numPartitions: 3,
      replicationFactor: 1,
    },
  ];

  console.log(
    'Creating topics:',
    topics.map((t) => t.topic)
  );
  await admin.createTopics({
    topics,
    waitForLeaders: true,
  });

  console.log('Topics created successfully');
  await admin.disconnect();
};

createTopics().catch(console.error);
