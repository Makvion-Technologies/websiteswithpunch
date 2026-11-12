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
