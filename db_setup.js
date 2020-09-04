const { Pool } = require('pg');
var config = {
  connectionString        : process.env.DATABASE_URL,
  ssl                     : {
    rejectUnauthorized : false
  },
  max                     : 5,
  idleTimeoutMillis       : 10000,
  connectionTimeoutMillis : 2000
};
var pool = new Pool(config);

module.exports = pool;
