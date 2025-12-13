import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { TOPICS } from '@pulse/common';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private kafka = new Kafka({ clientId: 'notifications', brokers: [process.env.KAFKA_BROKER!] });
  private consumer = this.kafka.consumer({ groupId: 'notifications-group' });
  private queue = new Queue('alerts-queue', { connection: { host: process.env.REDIS_HOST!, port: Number(process.env.REDIS_PORT!) } });
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! }
  });

  async onModuleInit() {
    new Worker('alerts-queue', async job => {
      const { email, subject, text } = job.data;
      await this.transporter.sendMail({ from: 'alerts@pulsestream.io', to: email, subject, text });
    }, { connection: { host: process.env.REDIS_HOST!, port: Number(process.env.REDIS_PORT!) } });

    await this.consumer.connect();
    await this.consumer.subscribe({ topic: TOPICS.ALERTS, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const alert = JSON.parse(message.value!.toString());
        await this.queue.add('send-email', {
          email: process.env.ALERT_TEST_EMAIL!,
          subject: `[PulseStream] ${alert.symbol} ${alert.type}`,
          text: `Anomaly: ${JSON.stringify(alert)}`
        });
      }
    });
  }
}