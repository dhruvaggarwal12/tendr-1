const { createClient } = require('redis');
const config = require('./index');

const redisClient = createClient({
    username: config.REDIS_USERNAME || 'default',
    password: config.REDIS_PASSWORD,
    socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await redisClient.connect();
    console.log('Connected to Redis!');
})();

// Promisified Redis commands
const getAsync = (...args) => redisClient.get(...args);
const setAsync = (...args) => redisClient.set(...args);
const delAsync = (...args) => redisClient.del(...args);

module.exports = {
    redisClient,
    getAsync,
    setAsync,
    delAsync
}; 