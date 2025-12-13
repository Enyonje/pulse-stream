import Redis from "ioredis";
const redis = new Redis("redis://redis:6379");

// when alert triggers
await redis.publish(
  "alerts",
  JSON.stringify({
    type: "ALERT_TRIGGERED",
    data: alert,
  })
);
