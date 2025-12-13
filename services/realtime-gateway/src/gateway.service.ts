import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { Kafka } from 'kafkajs';
import jwt from 'jsonwebtoken';
import { TOPICS } from '@pulse/common';

@Injectable()
export class GatewayService implements OnModuleInit {
  private io = new Server(Number(process.env.GATEWAY_PORT ?? 8080), { cors: { origin: '*' } });
  private kafka = new Kafka({ clientId: 'gateway', brokers: [process.env.KAFKA_BROKER!] });
  private consumer = this.kafka.consumer({ groupId: 'gateway-group' });

  async onModuleInit() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      try {
        jwt.verify(token, process.env.JWT_SECRET!);
        next();
      } catch {
        next(new Error('unauthorized'));
      }
    });

    this.io.on('connection', socket => {
      socket.on('subscribe', (symbol: string) => socket.join(`symbol:${symbol}`));
      socket.on('unsubscribe', (symbol: string) => socket.leave(`symbol:${symbol}`));
    });

    await this.consumer.connect();
    await this.consumer.subscribe({ topic: TOPICS.METRICS, fromBeginning: false });
    await this.consumer.subscribe({ topic: TOPICS.ALERTS, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value!.toString());
        const room = `symbol:${payload.symbol}`;
        this.io.to(room).emit(topic, payload);
      }
    });
  }
}