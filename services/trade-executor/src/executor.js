await redis.publish(
  "trades",
  JSON.stringify({
    type: "TRADE_EXECUTED",
    data: trade,
  })
);
