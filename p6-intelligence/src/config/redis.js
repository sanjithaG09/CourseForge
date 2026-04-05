const Redis = require('ioredis');

// P5 ↔ P6 Agreement: All P6 keys prefixed with 'p6:'
const connection = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

module.exports = { connection };