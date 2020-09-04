const { Pool } = require('pg');
var config = {
  connectionString : process.env.DATABASE_URL,
  ssl              : {
    rejectUnauthorized : false
  }
};
var pool = new Pool(config);

module.exports = pool;
