const NodeCache = require("node-cache");

// Initialize in-memory cache instance with a standard TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = cache;
