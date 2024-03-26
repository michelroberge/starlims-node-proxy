const { getCache, setCache } = require('../redis');

const cacheMiddleware = async (req, res, next) => {
    req.cache = {
        get: async (key) => await getCache(key),
        set: async (key, value, ttl) => await setCache(key, value, ttl)
    };
    next();
};

module.exports = cacheMiddleware;
