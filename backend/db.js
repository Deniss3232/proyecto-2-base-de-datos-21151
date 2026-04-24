const { Pool } = require("pg");

const pool = new Pool({
  user: "proy2",
  host: "localhost",
  database: "tienda_refrescos",
  password: "secret",
  port: 5432
});

module.exports = pool;