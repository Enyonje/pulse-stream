await redis.publish(
  "prices",
  JSON.stringify({
    type: "PRICE_UPDATE",
    data: price,
  })
);
