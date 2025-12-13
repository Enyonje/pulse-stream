import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { randomUUID } from 'crypto';
import { TOPICS } from '@pulse/common';

@Injectable()
export class EnricherService implements OnModuleInit {
  private kafka = new Kafka({ clientId: 'enricher', brokers: [process.env.KAFKA_BROKER!] });
  private consumer = this.kafka.consumer({ groupId: 'enricher-group' });
  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.consumer.subscribe({ topic: TOPICS.RAW, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const raw = JSON.parse(message.value!.toString());
        const enriched = {
          ...raw,
          trace_id: randomUUID(),
          ingest_latency_ms: Math.max(0, Date.now() - raw.ts)
        };
        await this.producer.send({
          topic: TOPICS.ENRICHED,
          messages: [{ key: enriched.symbol, value: JSON.stringify(enriched) }]
        });
      }
    });
  }
}