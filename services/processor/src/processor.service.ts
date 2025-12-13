import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { Pool } from 'pg';
import { TOPICS } from '@pulse/common';

@Injectable()
export class ProcessorService implements OnModuleInit {
  private kafka = new Kafka({ clientId: 'processor', brokers: [process.env.KAFKA_BROKER!] });
  private consumer = this.kafka.consumer({ groupId: 'processor-group' });
  private producer = this.kafka.producer();
  private pg = new Pool({ connectionString: process.env.DATABASE_URL });

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.consumer.subscribe({ topic: TOPICS.ENRICHED, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const e = JSON.parse(message.value!.toString());
        // TODO: rolling window + anomaly detection logic
        console.log('Processor received:', e);
      }
    });
  }
}