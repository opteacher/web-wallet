const redis = require("redis");
const redisCfg = require("../config/db").redis;
module.exports = redis.createClient(redisCfg);