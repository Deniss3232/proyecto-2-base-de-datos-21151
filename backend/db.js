const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "proy2",
  host: process.env.DB_HOST || "db",
  database: process.env.DB_NAME || "tienda_refrescos",
  password: process.env.DB_PASSWORD || "secret",
  port: process.env.DB_PORT || 5432
});

module.exports = pool;