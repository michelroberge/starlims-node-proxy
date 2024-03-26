const redis = require('redis');
const cache = require('memory-cache'); // fallback
const redisUrl = `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`;
const redisPassword = process.env.REDIS_PASSWORD; // If required

let redisClient;
let isConnected = false;

function connectToRedis() {
    console.log('Attempting Redis connection...');
    redisClient = redis.createClient({ url: redisUrl, password: redisPassword });

    redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        isConnected = false;
        // Attempt to reconnect after 5 minutes
        setTimeout(connectToRedis, 5 * 60 * 1000);
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
        isConnected = true;
    });
}

connectToRedis();

module.exports = {
    getCache: async function (key) {
        // Check local cache first
        const cachedValue = cache.get(key);
        if (cachedValue) {
            return cachedValue;
        }

        try {
            if (isConnected) {                
                const value = await redisClient.get(key);
                return JSON.parse(value);
            }
            else{
                console.warn('Not connected to Redis, relying on local cache.');
                return null;
            }
        } catch (err) {
            console.error('Error fetching cached value:', err);
            return null; // Or throw an error if preferred
        }
    },
    setCache: async function (key, value, ttl = 3600) { // Default TTL of 1 hour
        try {
            if (isConnected) {

                await redisClient.set(key, JSON.stringify(value));
                if (ttl > 0) {
                    await redisClient.expire(key, ttl);
                }
            } 
            else{
                console.warn('Not connected to Redis, relying on local cache.');
            }
            // Update local cache as well
            cache.put(key, value, ttl * 1000); // Convert to milliseconds
    } catch(err) {
        console.error('Error setting cached value:', err);
        // Handle error or try again
        // For simplicity, here you could just update local cache and retry later
        cache.put(key, value, ttl * 1000);
    }
}
};
