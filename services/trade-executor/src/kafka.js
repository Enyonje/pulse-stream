import { Kafka } from 'kafkajs';
import logger from './logger.js';

export function createKafka(broker) {
  const kafka = new Kafka({
    clientId: process.env.EXECUTOR_NAME || 'trade-executor',
    brokers: [broker],
    retry: { retries: 5 }
  });
  return kafka;
}

export async function createConsumer(kafka, groupId = 'trade-executor-group') {
  const consumer = kafka.consumer({ groupId });
  consumer.on(consumer.events.CRASH, e => logger.error({ err: e.payload.error }, 'Kafka consumer crash'));
  consumer.on(consumer.events.GROUP_JOIN, e => logger.info({ groupId, payload: e.payload }, 'Kafka group joined'));
  return consumer;
}

export async function createProducer(kafka) {
  const producer = kafka.producer();
  producer.on(producer.events.CRASH, e => logger.error({ err: e.payload.error }, 'Kafka producer crash'));
  return producer;
}