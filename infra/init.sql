CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS metrics_ticks (
  symbol TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  avg DOUBLE PRECISION,
  stddev DOUBLE PRECISION,
  zscore DOUBLE PRECISION,
  pct_change DOUBLE PRECISION,
  PRIMARY KEY (symbol, ts)
);

SELECT create_hypertable('metrics_ticks', 'ts', if_not_exists => TRUE);