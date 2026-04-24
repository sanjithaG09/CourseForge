const Redis = require('ioredis');

// P5 ↔ P6 Agreement: All P6 keys prefixed with 'p6:'
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: 3,       // was null (infinite retries — hangs requests)
  retryStrategy: (times) => {
    if (times > 3) return null;  // stop retrying after 3 attempts
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,             // don't crash server on startup if Redis is down
});

// Logs
redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redis;
