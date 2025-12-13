# Pulse Stream

Real-time trading intelligence platform: event-driven microservices, Redis/WebSocket streaming, and a React dashboard.

## Stack
- Redpanda (Kafka-compatible), TimescaleDB, Redis
- Microservices: auth, user-prefs, price-api, alert-engine, processor, ws-gateway, trade-executor
- Frontend: React/Vite/Tailwind
- Orchestration: Docker Compose

## Quick start
1. Copy `.env.example` to `.env` and fill values.
2. Build and start:
   ```bash
   docker compose build
   docker compose up -d
