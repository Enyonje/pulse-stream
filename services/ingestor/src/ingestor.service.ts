import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import WebSocket from 'ws';
import { TOPICS } from '@pulse/common';

@Injectable()
export class IngestorService implements OnModuleInit {
  private kafka = new Kafka({ clientId: 'ingestor', brokers: [process.env.KAFKA_BROKER!] });
  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
    this.streamBinance('btcusdt');
  }

  private streamBinance(symbol: string) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
    ws.on('message', async (data: string) => {
      const msg = JSON.parse(data);
      const tick = {
        source: 'binance',
        symbol: msg.s,
        ts: msg.T,
        price: parseFloat(msg.p)
      };
      await this.producer.send({
        topic: TOPICS.RAW,
        messages: [{ key: tick.symbol, value: JSON.stringify(tick) }]
      });
    });
    ws.on('error', err => console.error('binance ws error', err));
    ws.on('close', () => setTimeout(() => this.streamBinance(symbol), 2000));
  }
}