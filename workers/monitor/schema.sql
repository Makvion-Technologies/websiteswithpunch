-- Websites With Punch monitor (Cloudflare D1). Rows are written only when something changes,
-- plus one row per batch per minute, to stay inside the free plan's 100,000 writes a day.
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL, at INTEGER NOT NULL);
-- Per-site incident state. incident = 1 after a confirmed outage until it recovers.
CREATE TABLE IF NOT EXISTS state (
  id TEXT PRIMARY KEY,
  incident INTEGER NOT NULL DEFAULT 0,
  since INTEGER NOT NULL DEFAULT 0,
  disputed_until INTEGER NOT NULL DEFAULT 0
);
-- Ring buffer of check results: slot = "<minute % 120>:<batch>", overwritten two hours later.
CREATE TABLE IF NOT EXISTS slots (
  slot TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  shard INTEGER NOT NULL,
  data TEXT NOT NULL
);
-- Heartbeat (cron job) monitors. Config is copied from the app; pings land here, never in the
-- app's database. A ping is stored at most once per 30 s per heartbeat (5 min after 300 in a day).
-- state: 0 waiting for the first ping, 1 up, 2 missed (reported to the app).
CREATE TABLE IF NOT EXISTS hb (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  period INTEGER NOT NULL,
  grace INTEGER NOT NULL,
  paused INTEGER NOT NULL DEFAULT 0,
  state INTEGER NOT NULL DEFAULT 0,
  since INTEGER NOT NULL DEFAULT 0,
  last_ping INTEGER NOT NULL DEFAULT 0,
  due_at INTEGER NOT NULL DEFAULT 0,
  day INTEGER NOT NULL DEFAULT 0,
  n INTEGER NOT NULL DEFAULT 0,
  cnt INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS hb_due ON hb (state, due_at);
