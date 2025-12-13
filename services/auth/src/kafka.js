import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "auth-service",
  brokers: [process.env.KAFKA_BROKER || "redpanda:9092"]
});

export const producer = kafka.producer();

export async function initKafka() {
  await producer.connect();
  console.log("Auth service connected to Kafka");
}
