const { Pool } = require("pg");
const pool = new Pool({
  user: 'uapv2000019',
  host: 'pedago01C.univ-avignon.fr',
  database: 'etd',
  password: 'OO8xfk',
  port: 5432,
});
module.exports = pool;